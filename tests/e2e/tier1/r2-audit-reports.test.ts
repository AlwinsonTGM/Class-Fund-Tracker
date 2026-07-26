/**
 * Tier 1 Test Suite: R2 - Exportable Financial Audit Reports
 */

import { TestCase } from '../types'
import { MockClassFundEngine } from '../helpers/mock-supabase'
import { generateTestReceipt } from '../helpers/receipt-generator'
import { validateCSVHeaders, parseCSV, validatePDFHTMLStructure } from '../helpers/export-validators'
import assert from 'assert'

export function getTier1R2Tests(engine: MockClassFundEngine): TestCase[] {
  return [
    {
      id: 'T1-R2-01',
      name: 'Payments CSV Data Export Headers & Formatting',
      tier: 'Tier 1',
      category: 'R2: Audit Reports',
      description: 'Verify payments CSV export contains exact required headers and valid rows',
      fn: () => {
        engine.reset()
        const sub = engine.submitReceipt(generateTestReceipt({ student_id: 1, week_number: 1 }))
        engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')

        const csv = engine.generatePaymentsCSV()
        const expectedHeaders = ['student_id', 'student_name', 'week_number', 'amount', 'status', 'payment_date', 'receipt_ref']
        assert.strictEqual(validateCSVHeaders(csv, expectedHeaders), true, 'Payments CSV headers must match spec')

        const parsed = parseCSV(csv)
        assert.strictEqual(parsed.rows.length, 1, 'Should contain 1 payment row')
        assert.strictEqual(parsed.rows[0][0], '1')
        assert.strictEqual(parsed.rows[0][4], 'paid')
      }
    },
    {
      id: 'T1-R2-02',
      name: 'Expenses CSV Data Export Headers & Amounts',
      tier: 'Tier 1',
      category: 'R2: Audit Reports',
      description: 'Verify expenses CSV export contains exact required headers and accurate amounts',
      fn: () => {
        engine.reset()
        engine.addExpense('Printer Paper & Cartridge', 450.0, 'Jane Treasurer', 'treasurer@class.edu', 'Supplies')

        const csv = engine.generateExpensesCSV()
        const expectedHeaders = ['expense_id', 'description', 'amount', 'recorded_by', 'category', 'date']
        assert.strictEqual(validateCSVHeaders(csv, expectedHeaders), true, 'Expenses CSV headers must match spec')

        const parsed = parseCSV(csv)
        assert.strictEqual(parsed.rows.length, 1)
        assert.strictEqual(parsed.rows[0][1], 'Printer Paper & Cartridge')
        assert.strictEqual(parsed.rows[0][2], '450.00')
      }
    },
    {
      id: 'T1-R2-03',
      name: 'Audit Logs CSV Data Export Structure',
      tier: 'Tier 1',
      category: 'R2: Audit Reports',
      description: 'Verify audit logs CSV export contains log_id, timestamp, officer_email, action_description',
      fn: () => {
        engine.reset()
        engine.addExpense('Board Markers', 120.0, 'John Officer', 'officer1@class.edu')

        const csv = engine.generateAuditLogsCSV()
        const expectedHeaders = ['log_id', 'timestamp', 'officer_email', 'action_description']
        assert.strictEqual(validateCSVHeaders(csv, expectedHeaders), true)

        const parsed = parseCSV(csv)
        assert.strictEqual(parsed.rows.length, 1)
        assert.strictEqual(parsed.rows[0][2], 'officer1@class.edu')
      }
    },
    {
      id: 'T1-R2-04',
      name: 'PDF / Printable Financial Statement Summary Metrics Calculation',
      tier: 'Tier 1',
      category: 'R2: Audit Reports',
      description: 'Verify total collection, expenses, and net remaining balance metrics calculation',
      fn: () => {
        engine.reset()
        // Approve 10 student payments (10 * ₱50 = ₱500)
        for (let i = 1; i <= 10; i++) {
          const sub = engine.submitReceipt(generateTestReceipt({ student_id: i, week_number: 1 }))
          engine.approveReceipt(sub.receipt!.id, 'treasurer@class.edu')
        }

        // Add ₱150 expense
        engine.addExpense('Class Banner', 150.0, 'Jane Officer', 'treasurer@class.edu')

        const metrics = engine.getFinancialMetrics()
        assert.strictEqual(metrics.totalCollection, 500.0, 'Total collection should be ₱500')
        assert.strictEqual(metrics.totalExpenses, 150.0, 'Total expenses should be ₱150')
        assert.strictEqual(metrics.remainingBalance, 350.0, 'Remaining balance should be ₱350')
      }
    },
    {
      id: 'T1-R2-05',
      name: 'PDF Financial Statement Printable HTML Layout & Sections',
      tier: 'Tier 1',
      category: 'R2: Audit Reports',
      description: 'Verify PDF statement generator produces complete HTML layout with title, cards, table, and signatures',
      fn: () => {
        engine.reset()
        engine.addExpense('Chalk Box', 80.0, 'Officer', 'officer1@class.edu')
        const html = engine.generatePDFStatementHTML()

        const val = validatePDFHTMLStructure(html)
        assert.strictEqual(val.hasTitle, true, 'HTML statement must have title')
        assert.strictEqual(val.hasMetrics, true, 'HTML statement must have metric cards')
        assert.strictEqual(val.hasExpenseTable, true, 'HTML statement must have expense table')
        assert.strictEqual(val.hasSignatures, true, 'HTML statement must have signature block')
      }
    }
  ]
}
