'use client'

import React from 'react'
import { StudyMaterial, Course } from './types'

export interface StudyMaterialCardProps {
  mat: StudyMaterial
  isSelected?: boolean
  course?: Course
  onSelect: (mat: StudyMaterial) => void
}

export function StudyMaterialCard({
  mat,
  isSelected = false,
  course,
  onSelect
}: StudyMaterialCardProps) {
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
      <h4 className={`text-xs font-extrabold truncate mt-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
        {mat.title}
      </h4>
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
