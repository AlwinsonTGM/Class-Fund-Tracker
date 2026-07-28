'use client'

import React, { useState, useEffect } from 'react'
import { togglePaymentStatus } from '@/app/officer-dashboard/actions'
import { Search, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

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
  const { toast } = useToast()
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set())
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set())

  // Sync selected week to the lowest week number initially
  useEffect(() => {
    if (sortedWeeks.length > 0) {
      setSelectedWeek(sortedWeeks[0].week_number)
    }
  }, [weeks])

  // Sync payments state when initialPayments prop updates from the server,
  // preserving any in-flight optimistic updates for pending items.
  useEffect(() => {
    setPayments((prevLocal) => {
      if (pendingKeys.size === 0) {
        return initialPayments
      }

      const updated = [...initialPayments]

      pendingKeys.forEach((key) => {
        const [studentIdStr, weekNumStr] = key.split('-')
        const studentId = Number(studentIdStr)
        const weekNum = Number(weekNumStr)

        const localPaid = prevLocal.some(
          (p) => p.student_id === studentId && p.week_number === weekNum && p.status === 'paid'
        )

        const existingIdx = updated.findIndex(
          (p) => p.student_id === studentId && p.week_number === weekNum
        )

        if (localPaid) {
          if (existingIdx >= 0) {
            updated[existingIdx] = { ...updated[existingIdx], status: 'paid' }
          } else {
            updated.push({
              id: Date.now() + Math.random(),
              student_id: studentId,
              week_number: weekNum,
              status: 'paid'
            })
          }
        } else {
          if (existingIdx >= 0) {
            updated.splice(existingIdx, 1)
          }
        }
      })

      return updated
    })
  }, [initialPayments, pendingKeys])

  // Get active week info
  const activeWeek = sortedWeeks.find((w) => w.week_number === selectedWeek)
  const dateRangeText = activeWeek ? activeWeek.date_range : ''
  const isSuspendedOrBreak = activeWeek ? activeWeek.status !== 'active' : false
  const statusLabel = activeWeek?.status === 'suspended' ? 'Suspended' : activeWeek?.status === 'break' ? 'Health Break' : null

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const fullName = student.last_name
      ? `${student.last_name}, ${student.first_name}`.toLowerCase()
      : student.first_name.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  // Helper check for payment status
  const isStudentPaid = (studentId: number) =>
    payments.some((p) => p.student_id === studentId && p.week_number === selectedWeek && p.status === 'paid')

  // Calculate status counts
  const totalStudents = filteredStudents.length
  const paidStudentsCount = filteredStudents.filter((s) => isStudentPaid(s.id)).length
  const unpaidStudentsCount = totalStudents - paidStudentsCount

  // Filter based on status filter chip
  const displayedStudents = filteredStudents.filter((student) => {
    const isPaid = isStudentPaid(student.id)
    if (statusFilter === 'paid') return isPaid
    if (statusFilter === 'unpaid') return !isPaid
    return true
  })

  // Limit visible items unless expanded
  const visibleStudents = isExpanded ? displayedStudents : displayedStudents.slice(0, 15)

  // Toggle function - handles rapid multiple clicks smoothly without blocking UI
  const handleToggle = async (studentId: number, studentName: string, currentlyPaid: boolean) => {
    const targetPaid = !currentlyPaid
    const key = `${studentId}-${selectedWeek}`

    // Clear previous error for this item
    setLocalErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

    // Track as pending
    setPendingKeys((prev) => new Set(prev).add(key))

    // Optimistically update local payments state immediately
    setPayments((prev) => {
      if (targetPaid) {
        const exists = prev.some(
          (p) => p.student_id === studentId && p.week_number === selectedWeek && p.status === 'paid'
        )
        if (exists) return prev
        return [
          ...prev,
          {
            id: Date.now(),
            student_id: studentId,
            week_number: selectedWeek,
            status: 'paid'
          }
        ]
      } else {
        return prev.filter(
          (p) => !(p.student_id === studentId && p.week_number === selectedWeek)
        )
      }
    })

    try {
      const result = await togglePaymentStatus(studentId, selectedWeek, targetPaid, studentName)
      if (!result || !result.success) {
        throw new Error(result?.error || 'Save failed')
      }
      toast.success(
        `${studentName} marked as ${targetPaid ? 'Paid' : 'Unpaid'} for Week ${selectedWeek}.`,
        'Payment Status Updated'
      )
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save payment status change.'
      console.error('Error toggling payment status:', err)

      // Targeted rollback for ONLY this student & week if server save failed
      setPayments((prev) => {
        if (currentlyPaid) {
          const exists = prev.some(
            (p) => p.student_id === studentId && p.week_number === selectedWeek && p.status === 'paid'
          )
          if (exists) return prev
          return [
            ...prev,
            {
              id: Date.now(),
              student_id: studentId,
              week_number: selectedWeek,
              status: 'paid'
            }
          ]
        } else {
          return prev.filter(
            (p) => !(p.student_id === studentId && p.week_number === selectedWeek)
          )
        }
      })
      setLocalErrors((prev) => ({
        ...prev,
        [key]: errorMsg
      }))
      toast.error(errorMsg, 'Update Failed')
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
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
              className="rounded-xl border border-border bg-card px-4 py-2.5 min-h-[44px] text-sm font-medium text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
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
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 min-h-[44px] pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      {/* Checklist Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2.5">
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
              {paidStudentsCount} of {totalStudents} paid
            </p>
          </div>

          {/* Status Filter Quick Chips */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-xl border border-border/40 w-full sm:w-auto sm:min-w-[320px]">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm border border-border/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({totalStudents})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unpaid')}
              className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'unpaid'
                  ? 'bg-card text-destructive shadow-sm border border-destructive/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unpaid ({unpaidStudentsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                statusFilter === 'paid'
                  ? 'bg-card text-primary shadow-sm border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paid ({paidStudentsCount})
            </button>
          </div>
        </div>

        {isSuspendedOrBreak && (
          <div className="bg-destructive/5 border-b border-border px-5 py-3 sm:px-6 text-center text-xs font-semibold text-destructive flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            Note: Contributions are paused for this week due to a {statusLabel?.toLowerCase()}.
          </div>
        )}

        {displayedStudents.length === 0 ? (
          <div className="flex min-h-24 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No students match your search.' : `No ${statusFilter !== 'all' ? statusFilter : ''} students found.`}
          </div>
        ) : (
          <div className="overflow-y-auto sm:max-h-[640px] pr-1 custom-scrollbar">
            <ul aria-label="Student checklists" className="divide-y divide-border">
              {visibleStudents.map((student) => {
                const fullName = student.last_name
                  ? `${student.last_name}, ${student.first_name}`
                  : student.first_name

                const isPaid = isStudentPaid(student.id)
                const errorKey = `${student.id}-${selectedWeek}`
                const hasError = localErrors[errorKey]
                const isItemPending = pendingKeys.has(errorKey)

                return (
                  <li
                    key={student.id}
                    className="flex min-h-14 items-center justify-between gap-3 px-5 py-2.5 sm:min-h-16 sm:gap-4 sm:py-3 sm:px-6 hover:bg-muted/30"
                    style={{
                      transition: 'background-color 200ms var(--ease-swift)',
                      animation: `stagger-in 400ms var(--ease-spring-smooth) both`,
                      animationDelay: `${Math.min(visibleStudents.indexOf(student) * 20, 300)}ms`
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
                      <label className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 cursor-pointer select-none p-1">
                        <span className="hidden text-sm text-muted-foreground sm:inline-flex items-center gap-1.5">
                          {isPaid ? 'Paid' : 'Unpaid'}
                          {isItemPending && (
                            <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                          )}
                        </span>
                        <div className={`${poppingIds.has(student.id) ? 'anim-check-pop' : ''} relative flex items-center justify-center`}>
                          <input
                            type="checkbox"
                            checked={isPaid}
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

            {displayedStudents.length > 15 && (
              <div className="p-3 border-t border-border flex justify-center bg-card">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="min-h-[44px] px-5 py-2.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full transition-colors cursor-pointer press-spring flex items-center justify-center gap-1.5"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Collapse List (Show Top 15)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Show All {displayedStudents.length} Students</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
