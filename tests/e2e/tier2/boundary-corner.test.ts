/**
 * Tier 2 Test Suite: Boundary & Corner Cases
 */

import { TestCase } from '../types'
import { MockClassFundEngine } from '../helpers/mock-supabase'
import { generateTestReceipt } from '../helpers/receipt-generator'
import { validateCSVHeaders, parseCSV } from '../helpers/export-validators'
import assert from 'assert'

export function getTier2BoundaryTests(engine: MockClassFundEngine): TestCase[] {
  return [
    {
      id: 'T2-BC-01',
      name: 'Empty Dataset Handling in CSV & PDF Export',
      tier: 'Tier 2',
      category: 'R2: Audit Reports',
      description: 'Export CSV and PDF reports when payments/expenses databases are empty; verify zero crash, valid headers, ₱0.00 balances',
      fn: () => {
        engine.reset()
        // Clear all initial records
        engine.students = []
        engine.payments = []
        engine.receipts = []
        engine.expenses = []
        engine.auditLogs = []

        const paymentsCSV = engine.generatePaymentsCSV()
        assert.ok(paymentsCSV.startsWith('student_id,student_name,week_number'), 'Payments CSV header should remain valid')

        const expensesCSV = engine.generateExpensesCSV()
        assert.ok(expensesCSV.startsWith('expense_id,description,amount'), 'Expenses CSV header should remain valid')

        const metrics = engine.getFinancialMetrics()
        assert.strictEqual(metrics.totalCollection, 0.0)
        assert.strictEqual(metrics.totalExpenses, 0.0)
        assert.strictEqual(metrics.remainingBalance, 0.0)

        const pdfHTML = engine.generatePDFStatementHTML()
        assert.ok(pdfHTML.includes('Remaining Balance: ₱0.00'))
      }
    },
    {
      id: 'T2-BC-02',
      name: 'Zero Balance Calculation and Math Bounds',
      tier: 'Tier 2',
      category: 'R2: Audit Reports',
      description: 'Verify financial metric engine handles zero students, zero weeks, zero payments without division-by-zero NaN errors',
      fn: () => {
        engine.reset()
        engine.students = []
        const metrics = engine.getFinancialMetrics()
        assert.strictEqual(isNaN(metrics.collectionRate), false, 'Collection rate must not be NaN')
        assert.strictEqual(metrics.collectionRate, 0.0)
      }
    },
    {
      id: 'T2-BC-03',
      name: 'Invalid Receipt File Extension Rejection',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Attempting receipt upload with prohibited extensions (.exe, .sh, .html, .txt) must return validation error',
      fn: () => {
        engine.reset()
        const invalidExtensions = ['script.exe', 'payload.sh', 'index.html', 'notes.txt']

        for (const fileName of invalidExtensions) {
          const res = engine.submitReceipt(generateTestReceipt({ file_name: fileName }))
          assert.strictEqual(res.success, false, `Upload of "${fileName}" should fail`)
          assert.ok(res.error?.includes('Invalid file extension'), 'Error message must specify invalid file extension')
        }
      }
    },
    {
      id: 'T2-BC-04',
      name: 'Oversized Receipt File Upload Enforcement',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Attempting receipt upload exceeding max 5MB size limit must be rejected',
      fn: () => {
        engine.reset()
        const oversizedBytes = 6 * 1024 * 1024 // 6 MB
        const res = engine.submitReceipt(generateTestReceipt({ file_size: oversizedBytes }))

        assert.strictEqual(res.success, false, 'Oversized receipt upload must be rejected')
        assert.ok(res.error?.includes('exceeds maximum limit of 5MB'))
      }
    },
    {
      id: 'T2-BC-05',
      name: 'Unauthorized Receipt Approval Attempt Rejection',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Non-whitelisted email trying to approve a receipt must be blocked with unauthorized error',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        const res = engine.approveReceipt(sub.receipt!.id, 'attacker@external.com')

        assert.strictEqual(res.success, false, 'Unauthorized approval must fail')
        assert.ok(res.error?.includes('Unauthorized'), 'Error message must specify unauthorized')

        const unapproved = engine.receipts.find(r => r.id === sub.receipt!.id)
        assert.strictEqual(unapproved?.status, 'pending', 'Receipt state must remain pending')
      }
    },
    {
      id: 'T2-BC-06',
      name: 'Negative or Zero Amount Validation Rejection',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Receipt submissions or expense additions with ₱0.00 or negative amounts must fail validation',
      fn: () => {
        engine.reset()
        const receiptRes = engine.submitReceipt(generateTestReceipt({ amount: -100.0 }))
        assert.strictEqual(receiptRes.success, false, 'Negative receipt amount must fail')

        const expRes = engine.addExpense('Invalid Item', -50.0, 'Officer', 'treasurer@class.edu')
        assert.strictEqual(expRes.success, false, 'Negative expense amount must fail')
      }
    },
    {
      id: 'T2-BC-07',
      name: 'XSS Sanitization in Notes and Rejection Reasons',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Receipt notes or rejection reasons containing HTML/script tags must be safely escaped in HTML output',
      fn: () => {
        engine.reset()
        const xssPayload = '<script>alert("XSS Attack!")</script>'
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 1, note: xssPayload }))

        engine.rejectReceipt(sub.receipt!.id, 'treasurer@class.edu', xssPayload)
        engine.addExpense(xssPayload, 100.0, 'Officer', 'treasurer@class.edu')

        const pdfHTML = engine.generatePDFStatementHTML()
        assert.strictEqual(pdfHTML.includes('<script>'), false, 'Unescaped <script> tag must not appear in HTML report')
        assert.ok(pdfHTML.includes('&lt;script&gt;'), 'HTML entities must be used for script tags')
      }
    },
    {
      id: 'T2-BC-08',
      name: 'SQL Injection String Escaping & Parameterization',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Reference numbers with SQL injection payload (\' OR 1=1; --) must be stored as literal text',
      fn: () => {
        engine.reset()
        const sqlPayload = "' OR 1=1; -- DROP TABLE payments;"
        const sub = engine.submitReceipt(generateTestReceipt({ reference_number: sqlPayload }))

        assert.strictEqual(sub.success, true, 'String containing SQL special chars should be accepted as literal string')
        assert.strictEqual(sub.receipt?.reference_number, sqlPayload, 'SQL payload must be stored strictly as literal string')
      }
    },
    {
      id: 'T2-BC-09',
      name: 'CSV Field Quotes and Comma Escaping Integrity (RFC 4180)',
      tier: 'Tier 2',
      category: 'R2: Audit Reports',
      description: 'Descriptions or names containing quotes, commas, and newlines must be double-quote escaped in CSV exports',
      fn: () => {
        engine.reset()
        const complexDesc = 'Lab Supplies, "Grade A", \n Item B'
        engine.addExpense(complexDesc, 250.00, 'Jane Officer', 'treasurer@class.edu')

        const csv = engine.generateExpensesCSV()
        const parsed = parseCSV(csv)

        assert.strictEqual(parsed.rows.length, 1)
        assert.strictEqual(parsed.rows[0][1], complexDesc, 'CSV parser must correctly preserve field value with quotes/commas')
      }
    },
    {
      id: 'T2-BC-10',
      name: 'Repeated Approval Attempts on Non-Pending Receipt',
      tier: 'Tier 2',
      category: 'R1: Proof of Payment',
      description: 'Attempting to approve or reject a receipt that is already approved/rejected must return an error',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')

        const secondApproval = engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')
        assert.strictEqual(secondApproval.success, false, 'Re-approving an already approved receipt must fail')
        assert.ok(secondApproval.error?.includes('already been approved'))
      }
    }
  ]
}
