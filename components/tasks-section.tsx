'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { addTaskAction, toggleTaskAction, deleteTaskAction, AddTaskInput } from '@/app/officer-dashboard/actions'

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
}

interface TasksSectionProps {
  initialTasks: Task[]
  isOfficer: boolean
  courses: Course[]
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
}

const TASK_TYPES = ['Assignment', 'Project', 'Quiz', 'Exam', 'Presentation', 'Lab Activity', 'Report']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const PARTICIPATION_TYPES = ['Solo', 'Group']
const GROUP_SIZES = ['Duo', 'Trio', 'Quad', '5+', 'Whole Section']

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
  onCloseAddTrigger
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

    const taskInput: AddTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      course_id: courseId ? Number(courseId) : null,
      task_type: taskType,
      participation_type: participation,
      group_size: groupSize,
      priority: priority,
      due_date: new Date(dueDate).toISOString(),
      status: 'Pending'
    }

    startTransition(async () => {
      if (fallbackMode) {
        saveTaskLocally(taskInput)
        return
      }

      try {
        const res = await addTaskAction(taskInput)
        if (res.success) {
          resetForm()
        } else {
          // If schema is missing in DB (fallback context)
          if (res.error?.includes('relation') || res.error?.includes('Column') || res.error?.includes('Could not find')) {
            setFallbackMode(true)
            saveTaskLocally(taskInput)
          } else {
            setError(res.error || 'Failed to create task.')
          }
        }
      } catch (err: any) {
        console.error('Failed to create task, switching to local storage', err)
        setFallbackMode(true)
        saveTaskLocally(taskInput)
      }
    })
  }

  const saveTaskLocally = (input: AddTaskInput) => {
    const matchedCourse = courses.find(c => c.id === input.course_id)
    const newTask: Task = {
      id: Date.now(),
      title: input.title,
      description: input.description,
      course_id: input.course_id,
      courses: matchedCourse || null,
      task_type: input.task_type as any,
      participation_type: input.participation_type as any,
      group_size: input.group_size as any,
      priority: input.priority as any,
      status: 'Pending',
      due_date: input.due_date,
      created_at: new Date().toISOString()
    }
    const updated = [newTask, ...tasks]
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

    startTransition(async () => {
      try {
        const res = await toggleTaskAction(id, nextStatus, title)
        if (!res.success) {
          setError(res.error || 'Failed to update task.')
        }
      } catch (err: any) {
        setError('Failed to toggle task.')
      }
    })
  }

  const handleDeleteTask = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      if (fallbackMode) {
        const updated = tasks.filter(t => t.id !== id)
        setTasks(updated)
        localStorage.setItem('cft_fallback_tasks_v2', JSON.stringify(updated))
        return
      }

      startTransition(async () => {
        try {
          const res = await deleteTaskAction(id, title)
          if (!res.success) {
            setError(res.error || 'Failed to delete task.')
          }
        } catch (err: any) {
          setError('Failed to delete task.')
        }
      })
    }
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
    <div className="flex flex-col gap-6">
      {/* Local Fallback Alert */}
      {fallbackMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 leading-5">
          ⚠️ Running in **Local Fallback Mode**. Tasks are stored in this browser because the expanded Supabase tables are missing.
          Please run the updated SQL migration in your Supabase dashboard to sync globally!
        </div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Unified Task Dashboard</h2>
          <p className="text-xs text-muted-foreground">Collaborative group activities, academic deadlines, and tasks.</p>
        </div>
        {isOfficer && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold px-3 py-1.5 border border-border bg-card rounded-full hover:bg-muted press-spring cursor-pointer"
          >
            {showAddForm ? '✕ Close Form' : '➕ Create Task'}
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
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 anim-stagger-in shadow-md">
          <h3 className="text-sm font-bold text-foreground">Create Multi-Dimensional Task</h3>
          
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
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
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="flex flex-col gap-1.5">
                <label htmlFor="taskType" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Task Type
                </label>
                <select
                  id="taskType"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {TASK_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="participation" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Participation
                </label>
                <select
                  id="participation"
                  value={participation}
                  onChange={(e) => setParticipation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {PARTICIPATION_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {participation === 'Group' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="groupSize" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Required Group Size
                  </label>
                  <select
                    id="groupSize"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                  >
                    {GROUP_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5 col-span-1">
                <label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Priority Level
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Create Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Premium Search and Filtering Dock */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
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
              <span>⚙️</span> Filters
              {(filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All') && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2 text-xs font-semibold border border-border rounded-full transition-colors cursor-pointer press-spring ${
                showCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {showCompleted ? '✅ Showing Completed' : '📋 Show Completed'}
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
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer">✕</button>
              </span>
            )}

            {filterCourses.map(code => (
              <span key={code} className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-primary/10 border border-primary/20 rounded-full text-primary">
                {code}
                <button onClick={() => handleCourseFilterToggle(code)} className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer">✕</button>
              </span>
            ))}

            {filterTypes.map(type => (
              <span key={type} className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                {type}
                <button onClick={() => handleTypeFilterToggle(type)} className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer">✕</button>
              </span>
            ))}

            {filterPriority !== 'All' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                Priority: {filterPriority}
                <button onClick={() => setFilterPriority('All')} className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer">✕</button>
              </span>
            )}

            {filterParticipation !== 'All' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
                {filterParticipation}
                <button onClick={() => setFilterParticipation('All')} className="hover:text-rose-500 font-bold ml-0.5 cursor-pointer">✕</button>
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
          <span className="text-2xl">📭</span>
          <p className="text-sm font-semibold text-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground px-4">No activities match your current search query or filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const priorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.Medium
            const dueInfo = getDueStatus(task.due_date, task.status)
            
            return (
              <div
                key={task.id}
                className={`relative bg-card border border-border rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm transition-all hover:shadow-md ${priorityTheme.border}`}
              >
                {/* Header Row: Course Badge + Due Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task.courses ? (
                      <span
                        title={task.courses.name}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-muted border border-border text-foreground hover:bg-muted/80 cursor-help"
                      >
                        {task.courses.code}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-muted/40 border border-border/60 text-muted-foreground">
                        General
                      </span>
                    )}
                    <span className="text-[10px] bg-foreground/5 dark:bg-white/5 border border-border/40 px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
                      {task.task_type}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${dueInfo.color}`}>
                    {dueInfo.text}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-foreground leading-relaxed break-words">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed pr-2 whitespace-pre-wrap break-words">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer Metadata Badges */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1.5">
                  <div className="flex items-center gap-2">
                    {/* Priority Badge */}
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold border rounded-full ${priorityTheme.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityTheme.dot}`} />
                      {task.priority}
                    </span>

                    {/* Participation badge */}
                    <span className="text-[9px] text-muted-foreground/90 font-semibold flex items-center gap-1">
                      {task.participation_type === 'Solo' ? '👤 Solo' : `👥 Group (${task.group_size})`}
                    </span>
                  </div>

                  {/* Actions (Officer Toggles) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOfficer ? (
                      <>
                        <button
                          onClick={() => handleToggleTask(task.id, task.status, task.title)}
                          disabled={isPending}
                          title={task.status === 'Completed' ? 'Mark incomplete' : 'Mark completed'}
                          className={`size-6 rounded-full border flex items-center justify-center text-xs transition-colors cursor-pointer press-spring ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-background hover:bg-muted border-border hover:border-muted-foreground text-muted-foreground/80 hover:text-foreground'
                          }`}
                        >
                          {task.status === 'Completed' ? '✓' : '☐'}
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          disabled={isPending}
                          title="Delete activity"
                          className="size-6 rounded-full border border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center justify-center text-xs transition-colors cursor-pointer press-spring"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className={`text-[9px] font-bold ${
                        task.status === 'Completed' 
                          ? 'text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full' 
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
    </div>
  )
}
