'use client'

import React, { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Check,
  X,
  CreditCard
} from 'lucide-react'
import {
  approvePaymentReceiptAction,
  rejectPaymentReceiptAction
} from '@/app/officer-dashboard/actions'

export interface ReceiptItem {
  id: number
  student_id: number
  student_name: string
  week_number: number
  amount: number
  payment_method?: string
  receipt_url: string
  reference_number?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  note?: string
  status: 'pending' | 'approved' | 'rejected' | string
  rejection_reason?: string
  created_at?: string
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
}

interface OfficerReceiptApprovalQueueProps {
  receipts: ReceiptItem[]
  onUpdate?: () => void
  defaultOpen?: boolean
}

import { CollapsibleSection } from '@/components/ui/collapsible-section'

export function OfficerReceiptApprovalQueue({
  receipts = [],
  onUpdate,
  defaultOpen = false
}: OfficerReceiptApprovalQueueProps) {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  // Full-resolution Image Modal State
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  // Rejection Modal State
  const [rejectingReceiptId, setRejectingReceiptId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Loading states
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Filter receipts
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesFilter = activeFilter === 'all' || receipt.status === activeFilter
    const nameMatch = receipt.student_name.toLowerCase().includes(searchQuery.toLowerCase())
    const refMatch = (receipt.reference_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    const weekMatch = receipt.week_number.toString().includes(searchQuery)
    return matchesFilter && (nameMatch || refMatch || weekMatch)
  })

  const pendingCount = receipts.filter((r) => r.status === 'pending').length
  const approvedCount = receipts.filter((r) => r.status === 'approved').length
  const rejectedCount = receipts.filter((r) => r.status === 'rejected').length

  const handleApprove = async (receiptId: number) => {
    setProcessingId(receiptId)
    setActionError(null)
    setActionSuccess(null)

    try {
      const res = await approvePaymentReceiptAction(receiptId)
      if (res.success) {
        setActionSuccess(`Receipt #${receiptId} approved successfully!`)
        if (onUpdate) onUpdate()
      } else {
        setActionError(res.error || 'Failed to approve receipt.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error approving receipt'
      setActionError(msg)
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingReceiptId) return

    setProcessingId(rejectingReceiptId)
    setActionError(null)
    setActionSuccess(null)

    try {
      const res = await rejectPaymentReceiptAction(rejectingReceiptId, rejectionReason)
      if (res.success) {
        setActionSuccess(`Receipt #${rejectingReceiptId} rejected.`)
        setRejectingReceiptId(null)
        setRejectionReason('')
        if (onUpdate) onUpdate()
      } else {
        setActionError(res.error || 'Failed to reject receipt.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error rejecting receipt'
      setActionError(msg)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <CollapsibleSection
      title="Digital Proof Approval Queue"
      subtitle="Review student payment screenshots and update payment records with 1-click approvals"
      badgeText={pendingCount > 0 ? `${pendingCount} Pending` : 'Approval Queue'}
      defaultOpen={defaultOpen}
    >
      <section className="flex flex-col gap-5">
        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1 border border-border/40 w-full sm:w-auto sm:min-w-[360px]">
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shrink-0 ${
                activeFilter === 'pending'
                  ? 'bg-card text-foreground shadow-xs border border-border/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending ({pendingCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('approved')}
              className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shrink-0 ${
                activeFilter === 'approved'
                  ? 'bg-card text-foreground shadow-xs border border-border/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Approved ({approvedCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('rejected')}
              className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shrink-0 ${
                activeFilter === 'rejected'
                  ? 'bg-card text-foreground shadow-xs border border-border/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Rejected ({rejectedCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-card text-foreground shadow-xs border border-border/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({receipts.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm w-full">
            <input
              type="text"
              placeholder="Filter by name, week, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 min-h-[44px] pl-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          </div>
        </div>

      {/* Alert Banners */}
      {actionError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="min-h-[44px] min-w-[44px] p-3 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs font-medium text-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="min-h-[44px] min-w-[44px] p-3 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Receipts Cards Grid / List */}
      {filteredReceipts.length === 0 ? (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-semibold text-foreground">No receipts found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeFilter === 'pending'
              ? 'Great job! There are no pending payment receipts awaiting review.'
              : 'No receipts match the selected filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReceipts.map((receipt) => {
            const isPending = receipt.status === 'pending'
            const isApproved = receipt.status === 'approved'
            const isRejected = receipt.status === 'rejected'
            const isProcessing = processingId === receipt.id

            return (
              <div
                key={receipt.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-md transition-all"
              >
                {/* Top Details & Thumbnail */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail Preview */}
                  <div
                    onClick={() => setViewingImage(receipt.receipt_url)}
                    className="group relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted cursor-pointer"
                  >
                    <img
                      src={receipt.receipt_url}
                      alt={`Receipt ${receipt.id}`}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Fallback image icon if url fail
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Student & Payment Metadata */}
                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {receipt.student_name}
                      </h4>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : isApproved
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}
                      >
                        {isPending && <Clock className="h-3 w-3" />}
                        {isApproved && <CheckCircle className="h-3 w-3" />}
                        {isRejected && <XCircle className="h-3 w-3" />}
                        <span>{receipt.status}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">Week {receipt.week_number}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">₱{Number(receipt.amount).toFixed(2)}</span>
                      <span>•</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                        {receipt.payment_method || 'GCash'}
                      </span>
                    </div>

                    {receipt.reference_number && (
                      <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                        Ref: <strong className="text-foreground">{receipt.reference_number}</strong>
                      </p>
                    )}

                    {receipt.note && (
                      <p className="text-xs text-muted-foreground/90 italic truncate mt-0.5">
                        "{receipt.note}"
                      </p>
                    )}

                    {isRejected && receipt.rejection_reason && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        Reason: {receipt.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-t border-border/60 pt-3 mt-3">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {receipt.submitted_at || receipt.created_at
                        ? new Date(receipt.submitted_at || receipt.created_at!).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectingReceiptId(receipt.id)
                          setRejectionReason('')
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-50 press-spring"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(receipt.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50 press-spring"
                      >
                        {isProcessing ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        <span>Approve</span>
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <div className="text-xs text-muted-foreground">
                      Reviewed by: <strong className="text-foreground">{receipt.reviewed_by || 'Officer'}</strong>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Full Resolution Image Preview */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-slide-in"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 z-10 size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={viewingImage}
              alt="Full Receipt"
              className="max-h-[85vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal: Rejection Reason Input */}
      {rejectingReceiptId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-slide-in"
          onClick={() => setRejectingReceiptId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-semibold text-card-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Reject Payment Receipt #{rejectingReceiptId}</span>
              </h3>
              <button
                onClick={() => setRejectingReceiptId(null)}
                className="rounded-full size-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Unclear receipt screenshot, wrong reference number, or duplicate submission..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setRejectingReceiptId(null)}
                  className="rounded-xl border border-border px-4 py-2.5 min-h-[44px] flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processingId === rejectingReceiptId}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-4 py-2.5 min-h-[44px] text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 transition-all cursor-pointer press-spring"
                >
                  {processingId === rejectingReceiptId ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
    </CollapsibleSection>
  )
}
