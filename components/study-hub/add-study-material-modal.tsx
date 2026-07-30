'use client'

import React, { useState, useRef } from 'react'
import { AlertCircle, Upload, FileText, Link as LinkIcon, X, CheckCircle2 } from 'lucide-react'
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
  const [sourceType, setSourceType] = useState<'pdf' | 'url'>('pdf')
  const [pdfFileName, setPdfFileName] = useState<string>('')
  const [pdfFileSize, setPdfFileSize] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!showSubmitModal) return null

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (file.type !== 'application/pdf' && ext !== '.pdf') {
      setSubmitError('Invalid file format. Please upload a PDF file (.pdf).')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setSubmitError('PDF file size exceeds 3MB limit.')
      return
    }

    const sizeStr = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`

    setPdfFileName(file.name)
    setPdfFileSize(sizeStr)

    if (!submitTitle.trim()) {
      setSubmitTitle(file.name.replace(/\.pdf$/i, ''))
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setSubmitLink(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePdf = () => {
    setPdfFileName('')
    setPdfFileSize('')
    setSubmitLink('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    if (sourceType === 'pdf' && !submitLink.startsWith('data:application/pdf')) {
      e.preventDefault()
      setSubmitError('Please select a PDF file to upload.')
      return
    }
    onSubmit(e)
  }

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
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="border-b border-border/40 pb-2">
              <h3 className="text-base font-extrabold text-foreground">Submit Study/Review Material</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Upload a PDF directly or share a link. Submissions are reviewed by moderators.</p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Submission Mode Selection */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submission Method *</label>
                <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-2xl border border-border/40">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('pdf')
                      setSubmitError(null)
                    }}
                    className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
                      sourceType === 'pdf'
                        ? 'bg-card text-primary shadow-xs border border-border/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-red-500" />
                    <span>Upload PDF File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('url')
                      setSubmitError(null)
                      if (submitLink.startsWith('data:')) setSubmitLink('')
                    }}
                    className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
                      sourceType === 'url'
                        ? 'bg-card text-primary shadow-xs border border-border/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-blue-500" />
                    <span>Web Link (URL)</span>
                  </button>
                </div>
              </div>

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

              {/* PDF Upload or Link Input */}
              {sourceType === 'pdf' ? (
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PDF File (Max 3MB) *</label>
                  {pdfFileName && submitLink.startsWith('data:application/pdf') ? (
                    <div className="flex items-center justify-between p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{pdfFileName}</span>
                          <span className="text-[9px] text-muted-foreground">{pdfFileSize} • PDF Ready</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="p-1 text-muted-foreground hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-muted/20 rounded-2xl p-4 cursor-pointer transition-all gap-2 group text-center min-h-[100px]">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                      />
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-extrabold text-foreground">Click or Drag PDF file here</span>
                        <span className="text-[9px] text-muted-foreground">Supported format: PDF (up to 3MB)</span>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Material Link *</label>
                  <input
                    type="url"
                    required={sourceType === 'url'}
                    placeholder="e.g. Google Drive sharing URL, PDF link"
                    value={submitLink.startsWith('data:') ? '' : submitLink}
                    onChange={e => setSubmitLink(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                  <span className="text-[8px] text-amber-600 dark:text-amber-500 font-bold px-1.5 py-0.5 bg-amber-500/10 rounded-lg w-fit">
                    ⚠️ Note: Ensure your Google Drive file permissions are set to "Anyone with the link can view"!
                  </span>
                </div>
              )}

              {/* Course Reference (Subject Full Name) */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject / Course Reference *</label>
                <select
                  value={submitCourseId}
                  onChange={e => setSubmitCourseId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-background p-2.5 min-h-[44px] focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="">General / Uncategorized</option>
                  {courses.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contributor */}
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contributor Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (leave empty for Anonymous)"
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
