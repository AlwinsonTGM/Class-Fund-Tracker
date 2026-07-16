'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { togglePaymentStatus } from '@/app/officer-dashboard/actions'

interface Student {
  id: number
  first_name: string
  last_name: string | null
  seat_number: number
}

interface Payment {
  id: number
  student_id: number
  week_number: number
  status: string
}

interface Week {
  id: number
  week_number: number
  date_range: string
  status: string
}

interface OfficerPaymentListProps {
  students: Student[]
  initialPayments: Payment[]
  weeks: Week[]
}

export function OfficerPaymentList({ students = [], initialPayments = [], weeks = [] }: OfficerPaymentListProps) {
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set())

  // Sync selected week to the lowest week number initially
  useEffect(() => {
    if (sortedWeeks.length > 0) {
      setSelectedWeek(sortedWeeks[0].week_number)
    }
  }, [weeks])

  // Sync payments state when initialPayments prop updates from the server
  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  // Get active week info
  const activeWeek = sortedWeeks.find((w) => w.week_number === selectedWeek)
  const dateRangeText = activeWeek ? activeWeek.date_range : ''
  const isSuspendedOrBreak = activeWeek ? activeWeek.status !== 'active' : false
  const statusLabel = activeWeek?.status === 'suspended' ? 'Suspended' : activeWeek?.status === 'break' ? 'Health Break' : null

  // Filter students based on search query (searching using the full name formatted)
  const filteredStudents = students.filter((student) => {
    const fullName = student.last_name
      ? `${student.last_name}, ${student.first_name}`.toLowerCase()
      : student.first_name.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  // Calculate stats for the selected week
  const paidCountForWeek = filteredStudents.filter((student) =>
    payments.some((p) => p.student_id === student.id && p.week_number === selectedWeek && p.status === 'paid')
  ).length

  // Toggle function
  const handleToggle = async (studentId: number, studentName: string, currentlyPaid: boolean) => {
    const targetPaid = !currentlyPaid
    const errorKey = `${studentId}-${selectedWeek}`

    // Clear previous error
    setLocalErrors((prev) => {
      const next = { ...prev }
      delete next[errorKey]
      return next
    })

    // Optimistically update local payments state
    let backupPayments = [...payments]
    if (targetPaid) {
      const optPayment: Payment = {
        id: Date.now(), // temporary id
        student_id: studentId,
        week_number: selectedWeek,
        status: 'paid'
      }
      setPayments((prev) => [...prev, optPayment])
    } else {
      setPayments((prev) =>
        prev.filter((p) => !(p.student_id === studentId && p.week_number === selectedWeek))
      )
    }

    // Call the Server Action
    startTransition(async () => {
      try {
        const result = await togglePaymentStatus(studentId, selectedWeek, targetPaid, studentName)
        if (!result || !result.success) {
          throw new Error('Save failed')
        }
      } catch (err: any) {
        console.error('Error toggling payment status:', err)
        setPayments(backupPayments)
        setLocalErrors((prev) => ({
          ...prev,
          [errorKey]: err.message || 'Failed to save changes.'
        }))
      }
    })
  }

  return (
    <section aria-labelledby="officer-checklist-heading" className="flex flex-col gap-5">
      {/* Settings bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Week Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="officer-week-select" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Selected Week:
          </label>
          {sortedWeeks.length === 0 ? (
            <span className="text-sm text-muted-foreground">No weeks configured</span>
          ) : (
            <select
              id="officer-week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              {sortedWeeks.map((w) => (
                <option key={w.id} value={w.week_number}>
                  Week {w.week_number} ({w.date_range})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-sm w-full">
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm pointer-events-none">
            🔍
          </span>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-primary">
                Week {selectedWeek} {dateRangeText && `(${dateRangeText})`}
              </p>
              {statusLabel && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/10">
                  {statusLabel}
                </span>
              )}
            </div>
            <h2 id="officer-checklist-heading" className="text-xl font-semibold tracking-tight text-card-foreground">
              Officer Student Checklist
            </h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {paidCountForWeek} of {filteredStudents.length} paid
          </p>
        </div>

        {isSuspendedOrBreak && (
          <div className="bg-destructive/5 border-b border-border px-5 py-3 sm:px-6 text-center text-xs font-semibold text-destructive">
            ⚠️ Note: Contributions are paused for this week due to a {statusLabel?.toLowerCase()}.
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="flex min-h-24 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No students match your search.' : 'No students found.'}
          </div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            <ul aria-label="Student checklists" className="divide-y divide-border">
              {filteredStudents.map((student) => {
                // Format name as: "Last Name, First Name" for officer checking
                const fullName = student.last_name
                  ? `${student.last_name}, ${student.first_name}`
                  : student.first_name

                const isPaid = payments.some(
                  (p) => p.student_id === student.id && p.week_number === selectedWeek && p.status === 'paid'
                )
                const errorKey = `${student.id}-${selectedWeek}`
                const hasError = localErrors[errorKey]

                return (
                  <li
                    key={student.id}
                    className="flex min-h-14 items-center justify-between gap-3 px-5 py-2.5 sm:min-h-16 sm:gap-4 sm:py-3 sm:px-6 hover:bg-muted/30"
                    style={{
                      transition: 'background-color 200ms var(--ease-swift)',
                      animation: `stagger-in 400ms var(--ease-spring-smooth) both`,
                      animationDelay: `${Math.min(filteredStudents.indexOf(student) * 20, 300)}ms`
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground sm:size-9 sm:text-sm">
                        {student.seat_number}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate text-sm sm:text-base">{fullName}</span>
                        {hasError && (
                          <span className="text-xs text-destructive font-medium">{localErrors[errorKey]}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <div className={`${poppingIds.has(student.id) ? 'anim-check-pop' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isPaid}
                            disabled={isPending}
                            onChange={() => {
                              setPoppingIds((prev) => new Set(prev).add(student.id))
                              setTimeout(() => {
                                setPoppingIds((prev) => {
                                  const next = new Set(prev)
                                  next.delete(student.id)
                                  return next
                                })
                              }, 350)
                              handleToggle(student.id, fullName, isPaid)
                            }}
                            className="size-6 rounded-md border border-border bg-background checked:bg-primary checked:border-primary text-primary-foreground focus:ring-primary focus:ring-offset-2 cursor-pointer accent-primary"
                            style={{ transition: 'background-color 200ms var(--ease-spring-snappy), border-color 200ms var(--ease-spring-snappy)' }}
                          />
                        </div>
                      </label>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
