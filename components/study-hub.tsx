'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Upload, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  HelpCircle, 
  ChevronRight, 
  BookOpen,
  PlusCircle,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import { 
  addStudyMaterialAction, 
  approveStudyMaterialAction, 
  deleteStudyMaterialAction,
  addClassDocumentAction,
  deleteClassDocumentAction
} from '@/app/officer-dashboard/actions'

interface SongPreview {
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

interface Task {
  id: number
  title: string
  due_date: string
  task_type: string
  is_private: boolean
}

interface StudyMaterial {
  id: number
  created_at: string
  title: string
  description?: string
  link: string
  category: string // 'Quiz', 'Exam', 'Lecture', 'Other'
  study_type: string // 'lesson', 'week', 'task'
  course_id: number | null
  week_number?: number | null
  lesson_name?: string | null
  task_name?: string | null
  submitted_by?: string
  approved: boolean
}

interface StudyHubProps {
  initialMaterials: StudyMaterial[]
  courses: any[]
  weeks: any[]
  tasks: Task[]
  dbError?: boolean
  user: any
  initialClassDocs?: ClassDocument[]
}

interface ClassDocument {
  id: string
  created_at: string
  title: string
  description?: string
  file_url?: string
  file_type?: string
  uploaded_by?: string
}

// ─── Direct URL Embed Parser ──────────────────────────────────────────────────
export function getEmbeddableUrl(url: string): { embedUrl: string | null; isEmbeddable: boolean; type: string } {
  if (!url) return { embedUrl: null, isEmbeddable: false, type: 'unknown' }

  try {
    const cleanUrl = url.trim()
    
    // Google Drive Sharing Links
    if (cleanUrl.includes('drive.google.com')) {
      // Handle /file/d/FILE_ID format
      const match = cleanUrl.match(/\/file\/d\/([^/]+)/)
      if (match && match[1]) {
        return {
          embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`,
          isEmbeddable: true,
          type: 'Google Drive'
        }
      }
      // Handle open?id=FILE_ID format
      const matchOpenId = cleanUrl.match(/[?&]open?id=([^&]+)/)
      if (matchOpenId && matchOpenId[1]) {
        return {
          embedUrl: `https://drive.google.com/file/d/${matchOpenId[1]}/preview`,
          isEmbeddable: true,
          type: 'Google Drive'
        }
      }
      // Handle id=FILE_ID format (for other query parameter styles)
      const matchId = cleanUrl.match(/[?&]id=([^&]+)/)
      if (matchId && matchId[1]) {
        return {
          embedUrl: `https://drive.google.com/file/d/${matchId[1]}/preview`,
          isEmbeddable: true,
          type: 'Google Drive'
        }
      }
      // Handle /folders/FOLDER_ID format
      const matchFolder = cleanUrl.match(/\/folders\/([^/?]+)/)
      if (matchFolder && matchFolder[1]) {
        return {
          embedUrl: `https://drive.google.com/embeddedfolderview?id=${matchFolder[1]}#grid`,
          isEmbeddable: true,
          type: 'Google Drive Folder'
        }
      }
    }

    // Google Docs/Slides/Sheets
    if (cleanUrl.includes('docs.google.com')) {
      if (cleanUrl.includes('/document/')) {
        const match = cleanUrl.match(/\/document\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/document/d/${match[1]}/preview`,
            isEmbeddable: true,
            type: 'Google Doc'
          }
        }
      }
      if (cleanUrl.includes('/presentation/')) {
        const match = cleanUrl.match(/\/presentation\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`,
            isEmbeddable: true,
            type: 'Google Slides'
          }
        }
      }
      if (cleanUrl.includes('/spreadsheets/')) {
        const match = cleanUrl.match(/\/spreadsheets\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/spreadsheets/d/${match[1]}/preview`,
            isEmbeddable: true,
            type: 'Google Sheets'
          }
        }
      }
    }

    // Direct PDFs
    if (cleanUrl.toLowerCase().endsWith('.pdf')) {
      return {
        embedUrl: cleanUrl,
        isEmbeddable: true,
        type: 'PDF Document'
      }
    }

    // General URL (non-embeddable due to same-origin security policies)
    return {
      embedUrl: cleanUrl,
      isEmbeddable: false,
      type: 'External Link'
    }
  } catch {
    return { embedUrl: url, isEmbeddable: false, type: 'unknown' }
  }
}

// ─── Obsidian Markdown Parsing Engine ─────────────────────────────────────────
function parseObsidianMarkdown(md: string): string {
  if (!md) return ''
  const lines = md.split('\n')
  const result: string[] = []
  let calloutBlock: { type: string; title: string; lines: string[] } | null = null

  const getCalloutStyles = (type: string) => {
    const t = type.toLowerCase()
    if (t === 'warning') return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-400 dark:border-amber-900', text: 'text-amber-800 dark:text-amber-300', icon: '⚠️' }
    if (t === 'danger' || t === 'error' || t === 'critical' || t === 'caution') return { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-400 dark:border-rose-900', text: 'text-rose-800 dark:text-rose-300', icon: '🚨' }
    if (t === 'tip' || t === 'success' || t === 'check') return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-400 dark:border-emerald-900', text: 'text-emerald-800 dark:text-emerald-300', icon: '💡' }
    return { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-400 dark:border-sky-900', text: 'text-sky-800 dark:text-sky-300', icon: 'ℹ️' }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    if (calloutBlock) {
      if (line.startsWith('>') || line.trim() === '>') {
        const content = line.replace(/^>\s?/, '')
        calloutBlock.lines.push(content)
        continue
      } else {
        const styles = getCalloutStyles(calloutBlock.type)
        const calloutContent = parseObsidianMarkdown(calloutBlock.lines.join('\n'))
        result.push(`
          <div class="my-4 p-4 rounded-2xl border-l-4 ${styles.bg} ${styles.border} ${styles.text}">
            <div class="flex items-center gap-2 font-bold mb-1.5 text-xs uppercase tracking-wider">
              <span>${styles.icon}</span>
              <span>${calloutBlock.title || calloutBlock.type}</span>
            </div>
            <div class="text-sm leading-relaxed">${calloutContent}</div>
          </div>
        `)
        calloutBlock = null
      }
    }

    if (line.startsWith('&gt; [!') || line.startsWith('> [!')) {
      const match = line.match(/^&gt;\s?\[!([^\]]+)\]\s?(.*)$/) || line.match(/^>\s?\[!([^\]]+)\]\s?(.*)$/)
      if (match) {
        calloutBlock = {
          type: match[1],
          title: match[2],
          lines: []
        }
        continue
      }
    }

    if (line.startsWith('# ')) {
      result.push(`<h1 class="text-2xl font-extrabold text-foreground border-b border-border/40 pb-2 mt-6 mb-3">${line.substring(2)}</h1>`)
      continue
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 class="text-xl font-bold text-foreground mt-5 mb-2.5">${line.substring(3)}</h2>`)
      continue
    }
    if (line.startsWith('### ')) {
      result.push(`<h3 class="text-lg font-bold text-foreground mt-4 mb-2">${line.substring(4)}</h3>`)
      continue
    }

    if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      result.push(`<div class="flex items-center gap-2.5 my-1.5 text-muted-foreground/75 line-through decoration-muted-foreground/50"><input type="checkbox" checked disabled class="accent-primary size-4 rounded cursor-not-allowed" /> <span class="text-sm font-sans">${line.substring(6)}</span></div>`)
      continue
    }
    if (line.startsWith('- [ ] ')) {
      result.push(`<div class="flex items-center gap-2.5 my-1.5 text-foreground"><input type="checkbox" disabled class="size-4 rounded border-border cursor-not-allowed" /> <span class="text-sm font-sans">${line.substring(6)}</span></div>`)
      continue
    }

    if (line.startsWith('- ')) {
      result.push(`<li class="list-disc list-inside ml-4 my-1 text-muted-foreground text-sm font-sans">${line.substring(2)}</li>`)
      continue
    }

    if (line.trim() === '') {
      result.push('<div class="h-2"></div>')
      continue
    }

    let inlineLine = line
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200/80 dark:bg-yellow-800/80 text-slate-900 dark:text-zinc-100 rounded px-1.5 py-0.5 font-semibold">$1</mark>')
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-semibold">$2</span>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-semibold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')

    result.push(`<p class="text-sm font-sans leading-relaxed text-muted-foreground my-1">${inlineLine}</p>`)
  }

  if (calloutBlock) {
    const styles = getCalloutStyles(calloutBlock.type)
    const calloutContent = parseObsidianMarkdown(calloutBlock.lines.join('\n'))
    result.push(`
      <div class="my-4 p-4 rounded-2xl border-l-4 ${styles.bg} ${styles.border} ${styles.text}">
        <div class="flex items-center gap-2 font-bold mb-1.5 text-xs uppercase tracking-wider">
          <span>${styles.icon}</span>
          <span>${calloutBlock.title || calloutBlock.type}</span>
        </div>
        <div class="text-sm leading-relaxed">${calloutContent}</div>
      </div>
    `)
  }

  return result.join('\n')
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
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'reviewers'>('docs')
  
  // Local documents data
  const defaultDocs = [
    { id: 'guidelines', title: 'Class Fund Guidelines', type: 'md', path: '/documents/guidelines.md', isDefault: true }
  ]
  const [docsList, setDocsList] = useState<any[]>(defaultDocs)
  const [selectedLocalDoc, setSelectedLocalDoc] = useState(defaultDocs[0])
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
      const dbDocs = initialClassDocs.map(doc => ({
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
      // Fallback to localStorage only if no DB docs provided
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

  // Handlers to Add and Delete custom documents
  const [isAddingDoc, setIsAddingDoc] = useState(false)
  
  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocTitle.trim()) return

    setIsAddingDoc(true)
    
    // For now, we'll store the link as file_url and type as file_type
    // The content is not used in the new schema
    const fileUrl = newDocSource === 'link' ? newDocLink.trim() : undefined
    const fileType = newDocType

    // Call server action to save to database
    const result = await addClassDocumentAction({
      title: newDocTitle.trim(),
      description: newDocSource === 'write' ? newDocContent : undefined,
      file_url: fileUrl,
      file_type: fileType
    })

    if (result.success) {
      // Reload page to fetch updated documents from database
      window.location.reload()
    } else {
      alert('Failed to add document: ' + (result.error || 'Unknown error'))
      setIsAddingDoc(false)
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    
    // Check if it's a database document
    const doc = docsList.find(d => d.id === docId)
    if (doc?.isDb) {
      if (!window.confirm('Are you sure you want to delete this class document?')) return
      
      const result = await deleteClassDocumentAction(doc.dbId)
      if (result.success) {
        window.location.reload()
      } else {
        alert('Failed to delete document: ' + (result.error || 'Unknown error'))
      }
    } else {
      // Legacy localStorage document
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
  const [rightPanelWidth, setRightPanelWidth] = useState(280) // default 280px list width
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
      // Since the list is on the RIGHT, dragging left INCREASES the list width
      // dragging right DECREASES the list width
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

  // Load study materials from database or fallback on mount
  useEffect(() => {
    if (dbError) {
      setFallbackMode(true)
      const localMatsStr = localStorage.getItem('cft_local_materials')
      if (localMatsStr) {
        try {
          setMaterials(JSON.parse(localMatsStr))
        } catch { /* ignore */ }
      }
    } else {
      setFallbackMode(false)
      setMaterials(initialMaterials)
    }
  }, [initialMaterials, dbError])

  // Load Obsidian markdown contents
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

  // Sync fallback local storage
  const saveMaterialLocally = (newMat: StudyMaterial) => {
    const updated = [newMat, ...materials]
    setMaterials(updated)
    localStorage.setItem('cft_local_materials', JSON.stringify(updated))
  }

  // Submission submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!submitTitle.trim() || !submitLink.trim()) {
      setSubmitError('Please fill in both the Title and the Link fields.')
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
          approved: user ? true : false // automatically approve if logged in locally
        }
        saveMaterialLocally(localMat)
        setSubmitSuccessMsg(true)
        resetForm()
        return
      }

      try {
        const res = await addStudyMaterialAction(payload)
        if (res.success) {
          setSubmitSuccessMsg(true)
          resetForm()
        } else {
          setSubmitError(res.error || 'Failed to submit.')
        }
      } catch (err: any) {
        console.warn('DB Insert failed, using local storage fallback', err)
        setFallbackMode(true)
        const localMat: StudyMaterial = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          ...payload,
          approved: user ? true : false
        }
        saveMaterialLocally(localMat)
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

  // Moderate: approve
  const handleApprove = (id: number) => {
    startTransition(async () => {
      if (fallbackMode) {
        const updated = materials.map(m => m.id === id ? { ...m, approved: true } : m)
        setMaterials(updated)
        localStorage.setItem('cft_local_materials', JSON.stringify(updated))
        return
      }
      try {
        const res = await approveStudyMaterialAction(id)
        if (res.success) {
          setMaterials(prev => prev.map(m => m.id === id ? { ...m, approved: true } : m))
        } else {
          alert(res.error || 'Failed to approve.')
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred.')
      }
    })
  }

  // Moderate: reject/delete
  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete/reject this reviewer link?')) return

    startTransition(async () => {
      if (fallbackMode) {
        const updated = materials.filter(m => m.id !== id)
        setMaterials(updated)
        localStorage.setItem('cft_local_materials', JSON.stringify(updated))
        if (selectedMaterial?.id === id) setSelectedMaterial(null)
        return
      }
      try {
        const res = await deleteStudyMaterialAction(id)
        if (res.success) {
          setMaterials(prev => prev.filter(m => m.id !== id))
          if (selectedMaterial?.id === id) setSelectedMaterial(null)
        } else {
          alert(res.error || 'Failed to delete.')
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred.')
      }
    })
  }

  // Filter materials based on conditions
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
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
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
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
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
            className="text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 py-2 cursor-pointer press-spring flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto max-w-xs animate-fade-in"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Reviewer</span>
          </button>
        )}
      </div>

      {/* ─── TAB 1: CLASS DOCUMENTS ────────────────────────────────────────────── */}
      {activeSubTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
          {/* Docs Selector Sidebar */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Official Class Files</span>
              {user && (
                <button
                  onClick={() => setShowDocModal(true)}
                  className="text-[9px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/10 rounded-full px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer press-spring"
                >
                  <PlusCircle className="h-3 w-3" /> Add Doc
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {docsList.map(doc => {
                const isSelected = selectedLocalDoc.id === doc.id
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-card border-primary shadow-sm ring-2 ring-primary/10'
                        : 'bg-card/50 border-border/50 text-muted-foreground'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedLocalDoc(doc)}
                      className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
                    >
                      <div className={`p-2 rounded-xl border ${isSelected ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/40 border-border text-muted-foreground'}`}>
                        {doc.type === 'pdf' ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{doc.title}</p>
                        <p className="text-[9px] uppercase tracking-wider opacity-60 font-semibold mt-0.5">{doc.type === 'pdf' ? 'PDF Document' : 'Obsidian Note'}</p>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {!doc.isDefault && user && (
                        <button
                          onClick={(e) => handleDeleteDoc(e, doc.id)}
                          className="p-1.5 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <ChevronRight className={`h-4 w-4 opacity-40 transition-transform ${isSelected ? 'translate-x-0.5 opacity-80 text-primary' : ''}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reader Panel */}
          <div className="md:col-span-9 bg-card border border-border rounded-3xl p-5 shadow-sm relative min-h-[680px] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedLocalDoc.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Format: {selectedLocalDoc.type === 'pdf' ? 'Embedded PDF' : 'Parsed Markdown with Obsidian Style'}</p>
              </div>
              <a
                href={selectedLocalDoc.path || '#'}
                download
                onClick={selectedLocalDoc.content !== undefined ? (e) => {
                  e.preventDefault();
                  const blob = new Blob([selectedLocalDoc.content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedLocalDoc.title.toLowerCase().replace(/\s+/g, '_')}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                } : undefined}
                className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/10 rounded-full px-3 py-1.5 flex items-center gap-1 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download File
              </a>
            </div>

            <div className="flex-1 flex flex-col justify-stretch">
              {selectedLocalDoc.type === 'pdf' ? (
                <div className="relative w-full h-[680px] rounded-2xl overflow-hidden border border-border/40 bg-muted/20">
                  <iframe
                    src={getEmbeddableUrl(selectedLocalDoc.path).embedUrl || selectedLocalDoc.path}
                    className="w-full h-full border-0 absolute inset-0 z-10"
                    title={selectedLocalDoc.title}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-0 bg-muted/5 gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-[10px] text-slate-400">Loading document projection frame...</span>
                  </div>
                </div>
              ) : mdLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs font-semibold text-muted-foreground">Parsing note styling...</p>
                </div>
              ) : (
                <div 
                  className="prose dark:prose-invert max-w-none text-foreground text-sm selection:bg-primary/20 font-normal leading-relaxed pb-4 custom-scrollbar overflow-y-auto max-h-[680px] pr-2"
                  dangerouslySetInnerHTML={{ __html: mdContent }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: REVIEW MATERIALS ──────────────────────────────────────────── */}
      {activeSubTab === 'reviewers' && (
        <div className="flex flex-col gap-6">
          {/* Moderator Pending Submissions Queue (Only visible if logged in and has items) */}
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
                        <div className="text-[9px] text-primary truncate mt-1 underline flex items-center gap-0.5">
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{mat.link}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 border-t border-border/30 pt-3 mt-1">
                        <button
                          onClick={() => handleApprove(mat.id)}
                          className="flex-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-1.5 cursor-pointer flex items-center justify-center gap-1 transition-all shadow-sm"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-500/10 border border-red-500/20 rounded-xl p-1.5 cursor-pointer transition-all"
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
              
              {/* Search bar */}
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

              {/* Course filter */}
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

              {/* Category filter */}
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

              {/* Study Type filter */}
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

              {/* Stats card */}
              <div className="mt-2 p-3 bg-muted/40 rounded-2xl border border-border/30 text-[10px] text-muted-foreground flex flex-col gap-1">
                <span>📚 Total Materials: <strong>{approvedMaterials.length}</strong></span>
                <span>💡 Filter Matches: <strong>{filteredApproved.length}</strong></span>
                <span>⏳ Pending Review: <strong>{pendingMaterials.length}</strong></span>
              </div>
            </div>

            {/* List and Projection Panel */}
            <div className="lg:col-span-9 flex flex-col md:flex-row gap-4 items-stretch relative min-h-[680px] animate-fade-in">
              
              {/* Projection Frame Viewport (Middle Panel) */}
              <div className="flex-1 bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                {selectedMaterial ? (
                  (() => {
                    const embedInfo = getEmbeddableUrl(selectedMaterial.link)
                    const course = courses.find(c => c.id === selectedMaterial.course_id)
                    return (
                      <div className="flex flex-col h-full justify-between gap-4">
                        {/* Header Details */}
                        <div className="flex items-start justify-between border-b border-border/40 pb-3 gap-2">
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{selectedMaterial.category} Reviewer</span>
                            <h3 className="text-sm font-extrabold text-foreground truncate mt-1">{selectedMaterial.title}</h3>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-semibold flex-wrap">
                              <span>Submitted by: <strong>{selectedMaterial.submitted_by}</strong></span>
                              <span>•</span>
                              {course && <span>Course: <strong>{course.code}</strong></span>}
                            </div>
                          </div>
                          
                          {/* Moderator Action inside the active view */}
                          {user && (
                            <button
                              onClick={() => handleDelete(selectedMaterial.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 rounded-full cursor-pointer transition-colors"
                              title="Delete reviewer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Projection Container */}
                        <div className="flex-1 flex flex-col min-h-[500px]">
                          {embedInfo.isEmbeddable && embedInfo.embedUrl ? (
                            <div className={`w-full h-full rounded-2xl overflow-hidden border border-border/40 bg-muted/20 relative ${isDragging ? 'pointer-events-none' : ''}`}>
                              <iframe
                                src={embedInfo.embedUrl}
                                className="w-full h-full border-0 absolute inset-0 z-10"
                                title={selectedMaterial.title}
                                allow="autoplay; fullscreen"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-0 bg-muted/5 gap-2">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <span className="text-[10px] text-slate-400">Loading {embedInfo.type} projection frame...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 border border-border/60 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-muted/25">
                              <HelpCircle className="h-10 w-10 text-muted-foreground/45 mb-2.5" />
                              <h4 className="text-xs font-bold text-foreground">Link Cannot Be Embedded Directly</h4>
                              <p className="text-[10px] text-muted-foreground max-w-xs mt-1 leading-normal">
                                This link ({embedInfo.type}) cannot be previewed inside the webpage because the site owner restricts embedded framing. Click the button below to open and access the material.
                              </p>
                              <code className="bg-muted px-2 py-1 border border-border rounded-xl font-mono text-[9px] mt-3 select-all max-w-[200px] truncate">{selectedMaterial.link}</code>
                            </div>
                          )}
                        </div>

                        {/* Link Redirect Footer */}
                        <div className="flex items-center gap-2.5 pt-3 border-t border-border/40">
                          <a
                            href={selectedMaterial.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-2xl py-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Reviewer & Download 📥
                          </a>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/10 min-h-[400px]">
                    <FileText className="h-10 w-10 opacity-30 mb-2.5" />
                    <h3 className="text-xs font-extrabold text-foreground">Select a Reviewer</h3>
                    <p className="text-[10px] max-w-xs mt-1 leading-normal">
                      Click on any material on the right to project it here. Google Drive files and PDFs will display inside our embed viewer!
                    </p>
                  </div>
                )}
              </div>

              {/* Draggable Splitter Bar (Desktop Only, placed between middle Reviewer and right List) */}
              <div
                onMouseDown={handleMouseDown}
                className={`hidden md:block w-1 hover:w-2 hover:bg-primary/40 active:bg-primary cursor-col-resize self-stretch transition-all duration-150 rounded-full select-none ${
                  isDragging ? 'bg-primary/60 w-2 ring-4 ring-primary/10' : 'bg-border/20 hover:bg-border/60'
                }`}
                title="Drag to resize panels"
              />

              {/* Approved Materials List Panel (Right) */}
              <div 
                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${rightPanelWidth}px` : 'auto' }}
                className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1.5 custom-scrollbar shrink-0 w-full md:w-auto"
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
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`flex flex-col p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 press-spring select-none ${
                          isSelected
                            ? 'bg-card border-primary shadow-sm ring-2 ring-primary/5'
                            : 'bg-card/75 hover:bg-card border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            isSelected ? 'bg-primary/10 text-primary' : 'bg-muted/80 text-muted-foreground'
                          }`}>
                            {mat.category}
                          </span>
                          <span className="text-[9px] opacity-65 truncate font-semibold">by {mat.submitted_by}</span>
                        </div>
                        <h4 className={`text-xs font-extrabold truncate mt-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {mat.title}
                        </h4>
                        {mat.description && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 leading-normal">{mat.description}</p>}
                        
                        <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] font-bold text-current">
                          {course && <span className="bg-sky-500/10 text-sky-700 px-1 py-0.25 rounded">{course.code}</span>}
                          {mat.study_type === 'week' && <span className="bg-purple-500/10 text-purple-700 px-1 py-0.25 rounded">Week {mat.week_number}</span>}
                          {mat.study_type === 'lesson' && mat.lesson_name && <span className="bg-green-500/10 text-green-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.lesson_name}</span>}
                          {mat.study_type === 'task' && mat.task_name && <span className="bg-indigo-500/10 text-indigo-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.task_name}</span>}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── SUBMISSION MODAL ──────────────────────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => {
              setShowSubmitModal(false)
              setSubmitSuccessMsg(false)
              setSubmitError(null)
            }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md anim-modal-overlay-in"
          />

          {/* Card */}
          <div className="relative bg-card text-foreground border border-border w-full max-w-lg rounded-3xl p-5 shadow-2xl z-10 anim-modal-card-in flex flex-col max-h-[90vh] overflow-y-auto">
            {submitSuccessMsg ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-4">
                <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center text-xl font-bold animate-[check-pop_0.4s_ease-out]">✓</div>
                <h3 className="text-base font-bold text-foreground">Material Submitted Successfully!</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed px-4">
                  Awesome! Your review material has been submitted. A class moderator will review the link before approving it for the class board. ⏳
                </p>
                <button
                  onClick={() => {
                    setShowSubmitModal(false)
                    setSubmitSuccessMsg(false)
                  }}
                  className="px-6 py-2 bg-foreground text-background font-bold text-xs rounded-full hover:bg-opacity-90 cursor-pointer transition-all press-spring mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="border-b border-border/40 pb-2">
                  <h3 className="text-base font-extrabold text-foreground">Submit Study/Review Material</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Share review notes or quiz link. Submissions are reviewed by moderators.</p>
                </div>

                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reviewer Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Calculus Quiz 1 Reviewer"
                      value={submitTitle}
                      onChange={e => setSubmitTitle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Short Description</label>
                    <textarea
                      placeholder="Include details about coverage, authors, etc. (optional)"
                      value={submitDescription}
                      onChange={e => setSubmitDescription(e.target.value)}
                      rows={2}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Link */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Material Link *</label>
                    <input
                      type="url"
                      required
                      placeholder="e.g. Google Drive sharing URL, PDF link"
                      value={submitLink}
                      onChange={e => setSubmitLink(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                    <span className="text-[8px] text-amber-600 dark:text-amber-500 font-bold px-1.5 py-0.5 bg-amber-500/10 rounded-lg w-fit">
                      ⚠️ Note: Ensure your Google Drive file permissions are set to "Anyone with the link can view"!
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={submitCategory}
                      onChange={e => setSubmitCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="Quiz">Quiz Reviewer</option>
                      <option value="Exam">Exam Reviewer</option>
                      <option value="Lecture">Lecture Notes</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Course */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course Reference</label>
                    <select
                      value={submitCourseId}
                      onChange={e => setSubmitCourseId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="">None / General</option>
                      {courses.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.code}</option>
                      ))}
                    </select>
                  </div>

                  {/* Study Type Selection */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Scope</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'lesson', label: 'Lesson' },
                        { id: 'week', label: 'Week' },
                        { id: 'task', label: 'Task' }
                      ].map(t => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setSubmitStudyType(t.id)}
                          className={`py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                            submitStudyType === t.id
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {t.label} Type
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subcategories (Conditional on Study Type) */}
                  {submitStudyType === 'lesson' && (
                    <div className="flex flex-col gap-1.5 col-span-2 anim-fade-in">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lesson Name / Topic Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Lesson 3: Limits & Continuity"
                        value={submitLessonName}
                        onChange={e => setSubmitLessonName(e.target.value)}
                        className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  )}

                  {submitStudyType === 'week' && (
                    <div className="flex flex-col gap-1.5 col-span-2 anim-fade-in">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Calendar Week</label>
                      <select
                        value={submitWeekNumber}
                        onChange={e => setSubmitWeekNumber(e.target.value)}
                        className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                      >
                        <option value="">Select Target Week</option>
                        {weeks.map(w => (
                          <option key={w.week_number} value={String(w.week_number)}>Week {w.week_number}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {submitStudyType === 'task' && (
                    <div className="flex flex-col gap-1.5 col-span-2 anim-fade-in">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Associated Task Reference</label>
                      <select
                        value={submitTaskName}
                        onChange={e => setSubmitTaskName(e.target.value)}
                        className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                      >
                        <option value="">Select Associated Task (optional)</option>
                        {tasks.filter(t => !t.is_private).map(t => (
                          <option key={t.id} value={t.title}>{t.title} ({t.task_type})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Contributor */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contributor Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe (leaves empty for Anonymous)"
                      value={submitContributor}
                      onChange={e => setSubmitContributor(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Form Footer */}
                <div className="flex justify-end gap-2.5 mt-3 border-t border-border/40 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false)
                      setSubmitError(null)
                    }}
                    className="px-4 py-2 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center gap-1.5"
                  >
                    {isPending && <span className="h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />}
                    Submit Reviewer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ─── ADD DOCUMENT MODAL ────────────────────────────────────────────────── */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowDocModal(false)}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md anim-modal-overlay-in"
          />

          {/* Card */}
          <div className="relative bg-card text-foreground border border-border w-full max-w-lg rounded-3xl p-5 shadow-2xl z-10 anim-modal-card-in flex flex-col max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddDoc} className="flex flex-col gap-4">
              <div className="border-b border-border/40 pb-2">
                <h3 className="text-base font-extrabold text-foreground">Add Class Document</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Upload a PDF link or write a custom Markdown document.</p>
              </div>

              {/* Title */}
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

              {/* Document Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Document Type</label>
                <select
                  value={newDocType}
                  onChange={e => setNewDocType(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="md">Markdown Document (Obsidian Style)</option>
                  <option value="pdf">PDF Document Link</option>
                </select>
              </div>

              {/* Conditional: Link vs Write (For Markdown only) */}
              {newDocType === 'md' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewDocSource('write')}
                      className={`py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
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
                      className={`py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
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

              {/* Conditional Input: Link */}
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

              {/* Conditional Input: Write Directly (Markdown only) */}
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

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2.5 mt-3 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring"
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
