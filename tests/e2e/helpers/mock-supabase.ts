/**
 * Mock Supabase & Domain Business Engine for Class Fund Tracker E2E Tests
 */

import {
  PaymentReceipt,
  PaymentRecord,
  ExpenseRecord,
  AuditLogRecord,
  StudentRecord,
  FinancialMetrics
} from '../types'

export class MockClassFundEngine {
  public students: StudentRecord[] = []
  public payments: PaymentRecord[] = []
  public receipts: PaymentReceipt[] = []
  public expenses: ExpenseRecord[] = []
  public auditLogs: AuditLogRecord[] = []
  public moderators: string[] = ['moderator@class.edu', 'admin@class.edu']
  public officers: string[] = ['treasurer@class.edu', 'officer1@class.edu']
  public nextReceiptId = 1
  public nextPaymentId = 1
  public nextExpenseId = 1
  public nextAuditLogId = 1

  constructor() {
    this.reset()
  }

  public reset() {
    this.students = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `Student ${i + 1}`,
      seat_number: i + 1,
      student_id_number: `2026-${1000 + i}`
    }))

    this.payments = []
    this.receipts = []
    this.expenses = []
    this.auditLogs = []
    this.nextReceiptId = 1
    this.nextPaymentId = 1
    this.nextExpenseId = 1
    this.nextAuditLogId = 1
  }

  // --- R1: Digital Proof of Payment Actions ---

  public submitReceipt(input: {
    student_id: number
    student_name?: string
    week_number: number
    amount: number
    reference_number: string
    file_name: string
    file_size: number
    mime_type: string
    note?: string
  }): { success: boolean; receipt?: PaymentReceipt; error?: string } {
    // Validation
    const student = this.students.find(s => s.id === input.student_id)
    if (!student && !input.student_name) {
      return { success: false, error: 'Invalid student ID' }
    }

    const studentName = student ? student.name : input.student_name!

    if (input.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' }
    }

    if (!input.reference_number || input.reference_number.trim() === '') {
      return { success: false, error: 'Reference number is required' }
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    const ext = '.' + input.file_name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return { success: false, error: `Invalid file extension "${ext}". Allowed: .jpg, .jpeg, .png, .pdf` }
    }

    const maxSizeBytes = 5 * 1024 * 1024 // 5MB
    if (input.file_size > maxSizeBytes) {
      return { success: false, error: 'File size exceeds maximum limit of 5MB' }
    }

    const receipt: PaymentReceipt = {
      id: this.nextReceiptId++,
      student_id: input.student_id,
      student_name: studentName,
      week_number: input.week_number,
      amount: input.amount,
      reference_number: input.reference_number.trim(),
      receipt_url: `/storage/receipts/week_${input.week_number}_student_${input.student_id}_${Date.now()}${ext}`,
      file_name: input.file_name,
      file_size: input.file_size,
      mime_type: input.mime_type,
      note: input.note,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }

    this.receipts.push(receipt)
    return { success: true, receipt }
  }

  public getPendingReceiptsQueue() {
    return this.receipts.filter(r => r.status === 'pending')
  }

  public approveReceipt(
    receiptId: number,
    officerEmail: string
  ): { success: boolean; error?: string } {
    // Auth / Whitelist check
    if (!this.officers.includes(officerEmail) && !this.moderators.includes(officerEmail)) {
      return { success: false, error: 'Unauthorized: You do not have officer privileges.' }
    }

    const receipt = this.receipts.find(r => r.id === receiptId)
    if (!receipt) {
      return { success: false, error: 'Receipt not found' }
    }

    if (receipt.status !== 'pending') {
      return { success: false, error: `Receipt has already been ${receipt.status}` }
    }

    // State transition
    receipt.status = 'approved'
    receipt.reviewed_at = new Date().toISOString()
    receipt.reviewed_by = officerEmail

    // Insert payment record
    const existingPaymentIndex = this.payments.findIndex(
      p => p.student_id === receipt.student_id && p.week_number === receipt.week_number
    )

    if (existingPaymentIndex >= 0) {
      this.payments[existingPaymentIndex].status = 'paid'
      this.payments[existingPaymentIndex].paid_at = new Date().toISOString()
      this.payments[existingPaymentIndex].receipt_id = receipt.id
    } else {
      this.payments.push({
        id: this.nextPaymentId++,
        student_id: receipt.student_id,
        week_number: receipt.week_number,
        status: 'paid',
        paid_at: new Date().toISOString(),
        receipt_id: receipt.id
      })
    }

    // Audit log
    const actionDesc = `Approved payment receipt #${receipt.id} for ${receipt.student_name} (Week ${receipt.week_number}, Ref: ${receipt.reference_number}, ₱${receipt.amount.toFixed(2)})`
    this.auditLogs.push({
      id: this.nextAuditLogId++,
      officer_email: officerEmail,
      action_description: actionDesc,
      created_at: new Date().toISOString()
    })

    return { success: true }
  }

  public rejectReceipt(
    receiptId: number,
    officerEmail: string,
    rejectionReason: string
  ): { success: boolean; error?: string } {
    // Auth / Whitelist check
    if (!this.officers.includes(officerEmail) && !this.moderators.includes(officerEmail)) {
      return { success: false, error: 'Unauthorized: You do not have officer privileges.' }
    }

    const receipt = this.receipts.find(r => r.id === receiptId)
    if (!receipt) {
      return { success: false, error: 'Receipt not found' }
    }

    if (receipt.status !== 'pending') {
      return { success: false, error: `Receipt has already been ${receipt.status}` }
    }

    receipt.status = 'rejected'
    receipt.rejection_reason = rejectionReason || 'Invalid proof'
    receipt.reviewed_at = new Date().toISOString()
    receipt.reviewed_by = officerEmail

    // Audit log
    const actionDesc = `Rejected payment receipt #${receipt.id} for ${receipt.student_name} (Reason: ${receipt.rejection_reason})`
    this.auditLogs.push({
      id: this.nextAuditLogId++,
      officer_email: officerEmail,
      action_description: actionDesc,
      created_at: new Date().toISOString()
    })

    return { success: true }
  }

  // --- R2: Financial Reporting Engine ---

  public addExpense(
    description: string,
    amount: number,
    officerName: string,
    officerEmail: string,
    category: string = 'General'
  ): { success: boolean; expense?: ExpenseRecord; error?: string } {
    if (!this.officers.includes(officerEmail) && !this.moderators.includes(officerEmail)) {
      return { success: false, error: 'Unauthorized: Officer privileges required.' }
    }

    if (!description || description.trim() === '') {
      return { success: false, error: 'Expense description cannot be empty.' }
    }

    if (amount <= 0) {
      return { success: false, error: 'Expense amount must be greater than zero.' }
    }

    const expense: ExpenseRecord = {
      id: this.nextExpenseId++,
      description: description.trim(),
      amount,
      recorded_by: officerName,
      category,
      created_at: new Date().toISOString()
    }

    this.expenses.push(expense)

    this.auditLogs.push({
      id: this.nextAuditLogId++,
      officer_email: officerEmail,
      action_description: `Added expense: "${expense.description}" for ₱${expense.amount.toFixed(2)} (Spent by: ${officerName}).`,
      created_at: new Date().toISOString()
    })

    return { success: true, expense }
  }

  public getFinancialMetrics(): FinancialMetrics {
    const weeklyRate = 50.0 // ₱50 per week per student
    const totalWeeks = 10
    const totalStudents = this.students.length

    const paidPaymentsCount = this.payments.filter(p => p.status === 'paid').length
    const totalCollection = paidPaymentsCount * weeklyRate

    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0)
    const remainingBalance = totalCollection - totalExpenses

    const maxPossibleCollection = totalStudents * totalWeeks * weeklyRate
    const collectionRate = maxPossibleCollection > 0
      ? (totalCollection / maxPossibleCollection) * 100
      : 0

    const pendingReceiptsCount = this.receipts.filter(r => r.status === 'pending').length

    return {
      totalCollection,
      totalExpenses,
      remainingBalance,
      collectionRate,
      totalStudents,
      totalWeeks,
      paidPaymentsCount,
      pendingReceiptsCount
    }
  }

  public generatePaymentsCSV(): string {
    const headers = ['student_id', 'student_name', 'week_number', 'amount', 'status', 'payment_date', 'receipt_ref']
    const rows = this.payments.map(p => {
      const student = this.students.find(s => s.id === p.student_id)
      const name = student ? student.name : `Student ${p.student_id}`
      const receipt = p.receipt_id ? this.receipts.find(r => r.id === p.receipt_id) : null
      const ref = receipt ? receipt.reference_number : 'N/A'
      const date = p.paid_at || ''

      return [
        p.student_id,
        this.escapeCSV(name),
        p.week_number,
        '50.00',
        p.status,
        date,
        this.escapeCSV(ref)
      ].join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  public generateExpensesCSV(): string {
    const headers = ['expense_id', 'description', 'amount', 'recorded_by', 'category', 'date']
    const rows = this.expenses.map(e => [
      e.id,
      this.escapeCSV(e.description),
      e.amount.toFixed(2),
      this.escapeCSV(e.recorded_by),
      this.escapeCSV(e.category || 'General'),
      e.created_at
    ].join(','))

    return [headers.join(','), ...rows].join('\n')
  }

  public generateAuditLogsCSV(): string {
    const headers = ['log_id', 'timestamp', 'officer_email', 'action_description']
    const rows = this.auditLogs.map(l => [
      l.id,
      l.created_at,
      this.escapeCSV(l.officer_email),
      this.escapeCSV(l.action_description)
    ].join(','))

    return [headers.join(','), ...rows].join('\n')
  }

  public generatePDFStatementHTML(): string {
    const metrics = this.getFinancialMetrics()
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Class Fund Financial Statement</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .header { text-align: center; font-size: 24px; font-weight: bold; }
          .metrics { margin: 20px 0; display: flex; gap: 15px; }
          .metric-card { border: 1px solid #ccc; padding: 10px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">Class Fund Tracker — Financial Audit Statement</div>
        <div class="metrics">
          <div class="metric-card">Total Collections: ₱${metrics.totalCollection.toFixed(2)}</div>
          <div class="metric-card">Total Expenses: ₱${metrics.totalExpenses.toFixed(2)}</div>
          <div class="metric-card">Remaining Balance: ₱${metrics.remainingBalance.toFixed(2)}</div>
          <div class="metric-card">Collection Rate: ${metrics.collectionRate.toFixed(1)}%</div>
        </div>
        <h3>Expenses Breakdown</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Description</th><th>Amount</th><th>Spent By</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${this.expenses.map(e => `
              <tr>
                <td>${e.id}</td>
                <td>${this.escapeHTML(e.description)}</td>
                <td>₱${e.amount.toFixed(2)}</td>
                <td>${this.escapeHTML(e.recorded_by)}</td>
                <td>${e.created_at}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="signature-block">
          <div>Prepared by: Class Treasurer</div>
          <div>Verified by: Class Auditor</div>
        </div>
      </body>
      </html>
    `
  }

  private escapeCSV(field: string): string {
    if (!field) return '""'
    const str = String(field)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  private escapeHTML(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
