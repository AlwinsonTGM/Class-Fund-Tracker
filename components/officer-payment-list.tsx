'use client'

import React, { useState, useEffect, useRef } from 'react'
import { togglePaymentStatus } from '@/app/officer-dashboard/actions'
import { removeStudentAction } from '@/app/officer-dashboard/moderator-actions'
import { Search, AlertTriangle, ChevronDown, ChevronUp, Loader2, Trash2, Pencil, Award, CheckCircle2, Lock, UserPlus, MoreVertical } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { findCurrentWeekNumber } from '@/lib/week-utils'
import { ConfettiCanvas } from '@/components/ui/confetti-canvas'
import { StudentManagementModal } from '@/components/student-management-modal'

interface Student {
  id: number
  first_name: string
  last_name: string | null
  seat_number: number
  student_id_number?: string
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
  onPaymentsChange?: (payments: Payment[]) => void
  isModerator?: boolean
}

export function OfficerPaymentList({ students = [], initialPayments = [], weeks = [], onPaymentsChange, isModerator = false }: OfficerPaymentListProps) {
  const { toast } = useToast()
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  const [selectedWeek, setSelectedWeek] = useState(() => findCurrentWeekNumber(weeks))
  const hasInitializedWeek = useRef(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set())
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set())
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null)
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<number | null>(null)

  // Confetti and Thank You modal state
  const [showConfetti, setShowConfetti] = useState(false)
  const [showThankYouModal, setShowThankYouModal] = useState(false)

  // Sync selected week to the current week initially or if selected week is no longer valid
  useEffect(() => {
    if (sortedWeeks.length > 0) {
      if (!hasInitializedWeek.current) {
        setSelectedWeek(findCurrentWeekNumber(weeks))
        hasInitializedWeek.current = true
      } else {
        const weekExists = sortedWeeks.some((w) => w.week_number === selectedWeek)
        if (!weekExists) {
          setSelectedWeek(findCurrentWeekNumber(weeks))
        }
      }
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
      let next: Payment[]
      if (targetPaid) {
        const exists = prev.some(
          (p) => p.student_id === studentId && p.week_number === selectedWeek && p.status === 'paid'
        )
        if (exists) return prev
        next = [
          ...prev,
          {
            id: Date.now(),
            student_id: studentId,
            week_number: selectedWeek,
            status: 'paid'
          }
        ]
      } else {
        next = prev.filter(
          (p) => !(p.student_id === studentId && p.week_number === selectedWeek)
        )
      }
      onPaymentsChange?.(next)
      return next
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
        let next: Payment[]
        if (currentlyPaid) {
          const exists = prev.some(
            (p) => p.student_id === studentId && p.week_number === selectedWeek && p.status === 'paid'
          )
          if (exists) return prev
          next = [
            ...prev,
            {
              id: Date.now(),
              student_id: studentId,
              week_number: selectedWeek,
              status: 'paid'
            }
          ]
        } else {
          next = prev.filter(
            (p) => !(p.student_id === studentId && p.week_number === selectedWeek)
          )
        }
        onPaymentsChange?.(next)
        return next
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

  const handleRemoveStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to remove classmate "${studentName}" (ID: ${studentId}) from the database? This action cannot be undone.`)) {
      return
    }

    setDeletingStudentId(studentId)
    try {
      const res = await removeStudentAction(studentId, studentName)
      if (res.success) {
        toast.success(`Removed classmate "${studentName}" from class database.`, 'Classmate Removed')
      } else {
        toast.error(res.error || 'Failed to remove classmate.', 'Error')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove classmate.', 'Error')
    } finally {
      setDeletingStudentId(null)
    }
  }

  const isWeekAccomplished = totalStudents > 0 && paidStudentsCount === totalStudents

  useEffect(() => {
    if (isWeekAccomplished) {
      const key = `confetti_seen_week_${selectedWeek}`
      if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
        setShowConfetti(true)
        setShowThankYouModal(true)
        localStorage.setItem(key, 'true')
      }
    }
  }, [isWeekAccomplished, selectedWeek])

  return (
    <section aria-labelledby="officer-checklist-heading" className="flex flex-col gap-5">
      {showConfetti && <ConfettiCanvas onComplete={() => setShowConfetti(false)} />}

      {/* Thank You Pop-up Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-[130] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-slide-in">
            <div className="size-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Award className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-foreground">Week {selectedWeek} Complete!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Congratulations! All class fund contributions for Week {selectedWeek} are 100% collected. This week is now completed and frozen.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" /> 100% Fund Accomplished & Frozen
            </div>
            <button
              onClick={() => setShowThankYouModal(false)}
              className="w-full mt-2 min-h-[44px] px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer press-spring"
            >
              Thank You & Close
            </button>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isWeekAccomplished && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">Week {selectedWeek} Completed</h4>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Complete & Frozen
                </span>
              </div>
              <p className="text-xs text-muted-foreground">All {totalStudents} classmates have paid. Week checklist is frozen from further edits.</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full min-w-0">
        {/* Week Selector */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 w-full sm:w-auto min-w-0 max-w-full">
          <label htmlFor="officer-week-select" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Selected Week:
          </label>
          {sortedWeeks.length === 0 ? (
            <span className="text-sm text-muted-foreground">No weeks configured</span>
          ) : (
            <div className="relative w-full sm:w-auto min-w-0 max-w-full">
              <select
                id="officer-week-select"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full sm:w-auto min-w-0 max-w-full truncate rounded-xl border border-border bg-card px-3.5 py-2.5 min-h-[44px] text-sm font-medium text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer appearance-none pr-9"
              >
                {sortedWeeks.map((w) => (
                  <option key={w.id} value={w.week_number}>
                    Week {w.week_number} ({w.date_range})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>

        {/* Search Field & Add Classmate Button */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full sm:w-auto min-w-0">
          <div className="relative flex-1 max-w-sm w-full min-w-0">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 min-h-[44px] pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
          </div>

          <StudentManagementModal mode="add" />
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
                const isMenuOpen = activeMenuStudentId === student.id

                return (
                  <li
                    key={student.id}
                    className="flex min-h-14 items-center justify-between gap-3 px-4 py-2.5 sm:min-h-16 sm:gap-4 sm:py-3 sm:px-6 hover:bg-muted/30 relative"
                    style={{
                      transition: 'background-color 200ms var(--ease-swift)',
                      animation: `stagger-in 400ms var(--ease-spring-smooth) both`,
                      animationDelay: `${Math.min(visibleStudents.indexOf(student) * 20, 300)}ms`
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground sm:size-9 sm:text-sm">
                        {student.seat_number}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-foreground truncate text-sm sm:text-base" title={fullName}>
                          {fullName}
                        </span>
                        {hasError && (
                          <span className="text-xs text-destructive font-medium">{localErrors[errorKey]}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                      <label
                        className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 select-none p-1 ${
                          isWeekAccomplished ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                        }`}
                        title={isWeekAccomplished ? 'Week Completed & Frozen' : undefined}
                      >
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
                            disabled={isWeekAccomplished}
                            onChange={() => {
                              if (isWeekAccomplished) return
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
                            className={`size-6 rounded-md border border-border bg-background checked:bg-primary checked:border-primary text-primary-foreground focus:ring-primary focus:ring-offset-2 accent-primary ${
                              isWeekAccomplished ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            style={{ transition: 'background-color 200ms var(--ease-spring-snappy), border-color 200ms var(--ease-spring-snappy)' }}
                          />
                        </div>
                      </label>

                      {/* Action Trigger Menu (Edit & Delete options) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuStudentId(isMenuOpen ? null : student.id)}
                          title={`Options for ${fullName}`}
                          className={`size-9 flex items-center justify-center rounded-xl border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-muted text-foreground ring-2 ring-primary/20' : ''
                          }`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                          <>
                            {/* Invisible overlay backdrop for click-outside */}
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuStudentId(null)}
                            />

                            {/* Action Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-1.5 z-40 min-w-[170px] rounded-2xl border border-border bg-card p-1.5 shadow-xl animate-fade-slide-in flex flex-col gap-0.5">
                              <StudentManagementModal
                                mode="edit"
                                student={student}
                                triggerBtn={
                                  <button
                                    type="button"
                                    onClick={() => setActiveMenuStudentId(null)}
                                    className="w-full min-h-[38px] px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>Edit Classmate</span>
                                  </button>
                                }
                              />

                              {isModerator && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuStudentId(null)
                                    handleRemoveStudent(student.id, fullName)
                                  }}
                                  disabled={deletingStudentId === student.id}
                                  className="w-full min-h-[38px] px-3 py-2 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {deletingStudentId === student.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive shrink-0" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                                  )}
                                  <span>Delete Classmate</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
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
