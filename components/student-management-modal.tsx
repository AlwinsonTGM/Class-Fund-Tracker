'use client'

import React, { useState, useTransition } from 'react'
import { X, UserPlus, Pencil, Loader2 } from 'lucide-react'
import { addStudentAction, updateStudentAction } from '@/app/officer-dashboard/moderator-actions'
import { useToast } from '@/components/ui/toast'

export interface StudentData {
  id: number
  first_name: string
  last_name: string | null
  seat_number: number
  student_id_number?: string
}

interface StudentManagementModalProps {
  mode: 'add' | 'edit'
  student?: StudentData
  triggerBtn?: React.ReactNode
  onSuccess?: () => void
}

export function StudentManagementModal({
  mode,
  student,
  triggerBtn,
  onSuccess
}: StudentManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [firstName, setFirstName] = useState(student?.first_name || '')
  const [lastName, setLastName] = useState(student?.last_name || '')
  const [seatNumber, setSeatNumber] = useState(student?.seat_number ? String(student.seat_number) : '')
  const [studentIdNumber, setStudentIdNumber] = useState(student?.student_id_number || '')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const openModal = () => {
    setFirstName(student?.first_name || '')
    setLastName(student?.last_name || '')
    setSeatNumber(student?.seat_number ? String(student.seat_number) : '')
    setStudentIdNumber(student?.student_id_number || '')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      toast.error('Please enter a first name.', 'Validation Error')
      return
    }

    const numSeat = parseInt(seatNumber, 10)
    if (isNaN(numSeat) || numSeat <= 0) {
      toast.error('Please enter a valid positive seat number.', 'Validation Error')
      return
    }

    startTransition(async () => {
      if (mode === 'add') {
        const res = await addStudentAction(firstName.trim(), lastName.trim() || null, numSeat, studentIdNumber.trim() || undefined)
        if (res.success) {
          toast.success(`Added ${firstName.trim()} to classmate records.`, 'Classmate Added')
          closeModal()
          onSuccess?.()
        } else {
          toast.error(res.error || 'Failed to add classmate.', 'Error')
        }
      } else if (mode === 'edit' && student) {
        const res = await updateStudentAction(student.id, firstName.trim(), lastName.trim() || null, numSeat, studentIdNumber.trim() || undefined)
        if (res.success) {
          toast.success(`Updated classmate details for ${firstName.trim()}.`, 'Classmate Updated')
          closeModal()
          onSuccess?.()
        } else {
          toast.error(res.error || 'Failed to update classmate.', 'Error')
        }
      }
    })
  }

  return (
    <>
      {triggerBtn ? (
        <div onClick={openModal} className="inline-block cursor-pointer">
          {triggerBtn}
        </div>
      ) : (
        <button
          onClick={openModal}
          type="button"
          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 press-spring"
        >
          {mode === 'add' ? (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Add Classmate</span>
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/40">
              <div className="flex items-center gap-2">
                {mode === 'add' ? (
                  <UserPlus className="h-5 w-5 text-primary" />
                ) : (
                  <Pencil className="h-5 w-5 text-primary" />
                )}
                <h2 className="text-base font-bold">
                  {mode === 'add' ? 'Add New Classmate' : 'Edit Classmate Details'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={isPending}
                className="size-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Juan"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dela Cruz"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Seat Number *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Student ID (Optional)</label>
                  <input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="e.g. 2024-00123"
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 press-spring"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{mode === 'add' ? 'Add Classmate' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
