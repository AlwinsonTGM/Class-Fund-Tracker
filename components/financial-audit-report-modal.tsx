'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, Download, X, FileText, PieChart } from 'lucide-react'
import {
  generatePaymentMatrixCSV,
  generatePaymentsCSV,
  generateExpensesCSV,
  downloadCSV,
  ExportStudent,
  ExportPayment,
  ExportWeek,
  ExportExpense,
  ExportReceipt
} from '@/lib/csv-exporter'

import { findCurrentWeekNumber } from '@/lib/week-utils'

export interface FinancialAuditReportModalProps {
  students?: ExportStudent[]
  payments?: ExportPayment[]
  weeks?: ExportWeek[]
  expenses?: ExportExpense[]
  receipts?: ExportReceipt[]
  isOpen?: boolean
  onClose?: () => void
  fullWidth?: boolean
}

export function FinancialAuditReportModal({
  students = [],
  payments = [],
  weeks = [],
  expenses = [],
  receipts = [],
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  fullWidth = false
}: FinancialAuditReportModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isControlled = typeof externalIsOpen === 'boolean'
  const isOpen = isControlled ? externalIsOpen : internalIsOpen

  const handleOpen = () => {
    if (!isControlled) setInternalIsOpen(true)
  }

  const handleClose = () => {
    if (isControlled) {
      externalOnClose?.()
    } else {
      setInternalIsOpen(false)
    }
  }

  // Calculate core metrics
  const paidPayments = payments.filter((p) => p.status === 'paid')
  const totalCollections = paidPayments.reduce(
    (sum, p) => sum + (typeof p.amount === 'number' ? p.amount : 5.0),
    0
  )
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const remainingBalance = totalCollections - totalExpenses

  // Determine active / elapsed weeks up to the current date / active week
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)
  const currentWeekNum = findCurrentWeekNumber(weeks as any)
  const elapsedWeeksCount = sortedWeeks.filter((w) => w.week_number <= currentWeekNum).length || 1

  // Calculate total possible dues for elapsed weeks up to current week
  const totalPossibleDues = (students.length || 0) * elapsedWeeksCount * 5.0
  const outstandingDues = Math.max(0, totalPossibleDues - totalCollections)

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleExportMatrixCSV = () => {
    const csv = generatePaymentMatrixCSV(students, payments, weeks)
    downloadCSV(`payment_matrix_${Date.now()}.csv`, csv)
  }

  const handleExportHistoryCSV = () => {
    const csv = generatePaymentsCSV(students, payments, receipts)
    downloadCSV(`student_payment_history_${Date.now()}.csv`, csv)
  }

  const handleExportExpensesCSV = () => {
    const csv = generateExpensesCSV(expenses)
    downloadCSV(`expense_logs_${Date.now()}.csv`, csv)
  }

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto print:block financial-audit-modal-portal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-report-title"
    >
      {/* Modal Card container */}
      <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full print:bg-white print:text-black print:overflow-visible print:p-0 print:static">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-border px-3 sm:px-6 py-3 sm:py-4 bg-muted/40 print:hidden shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <h2 id="audit-report-title" className="text-xs sm:text-lg font-bold truncate">
              Financial Audit Report & Statement
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              title="Print / Save as PDF"
              aria-label="Print / Save as PDF"
              className="min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full cursor-pointer transition-colors flex items-center justify-center gap-1 sm:gap-1.5 press-spring whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline">Print / Save as PDF</span>
              <span className="whitespace-nowrap xs:hidden">Print PDF</span>
            </button>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground size-9 sm:size-11 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Action Bar for CSV Exports (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/60 bg-card px-6 py-3 text-xs print:hidden shrink-0">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Export Data (CSV):
          </span>
          <div className="flex flex-col xs:flex-row flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportMatrixCSV}
              className="w-full xs:w-auto min-h-[44px] px-3 py-2 font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              Payment Matrix CSV
            </button>
            <button
              onClick={handleExportHistoryCSV}
              className="w-full xs:w-auto min-h-[44px] px-3 py-2 font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              Payment History CSV
            </button>
            <button
              onClick={handleExportExpensesCSV}
              className="w-full xs:w-auto min-h-[44px] px-3 py-2 font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              Expense Logs CSV
            </button>
          </div>
        </div>

        {/* Scrollable Printable Statement Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-foreground print:p-0 print:overflow-visible print:text-black print:space-y-5">
          
          {/* Statement Header */}
          <div className="border-b border-border pb-4 print:border-black print:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground print:text-black">
                  Class Fund Tracker — Financial Audit Statement
                </h1>
                <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                  Official Class Treasury Statement & Expense Audit Breakdown
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-muted-foreground print:text-gray-600">
                <p>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                <p>Status: Verified Official</p>
              </div>
            </div>
          </div>

          {/* Financial Summary Metric Cards Grid */}
          <div className="print-break-inside-avoid">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-700 mb-3 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 print:hidden" /> Summary Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 print:grid-cols-4 print:gap-3">
              <div className="p-2.5 sm:p-4 rounded-2xl bg-muted/50 border border-border print:bg-white print:border-gray-300">
                <p className="text-xs font-medium text-muted-foreground print:text-gray-600">Total Collections</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-foreground print:text-black mt-1">
                  ₱{totalCollections.toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 sm:p-4 rounded-2xl bg-muted/50 border border-border print:bg-white print:border-gray-300">
                <p className="text-xs font-medium text-muted-foreground print:text-gray-600">Total Expenses</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-destructive print:text-black mt-1">
                  ₱{totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 sm:p-4 rounded-2xl bg-muted/50 border border-border print:bg-white print:border-gray-300">
                <p className="text-xs font-medium text-muted-foreground print:text-gray-600">Remaining Balance</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-primary print:text-black mt-1">
                  ₱{remainingBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 sm:p-4 rounded-2xl bg-muted/50 border border-border print:bg-white print:border-gray-300">
                <p className="text-xs font-medium text-muted-foreground print:text-gray-600">Outstanding Dues (As of Wk {currentWeekNum})</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400 print:text-black mt-1">
                  ₱{outstandingDues.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Recorded Expenses Breakdown Table */}
          <div className="print-break-inside-avoid">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-700 mb-3">
              Expenses Breakdown
            </h3>
            {expenses.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl print:border-gray-300">
                No recorded expenses found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border print:border-gray-300 print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border print:bg-gray-100 print:border-gray-300">
                      <th className="p-3 font-semibold text-foreground print:text-black">ID</th>
                      <th className="p-3 font-semibold text-foreground print:text-black">Description</th>
                      <th className="p-3 font-semibold text-foreground print:text-black">Amount</th>
                      <th className="p-3 font-semibold text-foreground print:text-black">Spent By</th>
                      <th className="p-3 font-semibold text-foreground print:text-black">Category</th>
                      <th className="p-3 font-semibold text-foreground print:text-black">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border print:divide-gray-300">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground print:text-black">{e.id}</td>
                        <td className="p-3 text-foreground print:text-black font-medium">{e.description}</td>
                        <td className="p-3 text-destructive font-semibold print:text-black">
                          ₱{Number(e.amount).toFixed(2)}
                        </td>
                        <td className="p-3 text-muted-foreground print:text-gray-800">{e.recorded_by || 'Officer'}</td>
                        <td className="p-3 text-muted-foreground print:text-gray-800">{e.category || 'General'}</td>
                        <td className="p-3 text-muted-foreground print:text-gray-800">
                          {e.created_at ? new Date(e.created_at).toLocaleDateString('en-US') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Official Signatures Block */}
          <div className="pt-8 border-t border-border print:border-gray-300 mt-8 print:mt-6 print:pt-4 print-break-inside-avoid">
            <div className="flex flex-row justify-between items-end gap-8 pt-4 print:pt-2">
              <div className="flex-1 text-center">
                <div className="border-b border-foreground/40 print:border-black pb-1 font-semibold text-xs text-foreground print:text-black">
                  Prepared by: Class Treasurer
                </div>
                <p className="text-[10px] text-muted-foreground print:text-gray-600 mt-1">Authorized Treasury Signature</p>
              </div>

              <div className="flex-1 text-center">
                <div className="border-b border-foreground/40 print:border-black pb-1 font-semibold text-xs text-foreground print:text-black">
                  Verified by: Class Auditor
                </div>
                <p className="text-[10px] text-muted-foreground print:text-gray-600 mt-1">Audit Verification Sign-off</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  return (
    <>
      {!isControlled && (
        fullWidth ? (
          <button
            onClick={handleOpen}
            title="Financial Audit Report"
            className="w-full min-h-[44px] px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors press-spring"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Financial Audit Report</span>
          </button>
        ) : (
          <button
            onClick={handleOpen}
            title="Financial Audit Report"
            aria-label="Financial Audit Report"
            className="size-8 xs:size-9 sm:w-auto shrink-0 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full sm:px-3 sm:py-1.5 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors press-spring"
          >
            <FileText className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Financial Audit Report</span>
          </button>
        )
      )}

      {mounted && typeof window !== 'undefined' && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  )
}
