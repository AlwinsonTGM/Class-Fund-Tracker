/**
 * Tier 1 Test Suite: R1 - Digital Proof of Payment & Officer Approval Portal
 */

import { TestCase } from '../types'
import { MockClassFundEngine } from '../helpers/mock-supabase'
import { generateTestReceipt } from '../helpers/receipt-generator'
import assert from 'assert'

export function getTier1R1Tests(engine: MockClassFundEngine): TestCase[] {
  return [
    {
      id: 'T1-R1-01',
      name: 'Receipt Upload with Valid File & Metadata',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify student can upload valid GCash/Maya receipt with metadata and status becomes pending',
      fn: () => {
        engine.reset()
        const payload = generateTestReceipt({
          student_id: 1,
          week_number: 2,
          amount: 50.0,
          file_name: 'gcash_receipt.png',
          mime_type: 'image/png'
        })

        const result = engine.submitReceipt(payload)
        assert.strictEqual(result.success, true, 'Receipt upload should succeed')
        assert.ok(result.receipt, 'Receipt object should be returned')
        assert.strictEqual(result.receipt?.status, 'pending', 'Initial status must be pending')
        assert.strictEqual(result.receipt?.student_id, 1)
        assert.strictEqual(result.receipt?.week_number, 2)
      }
    },
    {
      id: 'T1-R1-02',
      name: 'Pending Receipt Queue Indexing',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify submitted receipts appear in officer pending queue with correct details',
      fn: () => {
        engine.reset()
        engine.submitReceipt(generateTestReceipt({ student_id: 2, week_number: 1 }))
        engine.submitReceipt(generateTestReceipt({ student_id: 3, week_number: 1 }))

        const pendingQueue = engine.getPendingReceiptsQueue()
        assert.strictEqual(pendingQueue.length, 2, 'Pending queue should contain 2 receipts')
        assert.strictEqual(pendingQueue[0].student_id, 2)
        assert.strictEqual(pendingQueue[1].student_id, 3)
      }
    },
    {
      id: 'T1-R1-03',
      name: 'Officer Approval Action & State Transition',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify officer approval transitions receipt state from pending to approved',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 5, week_number: 3 }))
        const receiptId = sub.receipt!.id

        const approveResult = engine.approveReceipt(receiptId, 'treasurer@class.edu')
        assert.strictEqual(approveResult.success, true, 'Approval action should succeed')

        const approvedReceipt = engine.receipts.find(r => r.id === receiptId)
        assert.strictEqual(approvedReceipt?.status, 'approved', 'Receipt status should be approved')
        assert.strictEqual(approvedReceipt?.reviewed_by, 'treasurer@class.edu')
      }
    },
    {
      id: 'T1-R1-04',
      name: 'Payment Status Sync Upon Officer Approval',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify officer approval automatically updates payments table status to paid',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 10, week_number: 4 }))
        engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')

        const payment = engine.payments.find(p => p.student_id === 10 && p.week_number === 4)
        assert.ok(payment, 'Payment record should be created/updated')
        assert.strictEqual(payment?.status, 'paid', 'Payment status should be paid')
        assert.strictEqual(payment?.receipt_id, sub.receipt!.id)
      }
    },
    {
      id: 'T1-R1-05',
      name: 'Officer Rejection Action & Reason Recording',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify officer rejection updates status to rejected with reason recorded',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 12, week_number: 1 }))
        const rejectResult = engine.rejectReceipt(sub.receipt!.id, 'treasurer@class.edu', 'Blurry receipt image')

        assert.strictEqual(rejectResult.success, true, 'Rejection should succeed')
        const rejectedReceipt = engine.receipts.find(r => r.id === sub.receipt!.id)
        assert.strictEqual(rejectedReceipt?.status, 'rejected')
        assert.strictEqual(rejectedReceipt?.rejection_reason, 'Blurry receipt image')

        const payment = engine.payments.find(p => p.student_id === 12 && p.week_number === 1)
        assert.strictEqual(payment, undefined, 'No paid record should exist for rejected receipt')
      }
    },
    {
      id: 'T1-R1-06',
      name: 'Audit Log Generation on Receipt Decision',
      tier: 'Tier 1',
      category: 'R1: Proof of Payment',
      description: 'Verify approving or rejecting receipt automatically generates an audit log entry',
      fn: () => {
        engine.reset()
        const sub1 = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        const sub2 = engine.submitReceipt(generateTestReceipt({ student_id: 2, week_number: 1 }))

        engine.approveReceipt(sub1.receipt!.id, 'treasurer@class.edu')
        engine.rejectReceipt(sub2.receipt!.id, 'officer1@class.edu', 'Duplicate reference')

        assert.strictEqual(engine.auditLogs.length, 2, 'Two audit log entries should be created')
        assert.ok(engine.auditLogs[0].action_description.includes('Approved payment receipt'))
        assert.ok(engine.auditLogs[1].action_description.includes('Rejected payment receipt'))
      }
    }
  ]
}
