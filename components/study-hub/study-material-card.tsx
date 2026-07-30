'use client'

import React, { useState, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { StudyMaterial, Course } from './types'

export interface StudyMaterialCardProps {
  mat: StudyMaterial
  isSelected?: boolean
  course?: Course
  onSelect: (mat: StudyMaterial) => void
  onUpdateTitle?: (id: number, newTitle: string) => void
}

export function StudyMaterialCard({
  mat,
  isSelected = false,
  course,
  onSelect,
  onUpdateTitle
}: StudyMaterialCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [titleInput, setTitleInput] = useState(mat.title)

  useEffect(() => {
    setTitleInput(mat.title)
  }, [mat.title])

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    const trimmed = titleInput.trim()
    if (trimmed && trimmed !== mat.title && onUpdateTitle) {
      onUpdateTitle(mat.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setTitleInput(mat.title)
    setIsEditing(false)
  }

  return (
    <button
      onClick={() => onSelect(mat)}
      className={`flex flex-col justify-between p-4 min-h-[100px] rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md select-none press-spring anim-card-scale-in ${
        isSelected
          ? 'bg-card border-primary shadow-sm ring-2 ring-primary/20'
          : 'bg-card hover:bg-card/90 border-border/80 text-muted-foreground hover:text-foreground'
      }`}
    >
      <div>
        <div className="flex items-center justify-between w-full gap-2 mb-1.5">
          <span className="text-[10px] text-muted-foreground/80 font-mono font-medium truncate">
            by {mat.submitted_by || 'Anonymous'}
          </span>
          {(mat.link.startsWith('data:application/pdf') || mat.link.toLowerCase().endsWith('.pdf')) ? (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
              📄 PDF File
            </span>
          ) : (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
              🔗 Web Link
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1 my-1 w-full" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave(e)
                if (e.key === 'Escape') handleCancel(e)
              }}
              className="flex-1 text-xs font-bold bg-background border border-primary/50 rounded-lg px-2 py-1 text-foreground focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              title="Save title"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg bg-muted text-muted-foreground cursor-pointer"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 my-1 group/cardtitle">
            <h4 className={`text-xs sm:text-sm font-extrabold truncate ${isSelected ? 'text-primary font-black' : 'text-foreground'}`}>
              {mat.title}
            </h4>
            {onUpdateTitle && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  setTitleInput(mat.title)
                  setIsEditing(true)
                }}
                className="opacity-0 group-hover/cardtitle:opacity-100 p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
                title="Change module title"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
