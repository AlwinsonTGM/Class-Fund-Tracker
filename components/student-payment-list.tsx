'use client'

import React, { useState, useEffect } from 'react'
import { Search, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { SubmitReceiptModal } from '@/components/submit-receipt-modal'

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

interface StudentPaymentListProps {
  students: Student[]
  payments: Payment[]
  weeks: Week[]
}

// Format the student name: "First Name Followed by Last Initial" for data privacy
function formatStudentNamePublic(first_name: string, last_name: string | null) {
  const lastInitial = last_name ? `${last_name.trim()[0]}.` : ''
  return `${first_name.trim()} ${lastInitial}`.trim()
}

export function StudentPaymentList({ students = [], payments = [], weeks = [] }: StudentPaymentListProps) {
  // Sort weeks by week_number ascending
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)
  
  // Set default selected week to the lowest week number, or 1 if empty
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (sortedWeeks.length > 0) {
      setSelectedWeek(sortedWeeks[0].week_number)
    }
  }, [weeks])

  // Get active week info
  const activeWeek = sortedWeeks.find((w) => w.week_number === selectedWeek)
  const dateRangeText = activeWeek ? activeWeek.date_range : ''
  const isSuspendedOrBreak = activeWeek ? activeWeek.status !== 'active' : false
  const statusLabel = activeWeek?.status === 'suspended' ? 'Suspended' : activeWeek?.status === 'break' ? 'Health Break' : null

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const displayName = formatStudentNamePublic(student.first_name, student.last_name).toLowerCase()
    return displayName.includes(searchQuery.toLowerCase())
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

  return (
    <section aria-labelledby="students-heading" className="flex flex-col gap-5">
      {/* Settings bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Week Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="student-week-select" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Select Week:
          </label>
          {sortedWeeks.length === 0 ? (
            <span className="text-sm text-muted-foreground">No weeks configured</span>
          ) : (
            <select
              id="student-week-select"
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

        {/* Search Field & Upload Modal trigger */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm w-full">
            <input
              type="text"
              placeholder="Search student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 min-h-[44px] pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
          </div>

          <SubmitReceiptModal students={students} weeks={weeks} payments={payments} />
        </div>
      </div>

      {/* Main Checklist Card */}
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
              <h2 id="students-heading" className="text-xl font-semibold tracking-tight text-card-foreground">
                Students Checklist
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">{paidStudentsCount} of {totalStudents} paid</p>
            </div>
          </div>

          {/* Status Filter Quick Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40 w-full xs:w-fit overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
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
            Contributions are paused for this week due to a {statusLabel?.toLowerCase()}.
          </div>
        )}

        {displayedStudents.length === 0 ? (
          <div className="flex min-h-24 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No students match your search.' : `No ${statusFilter !== 'all' ? statusFilter : ''} students found.`}
          </div>
        ) : (
          <div className="overflow-y-auto sm:max-h-[640px] pr-1 custom-scrollbar">
            <ul aria-label="Student payment statuses" className="divide-y divide-border">
              {visibleStudents.map((student) => {
                const displayName = formatStudentNamePublic(student.first_name, student.last_name)
                const isPaid = isStudentPaid(student.id)

                return (
                  <li
                    key={student.id}
                    className="flex min-h-14 items-center justify-between gap-3 px-5 py-2.5 sm:min-h-16 sm:gap-4 sm:py-3 sm:px-6"
                    style={{ animation: `stagger-in 400ms var(--ease-spring-smooth) both`, animationDelay: `${Math.min(visibleStudents.indexOf(student) * 20, 300)}ms` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground sm:size-9 sm:text-sm">
                        {student.seat_number}
                      </span>
                      <span className="font-medium text-foreground truncate text-sm sm:text-base">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden text-sm text-muted-foreground sm:inline">{isPaid ? 'Paid' : 'Not paid'}</span>
                      <span
                        aria-label={isPaid ? `${displayName} has paid` : `${displayName} has not paid`}
                        className={isPaid
                          ? 'flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-8'
                          : 'flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-8'}
                        role="img"
                        style={{ transition: 'background-color 250ms var(--ease-spring-smooth), color 250ms var(--ease-spring-smooth)' }}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                        ) : (
                          <XCircle className="h-4 w-4 stroke-[2]" />
                        )}
                      </span>
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
