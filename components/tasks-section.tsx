'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { addTaskAction, toggleTaskAction, deleteTaskAction, AddTaskInput, editTaskAction, EditTaskInput } from '@/app/officer-dashboard/actions'
import { Search, Settings, CheckCircle2, ClipboardList, X, Inbox, User, Users, AlertTriangle, Plus, Check, Edit3, Lock } from 'lucide-react'

export interface Course {
  id: number
  code: string
  name: string
  created_at?: string
}

export interface Task {
  id: number
  created_at?: string
  title: string
  description?: string
  course_id: number | null
  courses?: Course | null
  task_type: 'Assignment' | 'Project' | 'Quiz' | 'Exam' | 'Presentation' | 'Lab Activity' | 'Report'
  participation_type: 'Solo' | 'Group'
  group_size: 'Duo' | 'Trio' | 'Quad' | '5+' | 'Whole Section' | 'N/A'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  due_date: string
  background_image?: string | null
  is_private?: boolean
  created_by?: string
}

interface TasksSectionProps {
  initialTasks: Task[]
  isOfficer: boolean
  courses: Course[]
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
  user: any
}

const TASK_TYPES = ['Assignment', 'Project', 'Quiz', 'Exam', 'Presentation', 'Lab Activity', 'Report']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const PARTICIPATION_TYPES = ['Solo', 'Group']
const GROUP_SIZES = ['Duo', 'Trio', 'Quad', '5+', 'Whole Section']

const PRESELECTED_BG_PHOTOS = [
  { id: 'neon-cyber', path: '/photo/096bbaab99e63b536c769426455f9b6d.jpg', label: 'Neon Cyber' },
  { id: 'digital-grid', path: '/photo/5febfb106d9bf21bf5b943d1c193d372.jpg', label: 'Digital Grid' },
  { id: 'synthwave-hills', path: '/photo/f492072849d8b61b681fd861dd820b20.jpg', label: 'Synthwave Hills' },
  { id: 'glitch-art', path: '/photo/fadfds.jpg', label: 'Glitch Art' },
  { id: 'cyberpunk-alley', path: '/photo/images.jpg', label: 'Cyberpunk Alley' },
  { id: 'hacker-matrix', path: '/photo/thumb-1920-1138740.png', label: 'Matrix' }
]

const PRIORITY_THEMES = {
  Urgent: {
    border: 'border-l-4 border-l-rose-500 border-rose-500/20',
    badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
    dot: 'bg-rose-500 animate-pulse'
  },
  High: {
    border: 'border-l-4 border-l-amber-500 border-amber-500/20',
    badge: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  Medium: {
    border: 'border-l-4 border-l-emerald-500 border-emerald-500/20',
    badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  Low: {
    border: 'border-l-4 border-l-muted-foreground/30 border-border/80',
    badge: 'text-muted-foreground bg-muted/60 border-border/50',
    dot: 'bg-muted-foreground/50'
  }
}

function getDueStatus(dueDateStr: string, status: string) {
  if (status === 'Completed') return { text: 'Completed', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400', isOverdue: false }
  
  const now = new Date()
  const due = new Date(dueDateStr)
  const diffMs = due.getTime() - now.getTime()
  const isOverdue = diffMs < 0
  const absDiff = Math.abs(diffMs)
  
  const diffMins = Math.floor(absDiff / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  let text = ''
  if (diffDays > 0) {
    text = `${diffDays}d ${diffHours % 24}h ${isOverdue ? 'overdue' : 'left'}`
  } else if (diffHours > 0) {
    text = `${diffHours}h ${diffMins % 60}m ${isOverdue ? 'overdue' : 'left'}`
  } else {
    text = `${diffMins}m ${isOverdue ? 'overdue' : 'left'}`
  }
  
  const color = isOverdue 
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-bold'
    : diffDays === 0 
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 font-semibold'
      : 'text-muted-foreground bg-muted/50 border-border'
      
  return { text, color, isOverdue }
}

export function TasksSection({
  initialTasks,
  isOfficer,
  courses,
  dbError = false,
  triggerAddOpen = false,
  onCloseAddTrigger,
  user
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourses, setFilterCourses] = useState<string[]>([])
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string>('All')
  const [filterParticipation, setFilterParticipation] = useState<string>('All')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Add Form Inputs
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseId, setCourseId] = useState<string>('')
  const [taskType, setTaskType] = useState<string>('Assignment')
  const [participation, setParticipation] = useState<string>('Solo')
  const [groupSize, setGroupSize] = useState<string>('N/A')
  const [priority, setPriority] = useState<string>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)

  // Ensure isPrivate defaults to true for normal students
  useEffect(() => {
    if (user && !isOfficer) {
      setIsPrivate(true)
    } else {
      setIsPrivate(false)
    }
  }, [user, isOfficer])

  // Sync initial tasks
  useEffect(() => {
    if (dbError) {
      setFallbackMode(true)
      const localTasksStr = localStorage.getItem('cft_fallback_tasks_v2')
      if (localTasksStr) {
        try {
          setTasks(JSON.parse(localTasksStr) as Task[])
        } catch (e) {
          console.error('Failed to parse local tasks v2', e)
        }
      }
    } else {
      setTasks(initialTasks)
      setFallbackMode(false)
    }
  }, [initialTasks, dbError])

  // Open add form when requested by bottom-nav
  useEffect(() => {
    if (triggerAddOpen) {
      setShowAddForm(true)
      if (onCloseAddTrigger) onCloseAddTrigger()
    }
  }, [triggerAddOpen, onCloseAddTrigger])

  // Reset group size if participation type changes
  useEffect(() => {
    if (participation === 'Solo') {
      setGroupSize('N/A')
    } else if (groupSize === 'N/A') {
      setGroupSize('Duo')
    }
  }, [participation, groupSize])

  const handleStartEdit = (task: Task) => {
    setTitle(task.title)
    setDescription(task.description || '')
    setCourseId(task.course_id ? String(task.course_id) : '')
    setTaskType(task.task_type)
    setParticipation(task.participation_type)
    setGroupSize(task.group_size || 'N/A')
    setPriority(task.priority)
    // Convert to YYYY-MM-DDTHH:MM local format
    if (task.due_date) {
      const localDate = new Date(task.due_date)
      // Account for timezone offset to match local input values correctly
      const offsetMs = localDate.getTimezoneOffset() * 60 * 1000
      const localISOTime = new Date(localDate.getTime() - offsetMs).toISOString().slice(0, 16)
      setDueDate(localISOTime)
    } else {
      setDueDate('')
    }
    setBackgroundImage(task.background_image || null)
    setIsPrivate(task.is_private || false)
    setEditingTask(task)
    setShowAddForm(true)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please enter a task title.')
      return
    }
    if (!dueDate) {
      setError('Please select a due date and time.')
      return
    }

    const taskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      course_id: courseId ? Number(courseId) : null,
      task_type: taskType,
      participation_type: participation,
      group_size: groupSize,
      priority: priority,
      due_date: new Date(dueDate).toISOString(),
      background_image: backgroundImage || null,
      is_private: isPrivate
    }

    startTransition(async () => {
      if (fallbackMode) {
        saveTaskLocally(taskInput)
        return
      }

      try {
        if (editingTask) {
          const res = await editTaskAction({
            id: editingTask.id,
            ...taskInput
          })
          if (res.success) {
            // Update in-memory state for immediate feedback
            setTasks(prev => prev.map(t => t.id === editingTask.id ? {
              ...t,
              ...taskInput,
              courses: courses.find(c => c.id === taskInput.course_id) || null,
              task_type: taskInput.task_type as any,
              participation_type: taskInput.participation_type as any,
              group_size: taskInput.group_size as any,
              priority: taskInput.priority as any
            } : t))
            resetForm()
          } else {
            setError(res.error || 'Failed to edit task.')
          }
        } else {
          const res = await addTaskAction({
            ...taskInput,
            status: 'Pending'
          })
          if (res.success) {
            // Re-fetch or trigger reload
            resetForm()
            window.location.reload()
          } else {
            // If schema is missing in DB (fallback context)
            if (res.error?.includes('relation') || res.error?.includes('Column') || res.error?.includes('Could not find')) {
              setFallbackMode(true)
              saveTaskLocally(taskInput)
            } else {
              setError(res.error || 'Failed to create task.')
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to save task, switching to local storage', err)
        setFallbackMode(true)
        saveTaskLocally(taskInput)
      }
    })
  }

  const saveTaskLocally = (input: any) => {
    const matchedCourse = courses.find(c => c.id === input.course_id)
    let updated: Task[] = []
    
    if (editingTask) {
      updated = tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title: input.title,
        description: input.description || null,
        course_id: input.course_id,
        courses: matchedCourse || null,
        task_type: input.task_type as any,
        participation_type: input.participation_type as any,
        group_size: input.group_size as any,
        priority: input.priority as any,
        due_date: input.due_date,
        background_image: input.background_image || null,
        is_private: input.is_private || false
      } : t)
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: input.title,
        description: input.description || null,
        course_id: input.course_id,
        courses: matchedCourse || null,
        task_type: input.task_type as any,
        participation_type: input.participation_type as any,
        group_size: input.group_size as any,
        priority: input.priority as any,
        status: 'Pending',
        due_date: input.due_date,
        created_at: new Date().toISOString(),
        background_image: input.background_image || null,
        is_private: input.is_private || false,
        created_by: user?.email || 'local_user'
      }
      updated = [newTask, ...tasks]
    }
    
    setTasks(updated)
    localStorage.setItem('cft_fallback_tasks_v2', JSON.stringify(updated))
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCourseId('')
    setTaskType('Assignment')
    setParticipation('Solo')
    setGroupSize('N/A')
    setPriority('Medium')
    setDueDate('')
    setBackgroundImage(null)
    setEditingTask(null)
    setIsPrivate(user && !isOfficer ? true : false)
    setShowAddForm(false)
  }

  const handleToggleTask = (id: number, currentStatus: string, title: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    
    if (fallbackMode) {
      const updated = tasks.map(t => t.id === id ? { ...t, status: nextStatus as any } : t)
      setTasks(updated)
      localStorage.setItem('cft_fallback_tasks_v2', JSON.stringify(updated))
      return
    }

    setTogglingTaskId(id)
    startTransition(async () => {
      try {
        const res = await toggleTaskAction(id, nextStatus, title)
        if (!res.success) {
          setError(res.error || 'Failed to update task.')
        }
      } catch (err: any) {
        setError('Failed to toggle task.')
      } finally {
        setTogglingTaskId(null)
      }
    })
  }

  const confirmDeleteTask = () => {
    if (!taskToDelete) return
    const id = taskToDelete.id
    const title = taskToDelete.title
    setTaskToDelete(null)

    if (fallbackMode) {
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      localStorage.setItem('cft_fallback_tasks_v2', JSON.stringify(updated))
      return
    }

    setDeletingTaskId(id)
    startTransition(async () => {
      try {
        const res = await deleteTaskAction(id, title)
        if (!res.success) {
          setError(res.error || 'Failed to delete task.')
        }
      } catch (err: any) {
        setError('Failed to delete task.')
      } finally {
        setDeletingTaskId(null)
      }
    })
  }

  const handleCourseFilterToggle = (code: string) => {
    if (filterCourses.includes(code)) {
      setFilterCourses(filterCourses.filter(c => c !== code))
    } else {
      setFilterCourses([...filterCourses, code])
    }
  }

  const handleTypeFilterToggle = (type: string) => {
    if (filterTypes.includes(type)) {
      setFilterTypes(filterTypes.filter(t => t !== type))
    } else {
      setFilterTypes([...filterTypes, type])
    }
  }

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    // 0. Private Visibility Check: if task is private, only show if logged-in user is creator
    if (task.is_private) {
      if (!user || task.created_by !== user.email) {
        return false
      }
    }

    // 1. Search Query
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // 2. Status check
    const isCompleted = task.status === 'Completed'
    if (showCompleted && !isCompleted) return false
    if (!showCompleted && isCompleted) return false

    // 3. Course Filter
    if (filterCourses.length > 0) {
      const taskCourseCode = task.courses?.code || ''
      if (!filterCourses.includes(taskCourseCode)) return false
    }

    // 4. Type Filter
    if (filterTypes.length > 0 && !filterTypes.includes(task.task_type)) {
      return false
    }

    // 5. Priority Filter
    if (filterPriority !== 'All' && task.priority !== filterPriority) {
      return false
    }

    // 6. Participation Filter
    if (filterParticipation !== 'All' && task.participation_type !== filterParticipation) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Subtle linear loading bar at the top when saving/deleting/updating */}
      {isPending && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden relative">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes progressSlide {
              0% { left: -33%; }
              100% { left: 100%; }
            }
            .loading-slide-bar {
              animation: progressSlide 1.2s infinite linear;
            }
          ` }} />
          <div className="absolute top-0 bottom-0 w-1/3 bg-primary rounded-full loading-slide-bar" />
        </div>
      )}
      {/* Local Fallback Alert */}
      {fallbackMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 leading-5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <span>
            Running in **Local Fallback Mode**. Tasks are stored in this browser because the expanded Supabase tables are missing.
            Please run the updated SQL migration in your Supabase dashboard to sync globally!
          </span>
        </div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Unified Task Dashboard</h2>
          <p className="text-xs text-muted-foreground">Collaborative group activities, academic deadlines, and tasks.</p>
        </div>
        {(isOfficer || user) && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold px-3 py-1.5 border border-border bg-card rounded-full hover:bg-muted press-spring cursor-pointer flex items-center gap-1.5"
          >
            {showAddForm ? (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
          {error}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-5 anim-stagger-in shadow-md">
          <h3 className="text-sm font-bold text-foreground">
            {editingTask ? 'Modify Task Details' : 'Create Multi-Dimensional Task'}
          </h3>
          
          <form onSubmit={handleAddTask} className="flex flex-col gap-5">
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
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
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
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
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
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer press-spring flex items-center gap-1 ${
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
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer press-spring flex items-center gap-1 ${
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
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer press-spring ${
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
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer press-spring ${
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
                              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer press-spring ${
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
                      }[p as 'Low'|'Medium'|'High'|'Urgent']

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer press-spring ${colorClasses}`}
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
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                {/* Background Photo Selector */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Background Photo</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    
                    {/* None Choice */}
                    <button
                      type="button"
                      onClick={() => setBackgroundImage(null)}
                      className={`size-10 rounded-xl border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer press-spring ${
                        backgroundImage === null
                          ? 'border-foreground bg-foreground text-background dark:bg-white dark:text-black'
                          : 'border-border bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      None
                    </button>

                    {/* Pre-selected Images Choices */}
                    {PRESELECTED_BG_PHOTOS.map(img => {
                      const isSelected = backgroundImage === img.path
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setBackgroundImage(img.path)}
                          className={`relative size-10 rounded-xl overflow-hidden border transition-all cursor-pointer press-spring ${
                            isSelected ? 'border-primary ring-2 ring-primary/25 scale-105' : 'border-border hover:opacity-80'
                          }`}
                          title={img.label}
                        >
                          <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </button>
                      )
                    })}

                    {/* Custom File Upload Input */}
                    <label className="relative size-10 rounded-xl border border-dashed border-border bg-background hover:bg-muted cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all select-none">
                      <Plus className="h-3.5 w-3.5" />
                      <span className="text-[8px] font-bold uppercase mt-0.5">Custom</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert('Custom image size must be under 1MB.')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setBackgroundImage(event.target.result as string)
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>

                  </div>
                  {/* Indicator for custom upload */}
                  {backgroundImage && !PRESELECTED_BG_PHOTOS.some(img => img.path === backgroundImage) && (
                    <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Custom image loaded (max 1MB).
                    </p>
                  )}
                </div>

              </div>

              {/* Live Preview Column */}
              <div className="md:col-span-5 flex flex-col gap-2.5 justify-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Card Preview</span>
                <div className="border border-border/60 bg-muted/15 dark:bg-muted/5 rounded-2xl p-4 flex flex-col gap-2 h-fit md:sticky md:top-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 border-b border-border/40 pb-2 mb-1">
                    Live Feed Preview
                  </div>
                  
                  {/* Replica Task Card */}
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
                    {/* Header Row */}
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
                          <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold flex items-center gap-1 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400`}>
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

                    {/* Title & Description */}
                    <div className="flex flex-col gap-1">
                      <h4 className={`text-xs font-bold leading-relaxed break-words ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
                        {title || 'Your Task Title'}
                      </h4>
                      <p className={`text-[10px] leading-relaxed break-words line-clamp-2 ${backgroundImage ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {description || 'Provide some description details above...'}
                      </p>
                    </div>

                    {/* Footer Metadata */}
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

                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-2 border-t border-border/40 pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-1.5 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center gap-1.5"
              >
                {isPending && <span className="h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />}
                <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Premium Search and Filtering Dock */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 text-xs font-semibold border border-border rounded-full flex items-center gap-1.5 transition-colors cursor-pointer press-spring ${
                showFilters || filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All'
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> Filters
              {(filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All') && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2 text-xs font-semibold border border-border rounded-full transition-colors cursor-pointer press-spring flex items-center gap-1.5 ${
                showCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {showCompleted ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Showing Completed</span>
                </>
              ) : (
                <>
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Show Completed</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Filters Panel */}
        {showFilters && (
          <div className="border-t border-border/40 pt-3 mt-1 flex flex-col gap-4 anim-stagger-in">
            {/* Courses Filters */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Academic Course</span>
              <div className="flex flex-wrap gap-1.5">
                {courses.map(course => {
                  const isSelected = filterCourses.includes(course.code)
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleCourseFilterToggle(course.code)}
                      className={`px-2.5 py-1 text-[10px] font-semibold border rounded-full transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {course.code}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Task Type Filters */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Task Type</span>
              <div className="flex flex-wrap gap-1.5">
                {TASK_TYPES.map(type => {
                  const isSelected = filterTypes.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeFilterToggle(type)}
                      className={`px-2.5 py-1 text-[10px] font-semibold border rounded-full transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-foreground border-foreground text-background' 
                          : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Select Criteria row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Participation</span>
                <select
                  value={filterParticipation}
                  onChange={(e) => setFilterParticipation(e.target.value)}
                  className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  {PARTICIPATION_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Removable Active Tags & Clear Button */}
        {(filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All' || searchQuery.trim() !== '') && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 mt-1">
            <span className="text-[10px] font-bold text-muted-foreground mr-1">Active:</span>
            
            {searchQuery.trim() !== '' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}

            {filterCourses.map(code => (
              <span key={code} className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-primary/10 border border-primary/20 rounded-full text-primary">
                {code}
                <button onClick={() => handleCourseFilterToggle(code)} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}

            {filterTypes.map(type => (
              <span key={type} className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                {type}
                <button onClick={() => handleTypeFilterToggle(type)} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="h-2 w-2" />
                </button>
              </span>
            ))}

            {filterPriority !== 'All' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                Priority: {filterPriority}
                <button onClick={() => setFilterPriority('All')} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}

            {filterParticipation !== 'All' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                {filterParticipation}
                <button onClick={() => setFilterParticipation('All')} className="hover:text-rose-500 ml-0.5 cursor-pointer">
                  <X className="h-2 w-2" />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setFilterCourses([])
                setFilterTypes([])
                setFilterPriority('All')
                setFilterParticipation('All')
                setSearchQuery('')
              }}
              className="text-[9px] font-bold text-rose-500 hover:underline cursor-pointer ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Task Card Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
          <Inbox className="h-8 w-8 text-muted-foreground/60 mb-1" />
          <p className="text-sm font-semibold text-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground px-4">No activities match your current search query or filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                    {/* Priority Badge */}
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      hasBg ? 'bg-white/10 border-white/15 text-white' : priorityTheme.badge
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityTheme.dot}`} />
                      {task.priority}
                    </span>

                    {/* Participation badge */}
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

                  {/* Actions (Officer Toggles) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(isOfficer || (user && task.created_by === user.email)) ? (
                      <>
                        <button
                          onClick={() => handleToggleTask(task.id, task.status, task.title)}
                          disabled={isPending}
                          title={task.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                          className={`size-6 rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
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
                          onClick={() => handleStartEdit(task)}
                          disabled={isPending}
                          title="Edit task details"
                          className={`size-6 rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
                            hasBg
                              ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/80 hover:text-white'
                              : 'bg-background hover:bg-muted border-border hover:border-muted-foreground text-muted-foreground/80 hover:text-foreground'
                          }`}
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => setTaskToDelete(task)}
                          disabled={isPending}
                          title="Delete activity"
                          className={`size-6 rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
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
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes modalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalScaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in {
              animation: modalFadeIn 0.2s forwards ease-out;
            }
            .animate-scale-up {
              animation: modalScaleUp 0.2s forwards ease-out;
            }
          ` }} />
          <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Task?</h3>
                <p className="text-[10px] text-muted-foreground">This action is permanent.</p>
              </div>
            </div>
            
            <p className="text-xs text-foreground/80 leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">"{taskToDelete.title}"</strong>? All details and student completion stats for this task will be permanently removed.
            </p>

            <div className="flex gap-2.5 mt-2 justify-end">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-1.5 text-xs font-semibold border border-border bg-background rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer press-spring"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
