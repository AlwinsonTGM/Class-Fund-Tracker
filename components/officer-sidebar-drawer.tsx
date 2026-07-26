'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, DollarSign, Gamepad2, Info, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { PatchNotesModal } from '@/components/patch-notes-modal'
import { FinancialAuditReportModal } from '@/components/financial-audit-report-modal'
import { signOutAction } from '@/app/login/actions'
import type { User } from '@supabase/supabase-js'
import type { ContainerStudent, ContainerPayment, ContainerWeek, ContainerExpense } from './officer-tabs-container'
import type { ReceiptItem } from '@/components/officer-receipt-approval-queue'

interface OfficerSidebarDrawerProps {
  user: User
  students: ContainerStudent[]
  payments: ContainerPayment[]
  weeks: ContainerWeek[]
  expenses: ContainerExpense[]
  receipts?: ReceiptItem[]
  onRecordExpenseClick: () => void
}

export function OfficerSidebarDrawer({
  user,
  students,
  payments,
  weeks,
  expenses,
  receipts = [],
  onRecordExpenseClick
}: OfficerSidebarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
      />

      {/* Slide-Over Drawer Panel */}
      <div className="relative z-10 w-80 max-w-[85vw] bg-card text-card-foreground border-l border-border shadow-2xl flex flex-col h-full overflow-y-auto animate-slide-in-right p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Officer Controls</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Officer Profile Card */}
        <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.email}</p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Authorized Officer
              </span>
            </div>
          </div>
        </div>

        {/* Action Items Navigation List */}
        <div className="flex flex-col gap-3 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">Quick Tools</p>
          
          {/* Financial Audit Report Modal */}
          <div onClick={() => setIsOpen(false)}>
            <FinancialAuditReportModal
              students={students}
              payments={payments}
              weeks={weeks}
              expenses={expenses}
              receipts={receipts}
              fullWidth
            />
          </div>

          {/* Record Expense Action */}
          <button
            onClick={() => {
              setIsOpen(false)
              onRecordExpenseClick()
            }}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/25 rounded-xl cursor-pointer flex items-center justify-start gap-2.5 transition-colors press-spring"
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>Record Class Expense</span>
          </button>

          {/* Arcade Easter Egg */}
          <a
            href="/flappy-bird"
            onClick={() => setIsOpen(false)}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-foreground bg-muted/60 hover:bg-muted border border-border/60 rounded-xl cursor-pointer flex items-center justify-start gap-2.5 transition-colors press-spring"
          >
            <Gamepad2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Play Arcade Game</span>
          </a>

          {/* Theme Settings Row */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 mt-2">
            <span className="text-xs font-semibold text-foreground">Theme Preference</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Sign Out Action at Bottom */}
        <div className="pt-6 border-t border-border mt-auto">
          <form
            action={signOutAction}
            onSubmit={() => setSigningOut(true)}
          >
            <button
              type="submit"
              disabled={signingOut}
              className="w-full min-h-[44px] px-4 py-2.5 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors press-spring"
            >
              {signingOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{signingOut ? 'Signing out...' : 'Sign Out of Portal'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Officer Menu"
        aria-label="Open Officer Sidebar Menu"
        className="size-8 xs:size-9 rounded-full bg-muted/80 hover:bg-muted border border-border/60 text-foreground flex items-center justify-center cursor-pointer transition-colors press-spring shrink-0"
      >
        <Menu className="h-4 w-4" />
      </button>

      {mounted && isOpen && typeof window !== 'undefined'
        ? createPortal(drawerContent, document.body)
        : null}
    </>
  )
}
