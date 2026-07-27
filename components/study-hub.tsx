'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  FileText, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  BookOpen,
  PlusCircle,
  FileCheck,
  ExternalLink
} from 'lucide-react'
import { 
  addStudyMaterialAction, 
  approveStudyMaterialAction, 
  deleteStudyMaterialAction,
  addClassDocumentAction,
  deleteClassDocumentAction
} from '@/app/officer-dashboard/actions'
import { useToast } from '@/components/ui/toast'
import {
  Task,
  StudyMaterial,
  ClassDocument,
  Course,
  Week,
  UserType
} from './study-hub/types'
import { getEmbeddableUrl, parseObsidianMarkdown } from './study-hub/utils'
import { ClassDocumentsSection, ClassDocumentItem } from './study-hub/class-documents-section'
import { StudyMaterialCard } from './study-hub/study-material-card'

const EmbedViewerModal = dynamic(
  () => import('./study-hub/embed-viewer-modal').then(m => m.EmbedViewerModal),
  {
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/10 min-h-[300px] md:min-h-[400px] animate-pulse">
        Loading projection viewer...
      </div>
    ),
    ssr: false
  }
)

const AddStudyMaterialModal = dynamic(
  () => import('./study-hub/add-study-material-modal').then(m => m.AddStudyMaterialModal),
  {
    loading: () => null,
    ssr: false
  }
)

const ObsidianMarkdownViewer = dynamic(
  () => import('./study-hub/obsidian-markdown-viewer').then(m => m.ObsidianMarkdownViewer),
  {
    loading: () => (
      <div className="md:col-span-9 bg-card border border-border rounded-3xl p-8 shadow-sm min-h-[500px] flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Loading document viewer...
      </div>
    ),
    ssr: false
  }
)

export { getEmbeddableUrl }

interface StudyHubProps {
  initialMaterials: StudyMaterial[]
  courses: Course[]
  weeks: Week[]
  tasks: Task[]
  dbError?: boolean
  user: UserType | null
  initialClassDocs?: ClassDocument[]
}

export function StudyHub({
  initialMaterials,
  courses,
  weeks,
  tasks,
  dbError = false,
  user,
  initialClassDocs = []
}: StudyHubProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'reviewers'>('docs')
  
  // Local documents data
  const defaultDocs: ClassDocumentItem[] = [
    { id: 'guidelines', title: 'Class Fund Guidelines', type: 'md', path: '/documents/guidelines.md', isDefault: true }
  ]
  const [docsList, setDocsList] = useState<ClassDocumentItem[]>(defaultDocs)
  const [selectedLocalDoc, setSelectedLocalDoc] = useState<ClassDocumentItem>(defaultDocs[0])
  const [mdContent, setMdContent] = useState<string>('')
  const [mdLoading, setMdLoading] = useState(false)

  // Document creation form state
  const [showDocModal, setShowDocModal] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocType, setNewDocType] = useState<'pdf' | 'md'>('md')
  const [newDocSource, setNewDocSource] = useState<'link' | 'write'>('write')
  const [newDocLink, setNewDocLink] = useState('')
  const [newDocContent, setNewDocContent] = useState('')

  // Load class documents from database on mount
  useEffect(() => {
    if (initialClassDocs && initialClassDocs.length > 0) {
      const dbDocs: ClassDocumentItem[] = initialClassDocs.map(doc => ({
        id: `db_${doc.id}`,
        title: doc.title,
        type: doc.file_type || 'md',
        path: doc.file_url || '',
        content: doc.description || undefined,
        isDefault: false,
        isDb: true,
        dbId: doc.id,
        uploadedBy: doc.uploaded_by
      }))
      setDocsList([...defaultDocs, ...dbDocs])
    } else {
      const localDocsStr = localStorage.getItem('cft_local_class_docs')
      if (localDocsStr) {
        try {
          const parsed = JSON.parse(localDocsStr)
          setDocsList([...defaultDocs, ...parsed])
        } catch {
          setDocsList(defaultDocs)
        }
      }
    }
  }, [initialClassDocs])

  const [, setIsAddingDoc] = useState(false)
  
  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocTitle.trim()) return

    setIsAddingDoc(true)
    
    const fileUrl = newDocSource === 'link' ? newDocLink.trim() : undefined
    const fileType = newDocType

    const result = await addClassDocumentAction({
      title: newDocTitle.trim(),
      description: newDocSource === 'write' ? newDocContent : undefined,
      file_url: fileUrl,
      file_type: fileType
    })

    if (result.success) {
      toast.success(`Document "${newDocTitle.trim()}" added.`, 'Document Added')
      router.refresh()
      setIsAddingDoc(false)
      setShowDocModal(false)
      setNewDocTitle('')
      setNewDocLink('')
      setNewDocContent('')
    } else {
      const msg = result.error || 'Failed to add document'
      toast.error(msg, 'Document Addition Failed')
      setIsAddingDoc(false)
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    
    const doc = docsList.find(d => d.id === docId)
    if (doc?.isDb && doc.dbId) {
      if (!window.confirm('Are you sure you want to delete this class document?')) return
      
      const result = await deleteClassDocumentAction(doc.dbId)
      if (result.success) {
        toast.success(`Document "${doc.title}" deleted.`, 'Document Deleted')
        router.refresh()
      } else {
        const msg = result.error || 'Failed to delete document'
        toast.error(msg, 'Deletion Failed')
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this class document?')) return
      const updatedCustom = docsList.filter(d => !d.isDefault && d.id !== docId)
      localStorage.setItem('cft_local_class_docs', JSON.stringify(updatedCustom))
      const newList = [...defaultDocs, ...updatedCustom]
      setDocsList(newList)
      if (selectedLocalDoc.id === docId) {
        setSelectedLocalDoc(newList[0])
      }
    }
  }

  // Review Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>(initialMaterials)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)

  // Draggable panels state
  const [rightPanelWidth, setRightPanelWidth] = useState(280)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startWidth: rightPanelWidth
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const deltaX = e.clientX - dragRef.current.startX
      const newWidth = Math.max(200, Math.min(480, dragRef.current.startWidth - deltaX))
      setRightPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStudyType, setSelectedStudyType] = useState<string>('all')

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitTitle, setSubmitTitle] = useState('')
  const [submitDescription, setSubmitDescription] = useState('')
  const [submitLink, setSubmitLink] = useState('')
  const [submitCategory, setSubmitCategory] = useState('Quiz')
  const [submitStudyType, setSubmitStudyType] = useState('lesson')
  const [submitCourseId, setSubmitCourseId] = useState<string>('')
  const [submitWeekNumber, setSubmitWeekNumber] = useState<string>('')
  const [submitLessonName, setSubmitLessonName] = useState('')
  const [submitTaskName, setSubmitTaskName] = useState('')
  const [submitContributor, setSubmitContributor] = useState('')
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [fallbackMode, setFallbackMode] = useState(dbError)

  useEffect(() => {
    if (dbError) {
      setFallbackMode(true)
      const localMatsStr = localStorage.getItem('cft_local_materials')
      if (localMatsStr) {
        try {
          setMaterials(JSON.parse(localMatsStr))
        } catch {}
      }
    } else {
      setFallbackMode(false)
      setMaterials(initialMaterials)
    }
  }, [initialMaterials, dbError])

  useEffect(() => {
    if (selectedLocalDoc.type === 'md') {
      if (selectedLocalDoc.content !== undefined) {
        setMdContent(parseObsidianMarkdown(selectedLocalDoc.content))
        setMdLoading(false)
        return
      }
      setMdLoading(true)
      fetch(selectedLocalDoc.path)
        .then(res => {
          if (!res.ok) throw new Error('File not found')
          return res.text()
        })
        .then(text => {
          setMdContent(parseObsidianMarkdown(text))
        })
        .catch(() => {
          setMdContent('<p class="text-red-500 font-semibold p-4">Markdown file not found in public folder. Please upload guidelines.md to /public/documents/</p>')
        })
        .finally(() => setMdLoading(false))
    }
  }, [selectedLocalDoc])

  const saveMaterialLocally = (newMat: StudyMaterial) => {
    const updated = [newMat, ...materials]
    setMaterials(updated)
    localStorage.setItem('cft_local_materials', JSON.stringify(updated))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!submitTitle.trim() || !submitLink.trim()) {
      setSubmitError('Please fill in both the Title and the Link fields.')
      return
    }

    const pendingCount = materials.filter(m => !m.approved).length
    if (pendingCount >= 5) {
      const queueErrorMsg = 'Submission queue full. There are currently 5 pending submissions awaiting moderator review. Please try again later.'
      setSubmitError(queueErrorMsg)
      toast.error(queueErrorMsg, 'Queue Limit Reached')
      return
    }

    const payload = {
      title: submitTitle.trim(),
      description: submitDescription.trim() || undefined,
      link: submitLink.trim(),
      category: submitCategory,
      study_type: submitStudyType,
      course_id: submitCourseId ? Number(submitCourseId) : null,
      week_number: submitWeekNumber ? Number(submitWeekNumber) : null,
      lesson_name: submitStudyType === 'lesson' ? submitLessonName.trim() : null,
      task_name: submitStudyType === 'task' ? submitTaskName.trim() : null,
      submitted_by: submitContributor.trim() || 'Anonymous'
    }

    startTransition(async () => {
      if (fallbackMode) {
        const localMat: StudyMaterial = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          ...payload,
          approved: user ? true : false
        }
        saveMaterialLocally(localMat)
        setSubmitSuccessMsg(true)
        resetForm()
        return
      }

      try {
        const res = await addStudyMaterialAction(payload)
        if (res.success) {
          toast.success(`Reviewer material "${submitTitle.trim()}" submitted!`, 'Material Submitted')
          setSubmitSuccessMsg(true)
          resetForm()
        } else {
          const msg = res.error || 'Failed to submit.'
          setSubmitError(msg)
          toast.error(msg, 'Submission Failed')
        }
      } catch (err: unknown) {
        console.warn('DB Insert failed, using local storage fallback', err)
        setFallbackMode(true)
        const localMat: StudyMaterial = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          ...payload,
          approved: user ? true : false
        }
        saveMaterialLocally(localMat)
        toast.success(`Reviewer material "${submitTitle.trim()}" saved locally!`, 'Material Saved')
        setSubmitSuccessMsg(true)
        resetForm()
      }
    })
  }

  const resetForm = () => {
    setSubmitTitle('')
    setSubmitDescription('')
    setSubmitLink('')
    setSubmitCategory('Quiz')
    setSubmitStudyType('lesson')
    setSubmitCourseId('')
    setSubmitWeekNumber('')
    setSubmitLessonName('')
    setSubmitTaskName('')
    setSubmitContributor('')
  }

  const handleApprove = (id: number) => {
    startTransition(async () => {
      if (fallbackMode) {
        const updated = materials.map(m => m.id === id ? { ...m, approved: true } : m)
        setMaterials(updated)
        localStorage.setItem('cft_local_materials', JSON.stringify(updated))
        toast.success('Study material approved.', 'Approved')
        return
      }
      try {
        const res = await approveStudyMaterialAction(id)
        if (res.success) {
          setMaterials(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m))
          toast.success('Study material approved.', 'Approved')
        } else {
          const msg = res.error || 'Failed to approve.'
          toast.error(msg, 'Approval Failed')
        }
      } catch (err: unknown) {
        const msg = (err as Error).message || 'Error occurred.'
        toast.error(msg, 'Approval Failed')
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete/reject this reviewer link?')) return

    startTransition(async () => {
      if (fallbackMode) {
        const updated = materials.filter(m => m.id !== id)
        setMaterials(updated)
        localStorage.setItem('cft_local_materials', JSON.stringify(updated))
        if (selectedMaterial?.id === id) setSelectedMaterial(null)
        toast.success('Reviewer link deleted.', 'Deleted')
        return
      }
      try {
        const res = await deleteStudyMaterialAction(id)
        if (res.success) {
          setMaterials(prev => prev.filter(m => m.id !== id))
          if (selectedMaterial?.id === id) setSelectedMaterial(null)
          toast.success('Reviewer link deleted.', 'Deleted')
        } else {
          const msg = res.error || 'Failed to delete.'
          toast.error(msg, 'Deletion Failed')
        }
      } catch (err: unknown) {
        const msg = (err as Error).message || 'Error occurred.'
        toast.error(msg, 'Deletion Failed')
      }
    })
  }

  const approvedMaterials = materials.filter(m => m.approved)
  const pendingMaterials = materials.filter(m => !m.approved)

  const filteredApproved = approvedMaterials.filter(m => {
    const matchSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchCourse = selectedCourseId === 'all' || String(m.course_id) === selectedCourseId
    const matchCategory = selectedCategory === 'all' || m.category === selectedCategory
    const matchType = selectedStudyType === 'all' || m.study_type === selectedStudyType
    
    return matchSearch && matchCourse && matchCategory && matchType
  })

  return (
    <div className="flex flex-col gap-6 anim-fade-slide-in">
      {/* Tab Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between items-center gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 border border-border/40 rounded-2xl w-full sm:w-fit justify-center">
          <button
            onClick={() => setActiveSubTab('docs')}
            className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
              activeSubTab === 'docs'
                ? 'bg-card text-foreground shadow-sm border border-border/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Class Documents</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reviewers')}
            className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
              activeSubTab === 'reviewers'
                ? 'bg-card text-foreground shadow-sm border border-border/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Review Materials</span>
          </button>
        </div>

        {activeSubTab === 'reviewers' && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="min-h-[44px] text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 py-2 cursor-pointer press-spring flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto max-w-xs animate-fade-in"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Reviewer</span>
          </button>
        )}
      </div>

      {/* ─── TAB 1: CLASS DOCUMENTS ────────────────────────────────────────────── */}
      {activeSubTab === 'docs' && (
        <ClassDocumentsSection
          docsList={docsList}
          selectedLocalDoc={selectedLocalDoc}
          setSelectedLocalDoc={setSelectedLocalDoc}
          user={user}
          onOpenAddDocModal={() => setShowDocModal(true)}
          onDeleteDoc={handleDeleteDoc}
        >
          <ObsidianMarkdownViewer
            selectedLocalDoc={selectedLocalDoc}
            mdContent={mdContent}
            mdLoading={mdLoading}
          />
        </ClassDocumentsSection>
      )}

      {/* ─── TAB 2: REVIEW MATERIALS ──────────────────────────────────────────── */}
      {activeSubTab === 'reviewers' && (
        <div className="flex flex-col gap-6">
          {/* Moderator Pending Submissions Queue */}
          {user && pendingMaterials.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-3xl p-5 shadow-sm flex flex-col gap-4.5 anim-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Pending Moderator Review Queue ({pendingMaterials.length})</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">Moderator View</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {pendingMaterials.map(mat => {
                  const course = courses.find(c => c.id === mat.course_id)
                  return (
                    <div key={mat.id} className="bg-card border border-amber-500/20 dark:border-amber-900/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[8px] font-bold text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">{mat.category}</span>
                          <span className="text-[9px] text-muted-foreground truncate font-mono">by {mat.submitted_by}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">{mat.title}</h4>
                        {mat.description && <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{mat.description}</p>}
                        
                        <div className="flex flex-wrap gap-1 mt-1 text-[8px] font-bold">
                          {course && <span className="bg-blue-500/10 text-blue-700 px-1 py-0.25 rounded">{course.code}</span>}
                          {mat.study_type === 'week' && <span className="bg-purple-500/10 text-purple-700 px-1 py-0.25 rounded">Week {mat.week_number}</span>}
                          {mat.study_type === 'lesson' && mat.lesson_name && <span className="bg-green-500/10 text-green-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.lesson_name}</span>}
                          {mat.study_type === 'task' && mat.task_name && <span className="bg-indigo-500/10 text-indigo-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.task_name}</span>}
                        </div>
                        {mat.link.startsWith('data:application/pdf') ? (
                          <div className="text-[9px] text-red-600 dark:text-red-400 font-bold mt-1 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-md w-fit">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>Uploaded PDF File</span>
                          </div>
                        ) : (
                          <div className="text-[9px] text-primary truncate mt-1 underline flex items-center gap-0.5">
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{mat.link}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 border-t border-border/30 pt-3 mt-1">
                        <button
                          onClick={() => handleApprove(mat.id)}
                          className="min-h-[44px] flex-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1.5 cursor-pointer flex items-center justify-center gap-1 transition-all shadow-sm"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="min-h-[44px] min-w-[44px] text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-500/10 border border-red-500/20 rounded-xl p-1.5 cursor-pointer transition-all flex items-center justify-center"
                          title="Reject / Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search, Filter & Materials Explorer grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Filter Panel (Left) */}
            <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border/40 pb-2">
                <Filter className="h-4 w-4 text-primary" />
                <span>Search & Filter</span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course:</span>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="all">All Courses</option>
                  {courses.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="all">All Categories</option>
                  <option value="Quiz">Quiz Reviewer</option>
                  <option value="Exam">Exam Reviewer</option>
                  <option value="Lecture">Lecture Notes</option>
                  <option value="Other">Other Material</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Topic Type:</span>
                <select
                  value={selectedStudyType}
                  onChange={e => setSelectedStudyType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="all">All Topic Types</option>
                  <option value="lesson">Lesson-based</option>
                  <option value="week">Week-based</option>
                  <option value="task">Task-based</option>
                </select>
              </div>

              <div className="mt-2 p-3 bg-muted/40 rounded-2xl border border-border/30 text-[10px] text-muted-foreground flex flex-col gap-1">
                <span>📚 Total Materials: <strong>{approvedMaterials.length}</strong></span>
                <span>💡 Filter Matches: <strong>{filteredApproved.length}</strong></span>
                <span>⏳ Pending Review: <strong>{pendingMaterials.length}</strong></span>
              </div>
            </div>

            {/* List and Projection Panel */}
            <div className="lg:col-span-9 flex flex-col gap-4 items-stretch relative min-h-[450px] md:min-h-[750px] lg:min-h-[850px] animate-fade-in">
              <div className="flex-1 bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-0">
                <EmbedViewerModal
                  selectedMaterial={selectedMaterial}
                  courses={courses}
                  user={user}
                  isDragging={isDragging}
                  onDeleteMaterial={handleDelete}
                />
              </div>

              {/* Draggable Splitter Bar */}
              <div
                onMouseDown={handleMouseDown}
                className={`hidden md:block w-1 hover:w-2 hover:bg-primary/40 active:bg-primary cursor-col-resize self-stretch transition-all duration-150 rounded-full select-none ${
                  isDragging ? 'bg-primary/60 w-2 ring-4 ring-primary/10' : 'bg-border/20 hover:bg-border/60'
                }`}
                title="Drag to resize panels"
              />

              {/* Approved Materials List Panel */}
              <div 
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${rightPanelWidth}px` : 'auto' }}
                className="flex flex-col gap-2 md:max-h-[680px] overflow-y-auto pr-1.5 custom-scrollbar shrink-0 w-full md:w-auto"
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Approved Materials ({filteredApproved.length})</span>
                {filteredApproved.length === 0 ? (
                  <div className="bg-card border border-border border-dashed rounded-3xl py-12 px-4 text-center text-muted-foreground">
                    <Search className="h-6 w-6 mx-auto opacity-40 mb-1.5" />
                    <p className="text-xs font-bold text-foreground">No Materials Found</p>
                    <p className="text-[10px] mt-0.5">Try widening filters or submit the first reviewer!</p>
                  </div>
                ) : (
                  filteredApproved.map(mat => {
                    const isSelected = selectedMaterial?.id === mat.id
                    const course = courses.find(c => c.id === mat.course_id)
                    return (
                      <StudyMaterialCard
                        key={mat.id}
                        mat={mat}
                        isSelected={isSelected}
                        course={course}
                        onSelect={setSelectedMaterial}
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Submission Modal */}
      <AddStudyMaterialModal
        showSubmitModal={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        submitSuccessMsg={submitSuccessMsg}
        setSubmitSuccessMsg={setSubmitSuccessMsg}
        submitError={submitError}
        setSubmitError={setSubmitError}
        submitTitle={submitTitle}
        setSubmitTitle={setSubmitTitle}
        submitDescription={submitDescription}
        setSubmitDescription={setSubmitDescription}
        submitLink={submitLink}
        setSubmitLink={setSubmitLink}
        submitCategory={submitCategory}
        setSubmitCategory={setSubmitCategory}
        submitStudyType={submitStudyType}
        setSubmitStudyType={setSubmitStudyType}
        submitCourseId={submitCourseId}
        setSubmitCourseId={setSubmitCourseId}
        submitWeekNumber={submitWeekNumber}
        setSubmitWeekNumber={setSubmitWeekNumber}
        submitLessonName={submitLessonName}
        setSubmitLessonName={setSubmitLessonName}
        submitTaskName={submitTaskName}
        setSubmitTaskName={setSubmitTaskName}
        submitContributor={submitContributor}
        setSubmitContributor={setSubmitContributor}
        onSubmit={handleSubmit}
        isPending={isPending}
        courses={courses}
        weeks={weeks}
        tasks={tasks}
      />

      {/* Add Class Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowDocModal(false)}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md anim-modal-overlay-in"
          />

          <div className="relative bg-card text-foreground border border-border w-full max-w-lg rounded-3xl p-5 shadow-2xl z-10 anim-modal-card-in flex flex-col max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddDoc} className="flex flex-col gap-4">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-extrabold text-foreground">Add Class Document</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Upload a PDF link or write a custom Markdown document.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry Lab Guidelines"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Document Type</label>
                <select
                  value={newDocType}
                  onChange={e => setNewDocType(e.target.value as 'pdf' | 'md')}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="md">Markdown Document (Obsidian Style)</option>
                  <option value="pdf">PDF Document Link</option>
                </select>
              </div>

              {newDocType === 'md' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewDocSource('write')}
                      className={`min-h-[44px] py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center ${
                        newDocSource === 'write'
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Write Markdown Directly
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDocSource('link')}
                      className={`min-h-[44px] py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center ${
                        newDocSource === 'link'
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Provide Markdown URL
                    </button>
                  </div>
                </div>
              )}

              {(newDocType === 'pdf' || (newDocType === 'md' && newDocSource === 'link')) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {newDocType === 'pdf' ? 'PDF Document Link *' : 'Markdown File Link *'}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={newDocType === 'pdf' ? 'e.g. Google Drive PDF preview link' : 'e.g. https://domain.com/notes.md'}
                    value={newDocLink}
                    onChange={e => setNewDocLink(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                  {newDocType === 'pdf' && (
                    <span className="text-[8px] text-amber-600 dark:text-amber-500 font-bold px-1.5 py-0.5 bg-amber-500/10 rounded-lg w-fit">
                      ⚠️ Note: Ensure permissions are set to "Anyone with the link can view"!
                    </span>
                  )}
                </div>
              )}

              {newDocType === 'md' && newDocSource === 'write' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-semibold">Markdown Content</label>
                  <textarea
                    required
                    placeholder="# Welcome to my document&#10;&#10;Use ==highlights== and > [!info] callouts!"
                    value={newDocContent}
                    onChange={e => setNewDocContent(e.target.value)}
                    rows={8}
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all font-mono resize-y"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 mt-3 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer press-spring flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center justify-center"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
