'use client'

import React, { useState, useEffect } from 'react'
import { Upload, X, Check, AlertCircle, Image as ImageIcon, CreditCard, DollarSign, Calendar, User } from 'lucide-react'
import { submitPaymentReceiptAction } from '@/app/officer-dashboard/actions'

export interface StudentOption {
  id: number
  first_name: string
  last_name: string | null
  seat_number: number
}

export interface WeekOption {
  id: number
  week_number: number
  date_range: string
  status: string
}

export interface PaymentOption {
  id: number
  student_id: number
  week_number: number
  status: string
}

interface SubmitReceiptModalProps {
  students: StudentOption[]
  weeks: WeekOption[]
  payments?: PaymentOption[]
  trigger?: React.ReactNode
}

function formatStudentDisplayName(firstName: string, lastName: string | null) {
  const lastInitial = lastName ? `${lastName.trim()[0]}.` : ''
  return `${firstName.trim()} ${lastInitial}`.trim()
}

export function SubmitReceiptModal({
  students = [],
  weeks = [],
  payments = [],
  trigger
}: SubmitReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya'>('GCash')
  const [amount, setAmount] = useState<number>(5)
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [note, setNote] = useState<string>('')

  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Auto select default student and week
  useEffect(() => {
    if (students.length > 0 && selectedStudentId === '') {
      setSelectedStudentId(students[0].id)
    }
  }, [students, selectedStudentId])

  useEffect(() => {
    const activeWeeks = weeks.filter(w => w.status === 'active')
    if (activeWeeks.length > 0) {
      setSelectedWeek(activeWeeks[0].week_number)
    } else if (weeks.length > 0) {
      setSelectedWeek(weeks[0].week_number)
    }
  }, [weeks])

  // Handle local image file selection with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.webp']

    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(ext)) {
      setErrorMsg(`Invalid file extension "${ext}". Allowed: .jpg, .jpeg, .png, .pdf, .webp`)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum limit of 5MB.')
      return
    }

    setFile(selectedFile)

    // Generate local preview URL
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleReset = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setReferenceNumber('')
    setNote('')
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!selectedStudentId) {
      setErrorMsg('Please select your name.')
      return
    }

    if (amount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.')
      return
    }

    const studentObj = students.find(s => s.id === Number(selectedStudentId))
    const studentName = studentObj
      ? `${studentObj.first_name} ${studentObj.last_name || ''}`.trim()
      : `Student ${selectedStudentId}`

    let receiptUrl = '/placeholder-receipt.png'
    let fileName = 'receipt.png'
    let fileSize = 1024
    let mimeType = 'image/png'

    if (file) {
      fileName = file.name
      fileSize = file.size
      mimeType = file.type || 'image/png'

      // Convert image file to data URL for client storage preview or use previewUrl
      if (previewUrl) {
        receiptUrl = previewUrl
      } else {
        receiptUrl = `/storage/receipts/week_${selectedWeek}_student_${selectedStudentId}_${Date.now()}_${file.name}`
      }
    }

    setSubmitting(true)

    try {
      const result = await submitPaymentReceiptAction({
        student_id: Number(selectedStudentId),
        student_name: studentName,
        week_number: Number(selectedWeek),
        amount: Number(amount),
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
        reference_number: referenceNumber.trim(),
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        note: note.trim()
      })

      if (result.success) {
        setSuccessMsg('Payment receipt submitted successfully! Pending officer approval.')
        setTimeout(() => {
          handleReset()
          setIsOpen(false)
        }, 1500)
      } else {
        setErrorMsg(result.error || 'Failed to submit receipt.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMsg(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 min-h-[44px] text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer press-spring"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Receipt</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-slide-in">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Submit Proof of Payment</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload your GCash or Maya payment screenshot for officer review
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleReset()
                  setIsOpen(false)
                }}
                className="rounded-full size-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notification messages */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs font-medium text-primary flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Receipt Submission Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Student Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Select Student</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select Your Name --</option>
                  {students.map((student) => {
                    const isPaidForWeek = payments.some(
                      p => p.student_id === student.id && p.week_number === selectedWeek && p.status === 'paid'
                    )
                    return (
                      <option key={student.id} value={student.id}>
                        #{student.seat_number} - {formatStudentDisplayName(student.first_name, student.last_name)} {isPaidForWeek ? '(Paid)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Week & Amount row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Target Week</span>
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {weeks.map((w) => (
                      <option key={w.id} value={w.week_number}>
                        Week {w.week_number} ({w.date_range})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <span>Amount (₱)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GCash')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 min-h-[44px] text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'GCash'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span>GCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Maya')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 min-h-[44px] text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'Maya'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Maya</span>
                  </button>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Reference / Transaction Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100293847561"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* File Upload Box & Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Proof Screenshot (.png, .jpg, .pdf)
                </label>

                {previewUrl ? (
                  <div className="relative rounded-xl border border-border bg-muted/40 p-3 flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="max-h-48 rounded-lg object-contain border border-border"
                    />
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground px-1">
                      <span className="truncate max-w-[200px]">{file?.name}</span>
                      <span>{file ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        if (previewUrl) URL.revokeObjectURL(previewUrl)
                        setPreviewUrl(null)
                      }}
                      className="absolute top-2 right-2 size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/70 p-1 text-white hover:bg-black transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <span className="text-xs font-medium text-foreground">
                      Click to upload receipt screenshot
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-1">
                      Supports JPG, PNG, WEBP, PDF (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Optional Note / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional notes for officer..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleReset()
                    setIsOpen(false)
                  }}
                  className="rounded-xl border border-border px-4 py-2.5 min-h-[44px] flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 min-h-[44px] text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 press-spring"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Submit Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
