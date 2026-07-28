'use client'

import React, { useState, useTransition } from 'react'
import { upsertWeekAction, deleteWeekAction } from '@/app/officer-dashboard/actions'
import { useToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface Week {
  id: number
  week_number: number
  date_range: string
  status: string
}

interface ManageWeeksPanelProps {
  weeks: Week[]
  defaultOpen?: boolean
}

export function ManageWeeksPanel({ weeks = [], defaultOpen = false }: ManageWeeksPanelProps) {
  const { toast } = useToast()
  const [weekNumber, setWeekNumber] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // For inline editing
  const [editingWeekNum, setEditingWeekNum] = useState<number | null>(null)
  const [editingRange, setEditingRange] = useState('')
  const [editingStatus, setEditingStatus] = useState('active')

  const handleSubmitUpsert = (e: React.FormEvent) => {
    e.preventDefault()
    const numWeek = parseInt(weekNumber)
    if (isNaN(numWeek) || numWeek <= 0) {
      const msg = 'Please enter a valid week number.'
      setError(msg)
      toast.error(msg, 'Validation Error')
      return
    }
    if (!dateRange.trim()) {
      const msg = 'Please enter a date range (e.g. Jul 20 – 22).'
      setError(msg)
      toast.error(msg, 'Validation Error')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await upsertWeekAction(numWeek, dateRange.trim(), status)
        if (result && result.success) {
          toast.success(`Week ${numWeek} configuration saved.`, 'Week Saved')
          setWeekNumber('')
          setDateRange('')
          setStatus('active')
        } else {
          const msg = 'Failed to save week.'
          setError(msg)
          toast.error(msg, 'Save Failed')
        }
      } catch (err: any) {
        const msg = err.message || 'Failed to save week.'
        setError(msg)
        toast.error(msg, 'Save Failed')
      }
    })
  }

  const handleDelete = (weekNum: number) => {
    if (confirm(`Are you sure you want to delete Week ${weekNum}? This will remove it from all checklists.`)) {
      setError(null)
      startTransition(async () => {
        try {
          await deleteWeekAction(weekNum)
          toast.success(`Week ${weekNum} has been deleted.`, 'Week Deleted')
        } catch (err: any) {
          const msg = err.message || 'Failed to delete week.'
          setError(msg)
          toast.error(msg, 'Deletion Failed')
        }
      })
    }
  }

  const startEditing = (week: Week) => {
    setEditingWeekNum(week.week_number)
    setEditingRange(week.date_range)
    setEditingStatus(week.status)
  }

  const saveEdit = (weekNum: number) => {
    if (!editingRange.trim()) {
      const msg = 'Please enter a valid date range.'
      alert(msg)
      toast.error(msg, 'Validation Error')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await upsertWeekAction(weekNum, editingRange.trim(), editingStatus)
        if (result && result.success) {
          toast.success(`Week ${weekNum} updated successfully.`, 'Week Updated')
          setEditingWeekNum(null)
        } else {
          const msg = 'Failed to update week.'
          setError(msg)
          toast.error(msg, 'Update Failed')
        }
      } catch (err: any) {
        const msg = err.message || 'Failed to update week.'
        setError(msg)
        toast.error(msg, 'Update Failed')
      }
    })
  }

  const cancelEditing = () => {
    setEditingWeekNum(null)
  }

  // Sort weeks by week_number ascending
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  return (
    <CollapsibleSection
      title="Manage Class Weeks"
      subtitle="Add, edit, or delete weeks for class suspensions/health breaks."
      badgeText="Schedule"
      defaultOpen={defaultOpen}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
            {error}
          </div>
        )}

        {/* Add Week Form */}
        <form onSubmit={handleSubmitUpsert} className="flex flex-col gap-2.5 border-b border-border pb-4">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
            <div className="flex flex-col gap-1 w-full xs:w-24 sm:w-28 shrink-0">
              <label htmlFor="add-week-num" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Week No.
              </label>
              <input
                id="add-week-num"
                type="number"
                min="1"
                required
                disabled={isPending}
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                placeholder="11"
                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 min-h-[38px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[130px] w-full">
              <label htmlFor="add-date-range" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Date Range
              </label>
              <input
                id="add-date-range"
                type="text"
                required
                disabled={isPending}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="e.g. Sep 28 – 30"
                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 min-h-[38px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 w-full xs:w-32 sm:w-36 shrink-0">
              <label htmlFor="add-week-status" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                id="add-week-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 min-h-[38px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="break">Health Break</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2 min-h-[38px] text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 border border-transparent rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 press-spring transition-colors"
          >
            {isPending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>Add Week</span>
          </button>
        </form>

        {/* Compact Weeks List */}
        <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {sortedWeeks.length === 0 ? (
            <p className="text-xs text-center py-3 text-muted-foreground">No weeks configured yet.</p>
          ) : (
            <ul className="divide-y divide-border" aria-label="Class week configuration list">
              {sortedWeeks.map((week) => {
                const isEditing = editingWeekNum === week.week_number

                return (
                  <li key={week.id} className="flex flex-col py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    {isEditing ? (
                      // Inline Editing Form
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="font-semibold text-xs text-foreground shrink-0">
                          Week {week.week_number}:
                        </span>
                        <input
                          type="text"
                          required
                          disabled={isPending}
                          value={editingRange}
                          onChange={(e) => setEditingRange(e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 min-h-[36px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 min-h-[36px] text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer shrink-0"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="break">Health Break</option>
                        </select>
                        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => saveEdit(week.week_number)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 rounded-md px-2.5 py-1 min-h-[32px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 rounded-md px-2.5 py-1 min-h-[32px] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Read-only Item with Actions
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-semibold text-xs text-foreground shrink-0">
                            Week {week.week_number}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground truncate">
                            {week.date_range}
                          </span>
                          {week.status !== 'active' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/10 shrink-0">
                              {week.status === 'suspended' ? 'Suspended' : 'Health Break'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => startEditing(week)}
                            disabled={isPending}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted rounded-md px-2 py-1 min-h-[32px] flex items-center gap-1 cursor-pointer press-spring transition-colors"
                            title="Edit week configuration"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(week.week_number)}
                            disabled={isPending}
                            className="text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded-md px-2 py-1 min-h-[32px] flex items-center gap-1 cursor-pointer press-spring transition-colors"
                            title="Delete week configuration"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
}
