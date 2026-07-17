'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { addExpenseAction } from '@/app/officer-dashboard/actions'

const OFFICER_ROLES = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Auditor',
  'P.R.O.',
  'Representative'
]

export function AddExpenseModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [officerName, setOfficerName] = useState(OFFICER_ROLES[0])
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleOpen = () => {
    setError(null)
    setDescription('')
    setAmount('')
    setOfficerName(OFFICER_ROLES[0])
    setIsOpen(true)
  }

  const handleClose = () => {
    if (!isPending) {
      setIsClosing(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsClosing(false)
      }, 150)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !officerName) {
      setError('Please fill in all fields.')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const result = await addExpenseAction(description, numAmount, officerName)
        if (result && result.success) {
          setIsOpen(false)
          setIsClosing(false)
        } else {
          setError('Failed to record expense. Please try again.')
        }
      } catch (err: any) {
        console.error('Error adding expense:', err)
        setError(err.message || 'An unexpected error occurred.')
      }
    })
  }

  const modalContent = isOpen && (
    <div className={`fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 overflow-y-auto ${isClosing ? 'anim-modal-overlay-out' : 'anim-modal-overlay-in'}`}>
      {/* Modal Card */}
      <div
        className={`bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 flex flex-col gap-5 gpu-accelerate ${isClosing ? 'anim-modal-card-out' : 'anim-modal-card-in'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h3 id="modal-title" className="text-xl font-bold text-card-foreground">
            Record New Expense
          </h3>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground text-lg cursor-pointer size-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <input
              id="description"
              type="text"
              required
              disabled={isPending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Whiteboard markers, cleaning materials"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Amount (₱)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              disabled={isPending}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Officer Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="officer-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Officer Name / Role
            </label>
            <select
              id="officer-name"
              required
              disabled={isPending}
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              {OFFICER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold border border-border hover:bg-muted rounded-full text-foreground cursor-pointer disabled:opacity-50 press-spring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold bg-foreground hover:bg-[#383838] rounded-full text-background cursor-pointer disabled:opacity-50 flex items-center gap-1.5 press-spring"
            >
              {isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : null}
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="shrink-0 text-xs font-semibold text-background bg-foreground hover:bg-[#383838] border border-transparent rounded-full px-4 py-2 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5 press-spring"
      >
        <span>➕</span> Add Expense
      </button>

      {/* Render modal into Portal */}
      {mounted && typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </>
  )
}
