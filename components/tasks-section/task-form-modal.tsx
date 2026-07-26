'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Lock } from 'lucide-react'
import { Course, Task, UserType } from './types'
import { TASK_TYPES, PARTICIPATION_TYPES, GROUP_SIZES, PRIORITIES } from './constants'
import { TaskCardPreview } from './task-card'

const BackgroundPhotoPicker = dynamic(
  () => import('./background-photo-picker').then(m => m.BackgroundPhotoPicker),
  {
    loading: () => <div className="h-14 bg-muted/40 animate-pulse rounded-xl" />,
    ssr: false
  }
)

export interface TaskFormModalProps {
  showAddForm: boolean
  editingTask: Task | null
  title: string
  setTitle: (val: string) => void
  description: string
  setDescription: (val: string) => void
  courseId: string
  setCourseId: (val: string) => void
  isPrivate: boolean
  setIsPrivate: (val: boolean) => void
  taskType: string
  setTaskType: (val: string) => void
  participation: string
  setParticipation: (val: string) => void
  groupSize: string
  setGroupSize: (val: string) => void
  priority: string
  setPriority: (val: string) => void
  dueDate: string
  setDueDate: (val: string) => void
  backgroundImage: string | null
  setBackgroundImage: (val: string | null) => void
  isOfficer: boolean
  user?: UserType | null
  courses: Course[]
  isPending: boolean
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
}

export function TaskFormModal({
  showAddForm,
  editingTask,
  title,
  setTitle,
  description,
  setDescription,
  courseId,
  setCourseId,
  isPrivate,
  setIsPrivate,
  taskType,
  setTaskType,
  participation,
  setParticipation,
  groupSize,
  setGroupSize,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  backgroundImage,
  setBackgroundImage,
  isOfficer,
  courses,
  isPending,
  onSubmit,
  onReset
}: TaskFormModalProps) {
  if (!showAddForm) return null

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-5 anim-stagger-in shadow-md">
      <h3 className="text-sm font-bold text-foreground">
        {editingTask ? 'Modify Task Details' : 'Create Multi-Dimensional Task'}
      </h3>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Form Controls Column */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. COMP104 Programming Assignment 1"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 min-h-[44px] text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Description / Notes (Optional)
              </label>
              <textarea
                id="description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about grading, requirements, or links..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Course Selector Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Associated Course
              </label>
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">General (No Course)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Visibility Selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Task Visibility</span>
              {isOfficer ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer press-spring flex items-center justify-center gap-1 ${
                      !isPrivate 
                        ? 'bg-foreground text-background border-foreground shadow-sm' 
                        : 'bg-background hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    Public (Everyone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer press-spring flex items-center justify-center gap-1 ${
                      isPrivate 
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                        : 'bg-background hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" /> Private (Only Me)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400 w-fit">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold">Personal Task</span>
                    <span className="text-[8px] opacity-80 leading-normal">Only you will be able to see, edit, or toggle this task.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Task Type Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Task Type</span>
              <div className="flex flex-wrap gap-1.5">
                {TASK_TYPES.map(type => {
                  const isSelected = taskType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTaskType(type)}
                      className={`min-h-[44px] px-3 py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center press-spring ${
                        isSelected
                          ? 'bg-foreground text-background border-foreground shadow-sm'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Participation & Group Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Participation</span>
              <div className="flex items-center gap-4">
                <div className="flex p-0.5 bg-muted rounded-xl w-fit">
                  {PARTICIPATION_TYPES.map(p => {
                    const isSelected = participation === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setParticipation(p)}
                        className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center press-spring ${
                          isSelected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p === 'Solo' ? '👤 Solo' : '👥 Group'}
                      </button>
                    )
                  })}
                </div>

                {participation === 'Group' && (
                  <div className="flex items-center gap-1.5 animate-fade-slide-in">
                    {GROUP_SIZES.map(s => {
                      const isSelected = groupSize === s
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setGroupSize(s)}
                          className={`min-h-[44px] min-w-[44px] px-2.5 py-2 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center press-spring ${
                            isSelected ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Priority Selection chips */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority Level</span>
              <div className="flex gap-2">
                {PRIORITIES.map(p => {
                  const isSelected = priority === p
                  const colorClasses = {
                    Low: isSelected ? 'bg-muted-foreground/15 border-muted-foreground text-foreground' : 'hover:bg-muted/40 text-muted-foreground border-border',
                    Medium: isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'hover:bg-emerald-500/5 text-muted-foreground hover:text-emerald-500 border-border',
                    High: isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' : 'hover:bg-amber-500/5 text-muted-foreground hover:text-amber-500 border-border',
                    Urgent: isSelected ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse' : 'hover:bg-rose-500/5 text-muted-foreground hover:text-rose-500 border-border'
                  }[p]

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 min-h-[44px] py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center press-spring ${colorClasses}`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Deadline Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dueDate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Deadline Date & Time
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
              />
            </div>

            {/* Background Photo Picker Component */}
            <BackgroundPhotoPicker
              backgroundImage={backgroundImage}
              setBackgroundImage={setBackgroundImage}
            />

          </div>

          {/* Live Preview Column */}
          <div className="md:col-span-5 flex flex-col gap-2.5 justify-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Card Preview</span>
            <div className="border border-border/60 bg-muted/15 dark:bg-muted/5 rounded-2xl p-4 flex flex-col gap-2 h-fit md:sticky md:top-2">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 border-b border-border/40 pb-2 mb-1">
                Live Feed Preview
              </div>
              
              <TaskCardPreview
                title={title}
                description={description}
                courseId={courseId}
                courses={courses}
                taskType={taskType}
                participation={participation}
                groupSize={groupSize}
                priority={priority}
                dueDate={dueDate}
                backgroundImage={backgroundImage}
                isPrivate={isPrivate}
              />
            </div>
          </div>

        </div>

        <div className="flex flex-col-reverse xs:flex-row justify-end gap-2.5 mt-2 border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={onReset}
            disabled={isPending}
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
            <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
