/**
 * CSV Exporter Utility for Class Fund Tracker
 * Handles RFC 4180 compliant CSV string generation and DOM Blob download triggers.
 */

export interface ExportStudent {
  id: number
  first_name: string
  last_name?: string | null
  seat_number?: number
  student_id_number?: string
}

export interface ExportPayment {
  id: number
  student_id: number
  week_number: number
  status: string
  amount?: number
  paid_at?: string | null
  created_at?: string
  receipt_id?: number | null
}

export interface ExportWeek {
  id: number
  week_number: number
  date_range?: string
  status?: string
}

export interface ExportExpense {
  id: number
  description: string
  amount: number
  recorded_by?: string
  category?: string
  created_at?: string
}

export interface ExportAuditLog {
  id: number
  officer_email: string
  action_description: string
  created_at?: string
}

export interface ExportReceipt {
  id: number
  student_id?: number
  week_number?: number
  amount?: number
  reference_number?: string
  status?: string
  created_at?: string
}

/**
 * Escapes a single CSV field value according to RFC 4180 standards.
 * Fields containing commas, quotes, or newlines are enclosed in double quotes.
 * Existing quotes inside the string are escaped by doubling them ("").
 */
export function escapeCSV(field: string | number | boolean | null | undefined): string {
  if (field === null || field === undefined) return ''
  let str = String(field)
  if (typeof field === 'string' && /^[=+\-@]/.test(str)) {
    str = `'${str}`
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Triggers a DOM file download in browser environments using Blob & ObjectURL.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * (a) Payment Matrix CSV Export (Students x Weeks Payment Grid)
 */
export function generatePaymentMatrixCSV(
  students: ExportStudent[],
  payments: ExportPayment[],
  weeks: ExportWeek[],
  weeklyRate: number = 50.0
): string {
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)
  const sortedStudents = [...students].sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0))

  const headers = [
    'seat_number',
    'student_id',
    'student_name',
    ...sortedWeeks.map((w) => `week_${w.week_number}`),
    'total_weeks_paid',
    'total_paid_amount',
    'outstanding_balance'
  ]

  const rows = sortedStudents.map((s) => {
    const name = s.last_name ? `${s.last_name}, ${s.first_name}` : s.first_name

    let paidWeeksCount = 0
    const weekStatuses = sortedWeeks.map((w) => {
      const isPaid = payments.some(
        (p) => p.student_id === s.id && p.week_number === w.week_number && p.status === 'paid'
      )
      if (isPaid) paidWeeksCount++
      return isPaid ? 'Paid' : 'Unpaid'
    })

    const totalPaidAmount = paidWeeksCount * weeklyRate
    const totalWeeksCount = sortedWeeks.length
    const outstandingBalance = Math.max(0, (totalWeeksCount - paidWeeksCount) * weeklyRate)

    return [
      escapeCSV(s.seat_number ?? s.id),
      escapeCSV(s.id),
      escapeCSV(name),
      ...weekStatuses.map((st) => escapeCSV(st)),
      escapeCSV(paidWeeksCount),
      escapeCSV(totalPaidAmount.toFixed(2)),
      escapeCSV(outstandingBalance.toFixed(2))
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * (b) Student Payment Histories CSV Export (Detailed per-student breakdown)
 * Standardized headers: ['student_id', 'student_name', 'week_number', 'amount', 'status', 'payment_date', 'receipt_ref']
 */
export function generatePaymentsCSV(
  students: ExportStudent[],
  payments: ExportPayment[],
  receipts: ExportReceipt[] = []
): string {
  const headers = ['student_id', 'student_name', 'week_number', 'amount', 'status', 'payment_date', 'receipt_ref']

  const rows = payments.map((p) => {
    const student = students.find((s) => s.id === p.student_id)
    const name = student
      ? student.last_name
        ? `${student.first_name} ${student.last_name}`
        : student.first_name
      : `Student ${p.student_id}`

    const receipt = p.receipt_id
      ? receipts.find((r) => r.id === p.receipt_id)
      : receipts.find((r) => r.student_id === p.student_id && r.week_number === p.week_number)

    const ref = receipt?.reference_number ? receipt.reference_number : 'N/A'
    const amt = p.amount ?? 50.0
    const date = p.paid_at || p.created_at || ''

    return [
      escapeCSV(p.student_id),
      escapeCSV(name),
      escapeCSV(p.week_number),
      escapeCSV(amt.toFixed(2)),
      escapeCSV(p.status),
      escapeCSV(date),
      escapeCSV(ref)
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * (c) Expense Logs CSV Export
 * Standardized headers: ['expense_id', 'description', 'amount', 'recorded_by', 'category', 'date']
 */
export function generateExpensesCSV(expenses: ExportExpense[]): string {
  const headers = ['expense_id', 'description', 'amount', 'recorded_by', 'category', 'date']

  const rows = expenses.map((e) => [
    escapeCSV(e.id),
    escapeCSV(e.description),
    escapeCSV(Number(e.amount).toFixed(2)),
    escapeCSV(e.recorded_by || 'General Officer'),
    escapeCSV(e.category || 'General'),
    escapeCSV(e.created_at || '')
  ].join(','))

  return [headers.join(','), ...rows].join('\n')
}

/**
 * (d) Audit Logs CSV Export
 * Standardized headers: ['log_id', 'timestamp', 'officer_email', 'action_description']
 */
export function generateAuditLogsCSV(logs: ExportAuditLog[]): string {
  const headers = ['log_id', 'timestamp', 'officer_email', 'action_description']

  const rows = logs.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.created_at || ''),
    escapeCSV(l.officer_email),
    escapeCSV(l.action_description)
  ].join(','))

  return [headers.join(','), ...rows].join('\n')
}
