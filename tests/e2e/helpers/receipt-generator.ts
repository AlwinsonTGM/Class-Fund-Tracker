/**
 * Helper utilities for generating test digital payment receipts and metadata
 */

export interface GeneratedReceipt {
  student_id: number
  student_name: string
  week_number: number
  amount: number
  reference_number: string
  file_name: string
  file_size: number
  mime_type: string
  note?: string
}

export function generateTestReceipt(overrides: Partial<GeneratedReceipt> = {}): GeneratedReceipt {
  const randomRef = 'GCASH-' + Math.floor(1000000000 + Math.random() * 9000000000)
  return {
    student_id: 1,
    student_name: 'John Doe',
    week_number: 1,
    amount: 50.0,
    reference_number: randomRef,
    file_name: 'receipt_week1.png',
    file_size: 1024 * 500, // 500 KB
    mime_type: 'image/png',
    note: 'Payment for Week 1 via GCash',
    ...overrides
  }
}
