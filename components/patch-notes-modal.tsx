'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardList, X, Check } from 'lucide-react'

// ─── Patch Note Data ─────────────────────────────────────────────────────────
// To add a new patch, increment CURRENT_VERSION and add a new entry at the top.
const CURRENT_VERSION = '1.3'
const STORAGE_KEY = `cft_patch_seen_v${CURRENT_VERSION}`

interface PatchEntry {
  version: string
  date: string
  title: string
  emoji: string
  changes: { type: 'new' | 'fix' | 'improve'; text: string }[]
}

const PATCH_NOTES: PatchEntry[] = [
  {
    version: '1.3',
    date: 'July 17, 2026',
    title: 'Personal Tasks & UX Polish',
    emoji: '🔒',
    changes: [
      { type: 'new', text: 'Personal (Private) Tasks — normal students can now register private tasks that are only visible to their account.' },
      { type: 'new', text: 'Task Visibility Toggle — whitelisted officers can choose between Public and Private task visibility during creation.' },
      { type: 'new', text: 'Sleek custom deletion warning card modals for both tasks and recent activities, replacing raw browser alerts.' },
      { type: 'improve', text: 'Instant visual feedback overlays ("Updating...", "Deleting...") with loading spinners on active task cards.' },
      { type: 'improve', text: 'Linear rolling loading progress indicator at the top of the tasks panel during database transactions.' },
      { type: 'improve', text: 'Spinner and immediate "Signing out..." feedback inside sign-out triggers to remove transition delay.' },
      { type: 'fix', text: 'Completely eliminated remaining React key prop console warnings by natively rendering layout header actions.' },
    ],
  },
  {
    version: '1.2',
    date: 'July 17, 2026',
    title: 'Freedom Wall Upgrades',
    emoji: '🎵',
    changes: [
      { type: 'new', text: 'Discord-style emoji reactions on every sticky note — tap to add, tap again to increment.' },
      { type: 'new', text: 'Emoji picker with 24 curated emojis via the + button on each post.' },
      { type: 'new', text: 'Optional song attachment — search any song and attach a 30-second iTunes preview to your note.' },
      { type: 'new', text: 'Inline mini music player on notes with album art, progress bar, and play/pause control.' },
      { type: 'fix', text: 'Song artwork and player no longer disappear after posting due to server re-sync.' },
      { type: 'improve', text: 'Songs and reactions persist across page refreshes via localStorage.' },
    ],
  },
  {
    version: '1.1',
    date: 'July 17, 2026',
    title: 'Unified Task System',
    emoji: '🎯',
    changes: [
      { type: 'new', text: 'Unified Multi-Dimensional Task Board with course tags, priorities, and due date countdowns.' },
      { type: 'new', text: 'Full search & filter dock — filter by course code, task type, priority, and participation type.' },
      { type: 'new', text: 'Removable active filter tags with a Clear All button.' },
      { type: 'new', text: 'Task cards now show priority glowing borders (Urgent, High, Medium, Low).' },
      { type: 'new', text: 'Course name tooltip on badge hover and live countdown timers.' },
      { type: 'new', text: 'Patch notes popup (this window) with per-version tracking.' },
      { type: 'improve', text: 'Inline Login — logging in no longer redirects to a separate page.' },
      { type: 'improve', text: 'Home tab inside Officer Dashboard is now rendered inline, removing page transition delays.' },
      { type: 'improve', text: 'Bottom nav bar is now fixed to the visible screen with liquid glass effect.' },
      { type: 'improve', text: 'Tab icons no longer shift awkwardly when selecting a nav item.' },
      { type: 'fix', text: 'Supabase schema cache relation error no longer crashes the tasks section.' },
      { type: 'fix', text: 'Local Fallback Mode now only activates on actual database errors, not empty tables.' },
    ],
  },
  {
    version: '1.0',
    date: 'July 16, 2026',
    title: 'Initial Launch',
    emoji: '🚀',
    changes: [
      { type: 'new', text: 'Class Fund Tracker launched with student payment tracking.' },
      { type: 'new', text: 'Officer Dashboard for managing contributions and expenses.' },
      { type: 'new', text: 'Freedom Wall for anonymous class posts.' },
      { type: 'new', text: 'Dark/Light mode theme toggle.' },
      { type: 'new', text: 'Audit log of all officer activity.' },
      { type: 'new', text: 'Real-time balance card showing net class funds.' },
    ],
  },
]

const TYPE_STYLES = {
  new: { label: 'NEW', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  fix: { label: 'FIX', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  improve: { label: 'IMPROVED', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface PatchNotesModalProps {
  /** If true, always shows the modal (triggered by the manual button) */
  forceOpen?: boolean
  onClose?: () => void
}

export function PatchNotesModal({ forceOpen = false, onClose }: PatchNotesModalProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Auto-show if user hasn't seen this version yet
  useEffect(() => {
    if (!mounted) return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setVisible(true)
    }
  }, [mounted])

  // Respond to force-open (from the button)
  useEffect(() => {
    if (forceOpen) {
      setVisible(true)
    }
  }, [forceOpen])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
    onClose?.()
  }

  if (!mounted || !visible) return null

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60 shrink-0 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex flex-col gap-1 pr-4 text-left">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Patch Notes</h2>
            </div>
            <p className="text-xs text-muted-foreground">Latest changes & improvements to Class Fund Tracker</p>
          </div>

          {/* Latest version badge (with pr-8 padding to prevent overlap with the close button) */}
          <div className="flex flex-col items-end gap-1 shrink-0 pr-8">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
              v{CURRENT_VERSION} Latest
            </span>
            <button
              onClick={handleClose}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
            >
              Don't show again
            </button>
          </div>

          {/* Close X */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 size-7 flex items-center justify-center rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer press-spring"
            aria-label="Close patch notes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {PATCH_NOTES.map((patch, patchIdx) => (
            <div key={patch.version} className="flex flex-col gap-3">
              {/* Version header */}
              <div className="flex items-center gap-3">
                <span className="text-xl">{patch.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      patchIdx === 0
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      v{patch.version}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{patch.title}</h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">{patch.date}</span>
                  </div>
                </div>
              </div>

              {/* Change list */}
              <ul className="flex flex-col gap-1.5 pl-9">
                {patch.changes.map((change, i) => {
                  const style = TYPE_STYLES[change.type]
                  return (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                      <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[9px] font-bold border rounded uppercase ${style.class}`}>
                        {style.label}
                      </span>
                      <span>{change.text}</span>
                    </li>
                  )
                })}
              </ul>

              {/* Divider between patches */}
              {patchIdx < PATCH_NOTES.length - 1 && (
                <div className="border-t border-border/40 mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border/60 flex items-center justify-between bg-muted/30">
          <p className="text-[10px] text-muted-foreground">Class Fund Tracker · v{CURRENT_VERSION}</p>
          <button
            onClick={handleClose}
            className="px-5 py-1.5 text-xs font-semibold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity cursor-pointer press-spring flex items-center gap-1"
          >
            <span>Got it!</span>
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ─── Trigger Button (exported separately to place next to theme toggle) ───────
interface PatchNotesButtonProps {
  className?: string
}

export function PatchNotesButton({ className }: PatchNotesButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        id="patch-notes-button"
        onClick={() => setOpen(true)}
        title="View patch notes"
        className={`size-9 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer press-spring ${className ?? ''}`}
        aria-label="Open patch notes"
      >
        <ClipboardList className="h-4 w-4" />
      </button>
      {open && <PatchNotesModal forceOpen={true} onClose={() => setOpen(false)} />}
    </>
  )
}
