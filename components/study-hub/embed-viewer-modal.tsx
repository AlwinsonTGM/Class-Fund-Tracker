'use client'

import React, { useState, useEffect } from 'react'
import { ExternalLink, Trash2, HelpCircle, Pencil, Check, X } from 'lucide-react'
import { StudyMaterial, Course, UserType } from './types'
import { getEmbeddableUrl } from './utils'

export interface EmbedViewerModalProps {
  selectedMaterial: StudyMaterial | null
  courses: Course[]
  user?: UserType | null
  isDragging?: boolean
  onDeleteMaterial: (id: number) => void
  onUpdateTitle?: (id: number, newTitle: string) => void
}

export function EmbedViewerModal({
  selectedMaterial,
  courses,
  user,
  isDragging = false,
  onDeleteMaterial,
  onUpdateTitle
}: EmbedViewerModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  useEffect(() => {
    setIsEditingTitle(false)
    if (selectedMaterial) {
      setTitleInput(selectedMaterial.title)
    }
  }, [selectedMaterial?.id, selectedMaterial?.title])

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim()
    if (!trimmed || !selectedMaterial) return
    if (trimmed !== selectedMaterial.title && onUpdateTitle) {
      onUpdateTitle(selectedMaterial.id, trimmed)
    }
    setIsEditingTitle(false)
  }

  const handleCancelTitle = () => {
    if (selectedMaterial) {
      setTitleInput(selectedMaterial.title)
    }
    setIsEditingTitle(false)
  }

  if (!selectedMaterial) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/60 rounded-3xl bg-muted/10 min-h-[240px] md:min-h-[320px] shadow-inner">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 text-xl">
          📚
        </div>
        <h3 className="text-sm font-extrabold text-foreground">Select a Reviewer Material</h3>
        <p className="text-xs max-w-sm mt-1 leading-normal text-muted-foreground">
          Click any module card in the list below to project and view its PDF, notes, or Google Drive contents right here.
        </p>
      </div>
    )
  }

  const embedInfo = getEmbeddableUrl(selectedMaterial.link)
  const course = courses.find(c => c.id === selectedMaterial.course_id)

  return (
    <div className="flex flex-col gap-4">
      {/* Header Details */}
      <div className="flex items-start justify-between border-b border-border/40 pb-3 gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
              {selectedMaterial.category} Reviewer
            </span>
            {course && (
              <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                {course.code}
              </span>
            )}
          </div>
          
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 mt-1.5 max-w-md">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') handleCancelTitle()
                }}
                className="flex-1 text-sm font-extrabold text-foreground bg-background border border-primary/50 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors flex items-center justify-center press-spring"
                title="Save title"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelTitle}
                className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground cursor-pointer transition-colors flex items-center justify-center press-spring"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1 group">
              <h3 className="text-base font-extrabold text-foreground truncate">{selectedMaterial.title}</h3>
              <button
                onClick={() => {
                  setTitleInput(selectedMaterial.title)
                  setIsEditingTitle(true)
                }}
                className="p-1 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer press-spring shrink-0"
                title="Change module title"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-semibold flex-wrap">
            <span>Submitted by: <strong>{selectedMaterial.submitted_by}</strong></span>
          </div>
        </div>
        
        {/* Right Header Actions: Zoom & Moderator Delete */}
        <div className="flex items-center gap-2">
          {embedInfo.isEmbeddable && (
            <div className="flex items-center border border-border rounded-xl p-1 bg-muted/30 text-xs font-semibold">
              <span className="text-[10px] text-muted-foreground px-1.5 font-bold uppercase">Zoom:</span>
              {[75, 100, 125, 150].map(zoom => (
                <button
                  key={zoom}
                  onClick={() => setZoomLevel(zoom)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    zoomLevel === zoom
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {zoom}%
                </button>
              ))}
            </div>
          )}

          {user && (
            <button
              onClick={() => onDeleteMaterial(selectedMaterial.id)}
              className="size-9 min-h-[36px] min-w-[36px] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors border border-red-500/20"
              title="Delete reviewer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Projection Container */}
      <div className="w-full">
        {embedInfo.isEmbeddable && embedInfo.embedUrl ? (
          <div className={`w-full h-[450px] sm:h-[520px] md:h-[580px] rounded-2xl overflow-hidden border border-border/40 bg-muted/20 relative shadow-inner ${isDragging ? 'pointer-events-none' : ''}`}>
            <iframe
              src={embedInfo.embedUrl}
              style={{
                width: `${10000 / zoomLevel}%`,
                height: `${10000 / zoomLevel}%`,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: '0 0'
              }}
              className="border-0 absolute inset-0 z-10 touch-auto"
              title={selectedMaterial.title}
              allow="autoplay"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-0 bg-muted/5 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[10px] text-slate-400">Loading {embedInfo.type} projection frame...</span>
            </div>
          </div>
        ) : (
          <div className="border border-border/60 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-muted/25 min-h-[220px]">
            <HelpCircle className="h-10 w-10 text-muted-foreground/45 mb-2.5" />
            <h4 className="text-xs font-bold text-foreground">Link Cannot Be Embedded Directly</h4>
            <p className="text-[10px] text-muted-foreground max-w-xs mt-1 leading-normal">
              This link ({embedInfo.type}) cannot be previewed inside the webpage because the site owner restricts embedded framing. Click the button below to open and access the material.
            </p>
            <code className="bg-muted px-2 py-1 border border-border rounded-xl font-mono text-[9px] mt-3 select-all max-w-[240px] truncate">{selectedMaterial.link}</code>
          </div>
        )}
      </div>

      {/* Link Redirect Footer */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
        {selectedMaterial.link.startsWith('data:application/pdf') ? (
          <a
            href={selectedMaterial.link}
            download={`${selectedMaterial.title.replace(/[^a-z0-9_-]/gi, '_')}.pdf`}
            className="flex-1 min-h-[42px] text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-xl py-2.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
          >
            <ExternalLink className="h-4 w-4" />
            Download PDF File
          </a>
        ) : (
          <a
            href={selectedMaterial.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[42px] text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 rounded-xl py-2.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
          >
            <ExternalLink className="h-4 w-4" />
            Open Reviewer & Download
          </a>
        )}
      </div>
    </div>
  )
}
