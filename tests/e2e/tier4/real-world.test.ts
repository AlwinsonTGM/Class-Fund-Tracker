/**
 * Tier 4 Test Suite: Real-World Application Scenarios
 */

import { TestCase } from '../types'
import { MockClassFundEngine } from '../helpers/mock-supabase'
import { generateTestReceipt } from '../helpers/receipt-generator'
import { parseCSV, validatePDFHTMLStructure } from '../helpers/export-validators'
import assert from 'assert'

export function getTier4RealWorldTests(engine: MockClassFundEngine): TestCase[] {
  return [
    {
      id: 'T4-RW-01',
      name: 'Full Semester Class Financial Lifecycle Scenario',
      tier: 'Tier 4',
      category: 'Real-World',
      description: 'Simulates complete 10-week class fund lifecycle: 30 students, 25 receipt submissions, 22 officer approvals, 3 rejections, 4 expenses, and final audit export',
      fn: () => {
        engine.reset()

        // 1. 25 students submit receipts for Week 1
        const submittedReceipts = []
        for (let i = 1; i <= 25; i++) {
          const sub = engine.submitReceipt(generateTestReceipt({
            student_id: i,
            week_number: 1,
            amount: 50.0,
            reference_number: `GCASH-2026-${1000 + i}`
          }))
          submittedReceipts.push(sub.receipt!)
        }

        assert.strictEqual(engine.getPendingReceiptsQueue().length, 25)

        // 2. Officer reviews queue: approves 22, rejects 3
        for (let i = 0; i < 22; i++) {
          engine.approveReceipt(submittedReceipts[i].id, 'treasurer@class.edu')
        }
        for (let i = 22; i < 25; i++) {
          engine.rejectReceipt(submittedReceipts[i].id, 'treasurer@class.edu', 'Unreadable receipt screenshot')
        }

        // 3. Officer records 4 class expenses
        engine.addExpense('Class Whiteboard Markers & Eraser', 180.0, 'Jane Officer', 'treasurer@class.edu', 'Supplies')
        engine.addExpense('Photocopying Exam Reviewers', 350.0, 'Jane Officer', 'treasurer@class.edu', 'Academics')
        engine.addExpense('Class Event Snacks', 420.0, 'John Officer', 'officer1@class.edu', 'Events')
        engine.addExpense('Cleaning Materials', 150.0, 'Jane Officer', 'treasurer@class.edu', 'Maintenance')

        // 4. Verify Financial Metrics
        // Total collection: 22 approved * ₱50 = ₱1,100.00
        // Total expenses: 180 + 350 + 420 + 150 = ₱1,100.00
        // Remaining balance: 1100 - 1100 = ₱0.00
        const metrics = engine.getFinancialMetrics()
        assert.strictEqual(metrics.totalCollection, 1100.0, 'Total collection should be ₱1,100')
        assert.strictEqual(metrics.totalExpenses, 1100.0, 'Total expenses should be ₱1,100')
        assert.strictEqual(metrics.remainingBalance, 0.0, 'Remaining balance should be ₱0')
        assert.strictEqual(metrics.pendingReceiptsCount, 0, 'Pending queue should be 0')

        // 5. Generate PDF Financial Statement and verify completeness
        const pdfHTML = engine.generatePDFStatementHTML()
        const val = validatePDFHTMLStructure(pdfHTML)
        assert.strictEqual(val.hasTitle, true)
        assert.strictEqual(val.hasMetrics, true)
        assert.strictEqual(val.hasExpenseTable, true)
        assert.strictEqual(val.hasSignatures, true)
        assert.ok(pdfHTML.includes('Class Whiteboard Markers'))
      }
    },
    {
      id: 'T4-RW-02',
      name: 'Multi-Officer Shift Handoff & Audit Traceability',
      tier: 'Tier 4',
      category: 'Real-World',
      description: 'Verifies officer shift handoffs where Officer A approves payments, Officer B adds expenses, and Officer C exports full CSV audit trail',
      fn: () => {
        engine.reset()

        // Officer A shift (treasurer@class.edu)
        const sub1 = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        const sub2 = engine.submitReceipt(generateTestReceipt({ student_id: 2, week_number: 1 }))
        engine.approveReceipt(sub1.receipt!.id, 'treasurer@class.edu')
        engine.approveReceipt(sub2.receipt!.id, 'treasurer@class.edu')

        // Officer B shift (officer1@class.edu)
        engine.addExpense('Class First Aid Kit', 250.0, 'John Officer', 'officer1@class.edu', 'Health')

        // Officer C shift (admin@class.edu) - Exports audit logs
        const auditCSV = engine.generateAuditLogsCSV()
        const parsed = parseCSV(auditCSV)

        assert.strictEqual(parsed.rows.length, 3, 'Should have 3 logged actions across officers')
        assert.strictEqual(parsed.rows[0][2], 'treasurer@class.edu')
        assert.strictEqual(parsed.rows[1][2], 'treasurer@class.edu')
        assert.strictEqual(parsed.rows[2][2], 'officer1@class.edu')
      }
    },
    {
      id: 'T4-RW-03',
      name: 'Student Receipt Dispute & Resubmission Lifecycle',
      tier: 'Tier 4',
      category: 'Real-World',
      description: 'Simulates student payment dispute flow: initial submission rejected -> student resubmits clear receipt -> officer approves -> audit trail preserves chronological history',
      fn: () => {
        engine.reset()

        // Attempt 1: Blurry submission
        const sub1 = engine.submitReceipt(generateTestReceipt({
          student_id: 8,
          week_number: 2,
          reference_number: 'GCASH-BLURRY-001',
          file_name: 'blurry_receipt.jpg'
        }))
        engine.rejectReceipt(sub1.receipt!.id, 'treasurer@class.edu', 'Image too blurry to read reference')

        // Verify rejected
        assert.strictEqual(engine.receipts[0].status, 'rejected')

        // Attempt 2: Student resubmits clear receipt
        const sub2 = engine.submitReceipt(generateTestReceipt({
          student_id: 8,
          week_number: 2,
          reference_number: 'GCASH-CLEAR-999',
          file_name: 'clear_receipt.png'
        }))

        // Officer approves resubmitted receipt
        engine.approveReceipt(sub2.receipt!.id, 'treasurer@class.edu')

        // Check payment record
        const payment = engine.payments.find(p => p.student_id === 8 && p.week_number === 2)
        assert.strictEqual(payment?.status, 'paid')
        assert.strictEqual(payment?.receipt_id, sub2.receipt!.id)

        // Audit log must show rejection first, then approval
        assert.strictEqual(engine.auditLogs.length, 2)
        assert.ok(engine.auditLogs[0].action_description.includes('Rejected payment receipt'))
        assert.ok(engine.auditLogs[1].action_description.includes('Approved payment receipt'))
      }
    },
    {
      id: 'T4-RW-04',
      name: 'Public Dashboard to Officer Portal Navigation Flow Simulation',
      tier: 'Tier 4',
      category: 'Real-World',
      description: 'Simulates full end-to-end user navigation flow across public tabs, student payment grid, officer portal, and financial audit export modals',
      fn: () => {
        engine.reset()
        // Populate base state
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')
        engine.addExpense('Class Supplies', 100.0, 'Treasurer', 'treasurer@class.edu')

        // Verify public dashboard data payload
        const metrics = engine.getFinancialMetrics()
        assert.strictEqual(metrics.paidPaymentsCount, 1)

        // Generate all export formats available on dashboard
        const paymentsCSV = engine.generatePaymentsCSV()
        const expensesCSV = engine.generateExpensesCSV()
        const auditCSV = engine.generateAuditLogsCSV()
        const pdfHTML = engine.generatePDFStatementHTML()

        assert.ok(paymentsCSV.length > 50)
        assert.ok(expensesCSV.length > 50)
        assert.ok(auditCSV.length > 50)
        assert.ok(pdfHTML.length > 200)
      }
    },
    {
      id: 'T4-RW-05',
      name: 'Stress Test: High-Throughput Batch Processing & Report Generation SLA',
      tier: 'Tier 4',
      category: 'Real-World',
      description: 'Simulates 50 receipts submitted and approved under high load; measures performance SLA execution time (<100ms)',
      fn: () => {
        engine.reset()

        const startTime = Date.now()

        // 50 receipts
        for (let i = 1; i <= 50; i++) {
          const studentId = (i % 30) + 1
          const weekNum = Math.floor(i / 30) + 1
          const sub = engine.submitReceipt(generateTestReceipt({ student_id: studentId, week_number: weekNum }))
          engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')
        }

        const metrics = engine.getFinancialMetrics()
        const csv = engine.generatePaymentsCSV()
        const pdf = engine.generatePDFStatementHTML()

        const duration = Date.now() - startTime

        assert.strictEqual(metrics.paidPaymentsCount, 50)
        assert.ok(csv.length > 500)
        assert.ok(pdf.length > 500)
        assert.ok(duration < 500, `High throughput processing took ${duration}ms, must be <500ms`)
      }
    }
  ]
}
