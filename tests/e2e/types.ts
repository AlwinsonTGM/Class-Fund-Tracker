/**
 * Shared Type Definitions for E2E Test Suite
 * Class Fund Tracker (Transparency Portal)
 */

export type TestTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4'
export type TestCategory = 'R1: Proof of Payment' | 'R2: Audit Reports' | 'R3: Modularization' | 'Cross-Feature' | 'Real-World'

export interface TestCase {
  id: string
  name: string
  tier: TestTier
  category: TestCategory
  description: string
  fn: () => Promise<void> | void
}

export interface TestResult {
  id: string
  name: string
  tier: TestTier
  category: TestCategory
  passed: boolean
  durationMs: number
  error?: string
}

export interface PaymentReceipt {
  id: number
  student_id: number
  student_name: string
  week_number: number
  amount: number
  reference_number: string
  receipt_url: string
  file_name: string
  file_size: number
  mime_type: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface PaymentRecord {
  id: number
  student_id: number
  week_number: number
  status: 'paid' | 'unpaid'
  paid_at?: string
  receipt_id?: number
}

export interface ExpenseRecord {
  id: number
  description: string
  amount: number
  recorded_by: string
  category?: string
  created_at: string
}

export interface AuditLogRecord {
  id: number
  officer_email: string
  action_description: string
  created_at: string
}

export interface StudentRecord {
  id: number
  name: string
  seat_number: number
  student_id_number: string
}

export interface FinancialMetrics {
  totalCollection: number
  totalExpenses: number
  remainingBalance: number
  collectionRate: number
  totalStudents: number
  totalWeeks: number
  paidPaymentsCount: number
  pendingReceiptsCount: number
}
