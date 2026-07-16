'use client'

import React, { useState, useTransition } from 'react'
import { upsertWeekAction, deleteWeekAction } from '@/app/officer-dashboard/actions'

interface Week {
  id: number
  week_number: number
  date_range: string
  status: string
}

interface ManageWeeksPanelProps {
  weeks: Week[]
}

export function ManageWeeksPanel({ weeks = [] }: ManageWeeksPanelProps) {
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
      setError('Please enter a valid week number.')
      return
    }
    if (!dateRange.trim()) {
      setError('Please enter a date range (e.g. Jul 20 – 22).')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await upsertWeekAction(numWeek, dateRange.trim(), status)
        if (result && result.success) {
          setWeekNumber('')
          setDateRange('')
          setStatus('active')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to save week.')
      }
    })
  }

  const handleDelete = (weekNum: number) => {
    if (confirm(`Are you sure you want to delete Week ${weekNum}? This will remove it from all checklists.`)) {
      setError(null)
      startTransition(async () => {
        try {
          await deleteWeekAction(weekNum)
        } catch (err: any) {
          setError(err.message || 'Failed to delete week.')
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
      alert('Please enter a valid date range.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await upsertWeekAction(weekNum, editingRange.trim(), editingStatus)
        if (result && result.success) {
          setEditingWeekNum(null)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update week.')
      }
    })
  }

  const cancelEditing = () => {
    setEditingWeekNum(null)
  }

  // Sort weeks by week_number ascending
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  return (
    <section aria-labelledby="manage-weeks-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex flex-col gap-1">
            <h2 id="manage-weeks-heading" className="text-lg font-semibold text-card-foreground">
              Manage Class Weeks
            </h2>
            <p className="text-xs text-muted-foreground">Add, edit, or delete weeks for class suspensions/health breaks.</p>
          </div>
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
            {error}
          </div>
        )}

        {/* Add Week Form */}
        <form onSubmit={handleSubmitUpsert} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end border-b border-border pb-6">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
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
              placeholder="e.g. 11"
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="add-date-range" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Date Range (Mon – Wed)
            </label>
            <input
              id="add-date-range"
              type="text"
              required
              disabled={isPending}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="e.g. Sep 28 – 30"
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:col-span-1 text-xs font-semibold text-background bg-foreground hover:bg-[#383838] border border-transparent rounded-full py-2.5 px-4 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : null}
            Add Week
          </button>
        </form>

        {/* Weeks List */}
        <div className="max-h-80 overflow-y-auto pr-1">
          {sortedWeeks.length === 0 ? (
            <p className="text-sm text-center py-4 text-muted-foreground">No weeks configured yet.</p>
          ) : (
            <ul className="divide-y divide-border" aria-label="Class week configuration list">
              {sortedWeeks.map((week) => {
                const isEditing = editingWeekNum === week.week_number

                return (
                  <li key={week.id} className="flex flex-col py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between gap-3">
                    {isEditing ? (
                      // Inline Editing Form
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                          Week {week.week_number}:
                        </div>
                        <input
                          type="text"
                          required
                          disabled={isPending}
                          value={editingRange}
                          onChange={(e) => setEditingRange(e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="break">Health Break</option>
                        </select>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => saveEdit(week.week_number)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Read-only Item with Actions
                      <>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-foreground min-w-16">
                            Week {week.week_number}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {week.date_range}
                          </span>
                          {week.status !== 'active' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/10">
                              {week.status === 'suspended' ? 'Suspended' : 'Health Break'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => startEditing(week)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-foreground/80 hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(week.week_number)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            Delete
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
    </section>
  )
}
