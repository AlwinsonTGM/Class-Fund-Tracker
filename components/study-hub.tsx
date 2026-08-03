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
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({})

  const toggleSubject = (subjectKey: string) => {
    setOpenSubjects(prev => ({
      ...prev,
      [subjectKey]: !prev[subjectKey]
    }))
  }

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitTitle, setSubmitTitle] = useState('')
  const [submitDescription, setSubmitDescription] = useState('')
  const [submitLink, setSubmitLink] = useState('')
  const [submitCategory, setSubmitCategory] = useState('Lecture')
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
      category: submitCategory || 'Other',
      study_type: submitStudyType || 'lesson',
      course_id: submitCourseId ? Number(submitCourseId) : null,
      week_number: submitWeekNumber ? Number(submitWeekNumber) : null,
      lesson_name: submitLessonName.trim() || null,
      task_name: submitTaskName.trim() || null,
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
    setSubmitCategory('Lecture')
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

  // Soft, eye-friendly color themes per subject
  const COURSE_THEMES = [
    { bg: 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' },
    { bg: 'bg-sky-500/10 hover:bg-sky-500/15 border-sky-500/20 dark:bg-sky-950/20 dark:hover:bg-sky-950/30', text: 'text-sky-800 dark:text-sky-300', badge: 'bg-sky-500/20 text-sky-800 dark:text-sky-300' },
    { bg: 'bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/20 dark:bg-violet-950/20 dark:hover:bg-violet-950/30', text: 'text-violet-800 dark:text-violet-300', badge: 'bg-violet-500/20 text-violet-800 dark:text-violet-300' },
    { bg: 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 dark:bg-amber-950/20 dark:hover:bg-amber-950/30', text: 'text-amber-800 dark:text-amber-300', badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
    { bg: 'bg-teal-500/10 hover:bg-teal-500/15 border-teal-500/20 dark:bg-teal-950/20 dark:hover:bg-teal-950/30', text: 'text-teal-800 dark:text-teal-300', badge: 'bg-teal-500/20 text-teal-800 dark:text-teal-300' },
    { bg: 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 dark:bg-rose-950/20 dark:hover:bg-rose-950/30', text: 'text-rose-800 dark:text-rose-300', badge: 'bg-rose-500/20 text-rose-800 dark:text-rose-300' },
    { bg: 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30', text: 'text-indigo-800 dark:text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300' }
  ]

  // Group materials by course_id
  const groupedByCourse = React.useMemo(() => {
    const groups: Array<{ course: Course | null; key: string; materials: StudyMaterial[] }> = []
    
    courses.forEach(course => {
      const courseMats = approvedMaterials.filter(m => m.course_id === course.id)
      if (courseMats.length > 0) {
        groups.push({
          course,
          key: `course-${course.id}`,
          materials: courseMats
        })
      }
    })

    const uncategorizedMats = approvedMaterials.filter(m => !m.course_id || !courses.some(c => c.id === m.course_id))
    if (uncategorizedMats.length > 0) {
      groups.push({
        course: null,
        key: 'course-uncategorized',
        materials: uncategorizedMats
      })
    }

    return groups
  }, [approvedMaterials, courses])

  return (
    <div className="flex flex-col gap-6 w-full anim-fade-slide-in">
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
                      <span className="text-[9px] text-muted-foreground truncate font-mono">by {mat.submitted_by}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground truncate">{mat.title}</h4>
                    
                    <div className="flex flex-wrap gap-1 mt-1 text-[8px] font-bold">
                      {course && <span className="bg-blue-500/10 text-blue-700 px-1 py-0.25 rounded">{course.code} — {course.name}</span>}
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

      {/* Main Full-Width Section: Viewer on Top, Subject Accordions Below */}
      <main className="flex flex-col gap-6 w-full">
        {/* Lecture / PDF Embed Viewer */}
        <section className="bg-card border border-border rounded-3xl p-5 shadow-sm anim-card-scale-in">
          <EmbedViewerModal
            selectedMaterial={selectedMaterial}
            courses={courses}
            user={user}
            onDeleteMaterial={handleDelete}
            onUpdateTitle={handleUpdateTitle}
          />
        </section>

        {/* Approved Materials by Subject (Collapsible Accordions - Closed by Default) */}
        <section className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <span>Subject Reviewers</span>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {groupedByCourse.length} Subject{groupedByCourse.length !== 1 ? 's' : ''} • {approvedMaterials.length} Material{approvedMaterials.length !== 1 ? 's' : ''}
              </span>
            </h3>
          </div>

          {groupedByCourse.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-3xl py-12 px-4 text-center text-muted-foreground">
              <Search className="h-6 w-6 mx-auto opacity-40 mb-2" />
              <p className="text-xs font-bold text-foreground">No Study Materials Available</p>
              <p className="text-[11px] mt-0.5">Click "Submit Reviewer" to add materials for your class!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 w-full">
              {groupedByCourse.map((group, idx) => {
                const isOpen = !!openSubjects[group.key]
                const theme = COURSE_THEMES[idx % COURSE_THEMES.length]
                const fullSubjectTitle = group.course 
                  ? `${group.course.code} — ${group.course.name}` 
                  : 'General / Uncategorized Materials'

                return (
                  <div 
                    key={group.key}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 anim-stagger-in ${theme.bg}`}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Subject Header Toggle */}
                    <button
                      onClick={() => toggleSubject(group.key)}
                      className="w-full min-h-[52px] px-5 py-3.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className={`text-xs font-black tracking-tight truncate ${theme.text}`}>
                          {fullSubjectTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${theme.badge}`}>
                          {group.materials.length} Reviewer{group.materials.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className={`p-1.5 rounded-full ${theme.badge} shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    {/* Collapsible Card Grid Content */}
                    {isOpen && (
                      <div className="p-4 pt-1 border-t border-border/20 bg-card/60 backdrop-blur-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {group.materials.map(mat => {
                            const isSelected = selectedMaterial?.id === mat.id
                            return (
                              <StudyMaterialCard
                                key={mat.id}
                                mat={mat}
                                isSelected={isSelected}
                                course={group.course || undefined}
                                onSelect={setSelectedMaterial}
                                onUpdateTitle={handleUpdateTitle}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

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
