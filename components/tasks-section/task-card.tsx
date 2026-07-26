'use client'

import React from 'react'
import { Task, Course, UserType } from './types'
import { PRIORITY_THEMES, getDueStatus } from './constants'
import { Lock, User, Users, Edit3 } from 'lucide-react'

export interface TaskCardProps {
  task: Task
  isOfficer: boolean
  user?: UserType | null
  isPending?: boolean
  deletingTaskId?: number | null
  togglingTaskId?: number | null
  onToggleTask: (id: number, currentStatus: string, title: string) => void
  onStartEdit: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

export function TaskCard({
  task,
  isOfficer,
  user,
  isPending = false,
  deletingTaskId,
  togglingTaskId,
  onToggleTask,
  onStartEdit,
  onDeleteTask
}: TaskCardProps) {
  const priorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.Medium
  const dueInfo = getDueStatus(task.due_date, task.status)
  const hasBg = !!task.background_image
  
  const cardBgStyle = hasBg
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.90)), url(${task.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  return (
    <div
      key={task.id}
      className={`relative bg-card border border-border rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm transition-all hover:shadow-md ${priorityTheme.border} ${
        hasBg ? 'text-white' : ''
      }`}
      style={cardBgStyle}
    >
      {/* Deleting overlay */}
      {deletingTaskId === task.id && isPending && (
        <div className="absolute inset-0 bg-background/60 dark:bg-background/80 flex flex-col items-center justify-center gap-2 rounded-2xl z-10 anim-fade-in">
          <span className="h-4 w-4 animate-spin rounded-full border border-destructive border-t-transparent" />
          <span className="text-[9px] font-bold text-destructive uppercase tracking-wider">Deleting...</span>
        </div>
      )}

      {/* Toggling overlay */}
      {togglingTaskId === task.id && isPending && (
        <div className="absolute inset-0 bg-background/50 dark:bg-background/70 flex flex-col items-center justify-center gap-2 rounded-2xl z-10 anim-fade-in">
          <span className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Updating...</span>
        </div>
      )}

      {/* Header Row: Course Badge + Due Info */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.courses ? (
            <span
              title={task.courses.name}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                hasBg 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-muted border-border text-foreground hover:bg-muted/80'
              } cursor-help`}
            >
              {task.courses.code}
            </span>
          ) : (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
              hasBg 
                ? 'bg-white/10 border-white/25 text-white/90' 
                : 'bg-muted/40 border-border/60 text-muted-foreground'
            }`}>
              General
            </span>
          )}
          <span className={`text-[10px] border px-1.5 py-0.5 rounded font-semibold ${
            hasBg 
              ? 'bg-white/10 border-white/20 text-white/80' 
              : 'bg-foreground/5 dark:bg-white/5 border-border/40 text-muted-foreground'
          }`}>
            {task.task_type}
          </span>
          {task.is_private && (
            <span className="text-[10px] border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
              <Lock className="h-3 w-3" /> Personal
            </span>
          )}
        </div>

        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
          hasBg && !dueInfo.isOverdue && task.status !== 'Completed'
            ? 'text-white bg-white/10 border-white/15'
            : dueInfo.color
        }`}>
          {dueInfo.text}
        </span>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <h4 className={`text-xs font-bold leading-relaxed break-words ${hasBg ? 'text-white' : 'text-foreground'}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className={`text-[10px] leading-relaxed pr-2 whitespace-pre-wrap break-words ${
            hasBg ? 'text-white/70' : 'text-muted-foreground'
          }`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Metadata Badges */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1.5">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold border rounded-full ${
            hasBg ? 'bg-white/10 border-white/15 text-white' : priorityTheme.badge
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${priorityTheme.dot}`} />
            {task.priority}
          </span>

          <span className={`text-[9px] font-semibold flex items-center gap-1 ${
            hasBg ? 'text-white/80' : 'text-muted-foreground/90'
          }`}>
            {task.participation_type === 'Solo' ? (
              <>
                <User className="h-3 w-3 text-muted-foreground" />
                <span>Solo</span>
              </>
            ) : (
              <>
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>Group ({task.group_size})</span>
              </>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(isOfficer || (user && task.created_by === user.email)) ? (
            <>
              <button
                onClick={() => onToggleTask(task.id, task.status, task.title)}
                disabled={isPending}
                title={task.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                className={`size-11 min-h-[44px] min-w-[44px] rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
                  task.status === 'Completed'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                    : hasBg
                      ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white text-white'
                      : 'bg-background hover:bg-muted border-border hover:border-muted-foreground text-muted-foreground/80 hover:text-foreground'
                }`}
              >
                {task.status === 'Completed' ? '✓' : '☐'}
              </button>

              <button
                onClick={() => onStartEdit(task)}
                disabled={isPending}
                title="Edit task details"
                className={`size-11 min-h-[44px] min-w-[44px] rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
                  hasBg
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/80 hover:text-white'
                    : 'bg-background hover:bg-muted border-border hover:border-muted-foreground text-muted-foreground/80 hover:text-foreground'
                }`}
              >
                <Edit3 className="h-3 w-3" />
              </button>

              <button
                onClick={() => onDeleteTask(task)}
                disabled={isPending}
                title="Delete activity"
                className={`size-11 min-h-[44px] min-w-[44px] rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
                  hasBg
                    ? 'bg-white/5 hover:bg-rose-500/20 border-white/10 text-white/80 hover:text-rose-400 hover:border-rose-500/30'
                    : 'border-destructive/20 text-destructive hover:bg-destructive/10'
                }`}
              >
                ✕
              </button>
            </>
          ) : (
            <span className={`text-[9px] font-bold ${
              task.status === 'Completed' 
                ? 'text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full' 
                : hasBg
                  ? 'text-amber-400 bg-white/10 px-2 py-0.5 rounded-full'
                  : 'text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full'
            }`}>
              {task.status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function TaskCardPreview({
  title,
  description,
  courseId,
  courses,
  taskType,
  participation,
  groupSize,
  priority,
  dueDate,
  backgroundImage,
  isPrivate
}: {
  title: string
  description: string
  courseId: string
  courses: Course[]
  taskType: string
  participation: string
  groupSize: string
  priority: string
  dueDate: string
  backgroundImage: string | null
  isPrivate: boolean
}) {
  return (
    <div 
      className={`relative bg-card border border-border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm ${
        backgroundImage ? 'text-white' : ''
      } ${
        priority === 'Urgent' ? 'border-l-4 border-l-rose-500 border-rose-500/20' :
        priority === 'High' ? 'border-l-4 border-l-amber-500 border-amber-500/20' :
        priority === 'Medium' ? 'border-l-4 border-l-emerald-500 border-emerald-500/20' :
        'border-l-4 border-l-muted-foreground/30 border-border/80'
      }`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.90)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
            backgroundImage 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-muted border-border text-foreground'
          }`}>
            {courseId ? courses.find(c => c.id === Number(courseId))?.code || 'General' : 'General'}
          </span>
          <span className={`text-[9px] border px-1.5 py-0.5 rounded font-semibold ${
            backgroundImage 
              ? 'bg-white/10 border-white/20 text-white/80' 
              : 'bg-foreground/5 dark:bg-white/5 border-border/40 text-muted-foreground'
          }`}>
            {taskType}
          </span>
          {isPrivate && (
            <span className="text-[9px] border px-1.5 py-0.5 rounded font-bold flex items-center gap-1 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Lock className="h-2.5 w-2.5" /> Personal
            </span>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
          priority === 'Urgent' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-bold' :
          backgroundImage ? 'text-white bg-white/10 border-white/15' :
          'text-muted-foreground bg-muted/50 border-border'
        }`}>
          {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Set deadline'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className={`text-xs font-bold leading-relaxed break-words ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
          {title || 'Your Task Title'}
        </h4>
        <p className={`text-[10px] leading-relaxed break-words line-clamp-2 ${backgroundImage ? 'text-white/70' : 'text-muted-foreground'}`}>
          {description || 'Provide some description details above...'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-0.5">
        <span className={`text-[9px] font-semibold flex items-center gap-1 ${backgroundImage ? 'text-white/80' : 'text-muted-foreground/90'}`}>
          {participation === 'Solo' ? '👤 Solo' : `👥 Group (${groupSize})`}
        </span>
        <span className={`h-1.5 w-1.5 rounded-full ${
          priority === 'Urgent' ? 'bg-rose-500' :
          priority === 'High' ? 'bg-amber-500' :
          priority === 'Medium' ? 'bg-emerald-500' : 'bg-muted-foreground'
        }`} />
      </div>
    </div>
  )
}
