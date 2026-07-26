'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { addTaskAction, toggleTaskAction, deleteTaskAction, editTaskAction } from '@/app/officer-dashboard/actions'
import { X, Inbox, AlertTriangle, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Course, Task, UserType } from './tasks-section/types'
import { TaskCard } from './tasks-section/task-card'
import { TaskFilterHeader } from './tasks-section/task-filter-header'

const TaskFormModal = dynamic(
  () => import('./tasks-section/task-form-modal').then(m => m.TaskFormModal),
  {
    loading: () => (
      <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center text-xs text-muted-foreground animate-pulse shadow-md">
        Loading task editor...
      </div>
    ),
    ssr: false
  }
)

export type { Course, Task }

interface TasksSectionProps {
  initialTasks: Task[]
  isOfficer: boolean
  courses: Course[]
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
  user: UserType | null
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
  const router = useRouter()
  const { toast } = useToast()
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

  useEffect(() => {
    if (user && !isOfficer) {
      setIsPrivate(true)
    } else {
      setIsPrivate(false)
    }
  }, [user, isOfficer])

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

  useEffect(() => {
    if (triggerAddOpen) {
      setShowAddForm(true)
      if (onCloseAddTrigger) onCloseAddTrigger()
    }
  }, [triggerAddOpen, onCloseAddTrigger])

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
    if (task.due_date) {
      const localDate = new Date(task.due_date)
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
      task_type: taskType as Task['task_type'],
      participation_type: participation as Task['participation_type'],
      group_size: groupSize as Task['group_size'],
      priority: priority as Task['priority'],
      due_date: new Date(dueDate).toISOString(),
      background_image: backgroundImage || undefined,
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
            setTasks(prev => prev.map(t => t.id === editingTask.id ? {
              ...t,
              ...taskInput,
              courses: courses.find(c => c.id === taskInput.course_id) || null
            } : t))
            toast.success(`Task "${taskInput.title}" updated successfully.`, 'Task Updated')
            resetForm()
          } else {
            const msg = res.error || 'Failed to edit task.'
            setError(msg)
            toast.error(msg, 'Task Update Failed')
          }
        } else {
          const res = await addTaskAction({
            ...taskInput,
            status: 'Pending'
          })
          if (res.success) {
            if (res.task) {
              const matchedCourse = courses.find(c => c.id === res.task.course_id)
              const newTaskWithCourse: Task = {
                ...res.task,
                courses: matchedCourse || null
              }
              setTasks(prev => [newTaskWithCourse, ...prev])
            }
            toast.success(`Task "${taskInput.title}" created successfully.`, 'Task Created')
            resetForm()
            router.refresh()
          } else {
            if (res.error?.includes('relation') || res.error?.includes('Column') || res.error?.includes('Could not find')) {
              setFallbackMode(true)
              saveTaskLocally(taskInput)
              toast.success(`Task "${taskInput.title}" saved locally.`, 'Task Saved')
            } else {
              const msg = res.error || 'Failed to create task.'
              setError(msg)
              toast.error(msg, 'Task Creation Failed')
            }
          }
        }
      } catch (err: unknown) {
        console.error('Failed to save task, switching to local storage', err)
        setFallbackMode(true)
        saveTaskLocally(taskInput)
        toast.success(`Task "${taskInput.title}" saved locally.`, 'Task Saved')
      }
    })
  }

  const saveTaskLocally = (input: {
    title: string
    description?: string
    course_id: number | null
    task_type: Task['task_type']
    participation_type: Task['participation_type']
    group_size: Task['group_size']
    priority: Task['priority']
    due_date: string
    background_image?: string | null
    is_private?: boolean
  }) => {
    const matchedCourse = courses.find(c => c.id === input.course_id)
    let updated: Task[] = []
    
    if (editingTask) {
      updated = tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title: input.title,
        description: input.description || undefined,
        course_id: input.course_id,
        courses: matchedCourse || null,
        task_type: input.task_type,
        participation_type: input.participation_type,
        group_size: input.group_size,
        priority: input.priority,
        due_date: input.due_date,
        background_image: input.background_image || null,
        is_private: input.is_private || false
      } : t)
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: input.title,
        description: input.description || undefined,
        course_id: input.course_id,
        courses: matchedCourse || null,
        task_type: input.task_type,
        participation_type: input.participation_type,
        group_size: input.group_size,
        priority: input.priority,
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
      const updated = tasks.map(t => t.id === id ? { ...t, status: nextStatus as Task['status'] } : t)
      setTasks(updated)
      localStorage.setItem('cft_fallback_tasks_v2', JSON.stringify(updated))
      toast.success(`Task "${title}" marked as ${nextStatus}.`, 'Task Updated')
      return
    }

    setTogglingTaskId(id)
    startTransition(async () => {
      try {
        const res = await toggleTaskAction(id, nextStatus, title)
        if (res.success) {
          toast.success(`Task "${title}" marked as ${nextStatus}.`, 'Task Updated')
        } else {
          const msg = res.error || 'Failed to update task status.'
          setError(msg)
          toast.error(msg, 'Update Failed')
        }
      } catch {
        const msg = 'Failed to toggle task status.'
        setError(msg)
        toast.error(msg, 'Update Failed')
      }
        setTogglingTaskId(null)
      
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
      toast.success(`Task "${title}" deleted.`, 'Task Deleted')
      return
    }

    setDeletingTaskId(id)
    startTransition(async () => {
      try {
        const res = await deleteTaskAction(id, title)
        if (res.success) {
          toast.success(`Task "${title}" deleted.`, 'Task Deleted')
        } else {
          const msg = res.error || 'Failed to delete task.'
          setError(msg)
          toast.error(msg, 'Deletion Failed')
        }
      } catch {
        const msg = 'Failed to delete task.'
        setError(msg)
        toast.error(msg, 'Deletion Failed')
      } finally {
        setDeletingTaskId(null)
      }
    })
  }

  const filteredTasks = tasks.filter(task => {
    if (task.is_private) {
      if (!user || task.created_by !== user.email) {
        return false
      }
    }

    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    const isCompleted = task.status === 'Completed'
    if (showCompleted && !isCompleted) return false
    if (!showCompleted && isCompleted) return false

    if (filterCourses.length > 0) {
      const taskCourseCode = task.courses?.code || ''
      if (!filterCourses.includes(taskCourseCode)) return false
    }

    if (filterTypes.length > 0 && !filterTypes.includes(task.task_type)) {
      return false
    }

    if (filterPriority !== 'All' && task.priority !== filterPriority) {
      return false
    }

    if (filterParticipation !== 'All' && task.participation_type !== filterParticipation) {
      return false
    }

    return true
  })

  return (
    <div className="flex flex-col gap-6 relative">
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

      {/* Dynamic Task Form */}
      <TaskFormModal
        showAddForm={showAddForm}
        editingTask={editingTask}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        courseId={courseId}
        setCourseId={setCourseId}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        taskType={taskType}
        setTaskType={setTaskType}
        participation={participation}
        setParticipation={setParticipation}
        groupSize={groupSize}
        setGroupSize={setGroupSize}
        priority={priority}
        setPriority={setPriority}
        dueDate={dueDate}
        setDueDate={setDueDate}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        isOfficer={isOfficer}
        user={user}
        courses={courses}
        isPending={isPending}
        onSubmit={handleAddTask}
        onReset={resetForm}
      />

      {/* Search and Filtering Header */}
      <TaskFilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        filterCourses={filterCourses}
        setFilterCourses={setFilterCourses}
        filterTypes={filterTypes}
        setFilterTypes={setFilterTypes}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterParticipation={filterParticipation}
        setFilterParticipation={setFilterParticipation}
        courses={courses}
      />

      {/* Task Card Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
          <Inbox className="h-8 w-8 text-muted-foreground/60 mb-1" />
          <p className="text-sm font-semibold text-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground px-4">No activities match your current search query or filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isOfficer={isOfficer}
              user={user}
              isPending={isPending}
              deletingTaskId={deletingTaskId}
              togglingTaskId={togglingTaskId}
              onToggleTask={handleToggleTask}
              onStartEdit={handleStartEdit}
              onDeleteTask={(t) => setTaskToDelete(t)}
            />
          ))}
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
