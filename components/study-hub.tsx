'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  FileText, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  PlusCircle,
  FileCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  addStudyMaterialAction, 
  approveStudyMaterialAction, 
  deleteStudyMaterialAction,
  updateStudyMaterialTitleAction
} from '@/app/officer-dashboard/actions'
import { useToast } from '@/components/ui/toast'
import {
  Task,
  StudyMaterial,
  Course,
  Week,
  UserType
} from './study-hub/types'
import { getEmbeddableUrl } from './study-hub/utils'
import { StudyMaterialCard } from './study-hub/study-material-card'

const EmbedViewerModal = dynamic(
  () => import('./study-hub/embed-viewer-modal').then(m => m.EmbedViewerModal),
  {
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-3xl bg-muted/10 min-h-[300px] animate-pulse">
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

export { getEmbeddableUrl }

interface StudyHubProps {
  initialMaterials: StudyMaterial[]
  courses: Course[]
  weeks: Week[]
  tasks: Task[]
  dbError?: boolean
  user: UserType | null
  initialClassDocs?: unknown
}

export function StudyHub({
  initialMaterials,
  courses,
  weeks,
  tasks,
  dbError = false,
  user
}: StudyHubProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Review Materials state
  const [materials, setMaterials] = useState<StudyMaterial[]>(initialMaterials)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStudyType, setSelectedStudyType] = useState<string>('all')
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false)

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

  const handleUpdateTitle = (id: number, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return

    startTransition(async () => {
      const updatedMaterials = materials.map(m => m.id === id ? { ...m, title: trimmed } : m)
      setMaterials(updatedMaterials)
      if (selectedMaterial?.id === id) {
        setSelectedMaterial({ ...selectedMaterial, title: trimmed })
      }

      if (fallbackMode) {
        localStorage.setItem('cft_local_materials', JSON.stringify(updatedMaterials))
        toast.success(`Module title updated to "${trimmed}".`, 'Title Updated')
        return
      }

      try {
        const res = await updateStudyMaterialTitleAction(id, trimmed)
        if (res.success) {
          toast.success(`Module title updated to "${trimmed}".`, 'Title Updated')
          router.refresh()
        } else {
          if (!user) {
            localStorage.setItem('cft_local_materials', JSON.stringify(updatedMaterials))
            toast.success(`Module title updated to "${trimmed}".`, 'Title Updated')
          } else {
            toast.error(res.error || 'Failed to update title.', 'Update Failed')
          }
        }
      } catch {
        localStorage.setItem('cft_local_materials', JSON.stringify(updatedMaterials))
        toast.success(`Module title updated to "${trimmed}".`, 'Title Updated')
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Study Hub — Review Materials</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse quiz notes, exam reviewers, and study resources shared by classmates.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="min-h-[44px] text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 py-2.5 cursor-pointer press-spring flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Reviewer</span>
        </button>
      </div>

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

      {/* Main Grid: Search/Filter Sidebar (Left 280px) & Content Area (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Search & Filter Panel (Sticky Left Sidebar) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 bg-card border border-border rounded-3xl p-4 shadow-sm flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              <span>Search & Filter</span>
            </div>

            <button
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
              className="lg:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isFilterCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>

          <div className={`flex flex-col gap-4 ${isFilterCollapsed ? 'hidden lg:flex' : 'flex'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course:</span>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
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
                className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
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
                className="w-full text-xs rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:border-primary text-foreground"
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
              {user && <span>⏳ Pending Review: <strong>{pendingMaterials.length}</strong></span>}
            </div>
          </div>
        </aside>

        {/* Right Main Section: Viewer on Top, Approved Materials Grid Below */}
        <main className="lg:col-span-9 flex flex-col gap-6 w-full">
          {/* Lecture / PDF Embed Viewer */}
          <section className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <EmbedViewerModal
              selectedMaterial={selectedMaterial}
              courses={courses}
              user={user}
              onDeleteMaterial={handleDelete}
              onUpdateTitle={handleUpdateTitle}
            />
          </section>

          {/* Approved Materials Grid Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">
                Approved Study Materials ({filteredApproved.length})
              </h3>
              {selectedCourseId !== 'all' || selectedCategory !== 'all' || searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCourseId('all')
                    setSelectedCategory('all')
                    setSelectedStudyType('all')
                  }}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Reset Filters
                </button>
              ) : null}
            </div>

            {filteredApproved.length === 0 ? (
              <div className="bg-card border border-border border-dashed rounded-3xl py-12 px-4 text-center text-muted-foreground">
                <Search className="h-6 w-6 mx-auto opacity-40 mb-2" />
                <p className="text-xs font-bold text-foreground">No Study Materials Found</p>
                <p className="text-[11px] mt-0.5">Try clearing filters or click "Submit Reviewer" to add one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredApproved.map(mat => {
                  const isSelected = selectedMaterial?.id === mat.id
                  const course = courses.find(c => c.id === mat.course_id)
                  return (
                    <StudyMaterialCard
                      key={mat.id}
                      mat={mat}
                      isSelected={isSelected}
                      course={course}
                      onSelect={setSelectedMaterial}
                      onUpdateTitle={handleUpdateTitle}
                    />
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>

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
    </div>
  )
}
