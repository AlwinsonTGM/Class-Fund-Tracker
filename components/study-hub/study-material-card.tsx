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
      className={`flex flex-col p-2.5 min-h-[44px] rounded-xl border text-left cursor-pointer transition-all duration-300 press-spring select-none ${
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

      {isEditing ? (
        <div className="flex items-center gap-1 mt-1 w-full" onClick={e => e.stopPropagation()}>
          <input
            type="text"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave(e)
              if (e.key === 'Escape') handleCancel(e)
            }}
            className="flex-1 text-xs font-bold bg-background border border-primary/50 rounded-lg px-2 py-0.5 text-foreground focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            title="Save title"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg bg-muted text-muted-foreground cursor-pointer"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1 mt-1 group/cardtitle">
          <h4 className={`text-xs font-extrabold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
            {mat.title}
          </h4>
          {onUpdateTitle && (
            <button
              onClick={e => {
                e.stopPropagation()
                setTitleInput(mat.title)
                setIsEditing(true)
              }}
              className="opacity-0 group-hover/cardtitle:opacity-100 p-0.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
              title="Change module title"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {mat.description && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 leading-normal">{mat.description}</p>}
      
      <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] font-bold text-current">
        {(mat.link.startsWith('data:application/pdf') || mat.link.toLowerCase().endsWith('.pdf')) && (
          <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-1 py-0.25 rounded">📄 PDF File</span>
        )}
        {course && <span className="bg-sky-500/10 text-sky-700 px-1 py-0.25 rounded">{course.code}</span>}
        {mat.study_type === 'week' && <span className="bg-purple-500/10 text-purple-700 px-1 py-0.25 rounded">Week {mat.week_number}</span>}
        {mat.study_type === 'lesson' && mat.lesson_name && <span className="bg-green-500/10 text-green-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.lesson_name}</span>}
        {mat.study_type === 'task' && mat.task_name && <span className="bg-indigo-500/10 text-indigo-700 px-1 py-0.25 rounded truncate max-w-[80px]">{mat.task_name}</span>}
      </div>
    </button>
  )
}
