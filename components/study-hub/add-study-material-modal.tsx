'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Course, Week, Task } from './types'

export interface AddStudyMaterialModalProps {
  showSubmitModal: boolean
  onClose: () => void
  submitSuccessMsg: boolean
  setSubmitSuccessMsg: (val: boolean) => void
  submitError: string | null
  setSubmitError: (val: string | null) => void
  submitTitle: string
  setSubmitTitle: (val: string) => void
  submitDescription: string
  setSubmitDescription: (val: string) => void
  submitLink: string
  setSubmitLink: (val: string) => void
  submitCategory: string
  setSubmitCategory: (val: string) => void
  submitStudyType: string
  setSubmitStudyType: (val: string) => void
  submitCourseId: string
  setSubmitCourseId: (val: string) => void
  submitWeekNumber: string
  setSubmitWeekNumber: (val: string) => void
  submitLessonName: string
  setSubmitLessonName: (val: string) => void
  submitTaskName: string
  setSubmitTaskName: (val: string) => void
  submitContributor: string
  setSubmitContributor: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  courses: Course[]
  weeks: Week[]
  tasks: Task[]
}

export function AddStudyMaterialModal({
  showSubmitModal,
  onClose,
  submitSuccessMsg,
  setSubmitSuccessMsg,
  submitError,
  setSubmitError,
  submitTitle,
  setSubmitTitle,
  submitDescription,
  setSubmitDescription,
  submitLink,
  setSubmitLink,
  submitCategory,
  setSubmitCategory,
  submitStudyType,
  setSubmitStudyType,
  submitCourseId,
  setSubmitCourseId,
  submitWeekNumber,
  setSubmitWeekNumber,
  submitLessonName,
  setSubmitLessonName,
  submitTaskName,
  setSubmitTaskName,
  submitContributor,
  setSubmitContributor,
  onSubmit,
  isPending,
  courses,
  weeks,
  tasks
}: AddStudyMaterialModalProps) {
  if (!showSubmitModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => {
          onClose()
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
                onClose()
                setSubmitSuccessMsg(false)
              }}
              className="min-h-[44px] px-6 py-2.5 bg-foreground text-background font-bold text-xs rounded-full hover:bg-opacity-90 cursor-pointer transition-all press-spring mt-2 inline-flex items-center justify-center"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] text-foreground focus:outline-none focus:border-primary transition-all"
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
                      className={`min-h-[44px] py-2 px-2.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center ${
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

              {/* Subcategories */}
              {submitStudyType === 'lesson' && (
                <div className="flex flex-col gap-1.5 col-span-2 anim-fade-in">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lesson Name / Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lesson 3: Limits & Continuity"
                    value={submitLessonName}
                    onChange={e => setSubmitLessonName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              )}

              {submitStudyType === 'week' && (
                <div className="flex flex-col gap-1.5 col-span-2 anim-fade-in">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Calendar Week</label>
                  <select
                    value={submitWeekNumber}
                    onChange={e => setSubmitWeekNumber(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] focus:outline-none focus:border-primary text-foreground"
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
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] focus:outline-none focus:border-primary text-foreground"
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
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex flex-col-reverse xs:flex-row justify-end gap-2.5 mt-3 border-t border-border/40 pt-4">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  setSubmitError(null)
                }}
                className="w-full xs:w-auto min-h-[44px] px-4 py-2.5 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer flex items-center justify-center press-spring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="w-full xs:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center justify-center gap-1.5"
              >
                {isPending && <span className="h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />}
                Submit Reviewer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
