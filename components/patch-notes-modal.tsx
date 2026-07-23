'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardList, X, Check } from 'lucide-react'

// ─── Patch Note Data ─────────────────────────────────────────────────────────
const CURRENT_VERSION = '1.6-beta'
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
    version: '1.6',
    date: 'July 23, 2026',
    title: '☁️ Cloud Sync & Fluid Glass Navigation',
    emoji: '🔄',
    changes: [
      { type: 'new', text: 'Interactive Toast Notifications — added sliding popup notifications on the side of the screen to alert you instantly when changes happen.' },
      { type: 'new', text: 'Transaction Sound Effects — integrated audio feedback for transactions and user activities to make interactions more engaging.' },
      { type: 'improve', text: 'Freedom Wall Optimization — limited floating notes to the 10 latest entries to enhance performance on low-end and mobile devices.' },
      { type: 'improve', text: 'Symmetrical Liquid Glass Navigation — refined mobile bottom navigation capsule into a perfectly rounded glass bubble with top specular highlights.' },
      { type: 'improve', text: 'Static Idle Posture — removed continuous asymmetrical morphing keyframes for a clean, stable idle state.' },
      { type: 'fix', text: 'Zero-Lag Tab Sliding — eliminated state-delay hitches for instant, responsive GPU hardware-accelerated tab transitions.' },
      { type: 'fix', text: 'Officer Authentication Route Protection — forced authenticated officers to load the Officer Dashboard directly rather than landing on the normal dashboard.' },
      { type: 'fix', text: 'Task Creation Redirects — fixed a routing issue where adding a task occasionally redirected to a "Page Not Found" screen.' },
      { type: 'new', text: 'Database-Backed Class Documents — class files are now stored in Supabase instead of local storage, making them visible to all users across all devices.' },
      { type: 'new', text: 'Cloud Song Attachments — song previews attached to Freedom Wall posts are now saved to the database (song_data column), ensuring everyone hears the same tracks.' },
      { type: 'fix', text: 'Cross-Device Synchronization — eliminated the "local-only" bug where documents and songs added on your phone were invisible to other users.' },
      { type: 'improve', text: 'Server Actions Integration — updated addPostAction and addClassDocumentAction to store data centrally in Supabase for secure, real-time collaboration.' },
      { type: 'improve', text: 'Schema Updates — added song_data JSONB column to freedom_posts table and restructured class_documents with proper RLS policies.' },
    ],
  },
  {
    version: '1.5',
    date: 'July 18, 2026',
    title: 'Customizable Study Hub & Easter Eggs',
    emoji: '🌧️',
    changes: [
      { type: 'new', text: 'Custom Class Files (Officers Only) — officers can now add PDF links or write Markdown files directly within the UI, stored securely in local storage.' },
      { type: 'new', text: 'Draggable Reviewer Panels — desktop users can now click and drag the splitter bar to dynamically resize the Approved Materials list width.' },
      { type: 'new', text: 'Dogie Falling Easter Egg — secret interaction unlocked by tapping the settings gear 10 times, causing animated gifs to fall slowly behind everything.' },
      { type: 'new', text: 'Direct Blob Downloads — custom-written Markdown guides can be downloaded on-the-fly as structured .md files in the browser.' },
      { type: 'improve', text: 'Standardized 5-Button Bottom Nav — replaced mobile float quick menu with standard aligned tabs matching the active indicator slide.' },
      { type: 'improve', text: 'Expanded Document Viewport — increased preview frame size heights to 680px for documents and 500px for reviewers, optimizing readability.' },
      { type: 'improve', text: 'Clean Settings Response — settings dropdown click-outside checks now ignore clicks targeting the trigger gear, resolving instant close bugs.' },
      { type: 'improve', text: 'Physics Repulsion — added repulsion forces in the Freedom Wall note physics to prevent notes from stacking directly on top of each other.' },
      { type: 'improve', text: 'Canvas Weather ResizeObserver — replaced window resize listeners with element-bound ResizeObservers for distortion-free mobile displays.' },
      { type: 'fix', text: 'Redundant Code & File Cleanup — merged Next configurations, deleted boilerplate SVGs, unused placeholder assets, and pnpm lock files.' }
    ],
  },
  {
    version: '1.4',
    date: 'July 17, 2026',
    title: 'Public KLD Sign-Up & Spam-Free Wall',
    emoji: '🔐',
    changes: [
      { type: 'new', text: 'School-Restricted Public Sign-Up — any student can now create an account using their school email domain (@kld.edu.ph).' },
      { type: 'new', text: 'Forgot Password / Reset Link — request a password reset email in the login panel, redirecting securely to a dedicated update password form.' },
      { type: 'new', text: 'Dedicated Reset Password Form Page — custom secure route (/auth/reset-password) to enter and confirm new credentials.' },
      { type: 'new', text: 'SignUp & Password Recovery Actions — backend server actions validating domains and requesting resets through Supabase Auth.' },
      { type: 'new', text: 'Secure Officer Dashboard Block — added real-time database queries to verify if logged-in accounts exist in officers/moderators tables, redirecting general users to the homepage immediately.' },
      { type: 'improve', text: 'Spam-Free Emoji Reactions — clicking an emoji reaction toggles it (adds 1 or removes 1) instead of allowing infinite spam.' },
      { type: 'improve', text: 'Authenticated Wall Reactions — emoji reactions now require logging in first to identify users and count reactions uniquely.' },
      { type: 'improve', text: 'Highlighted Emoji Selection — reaction chips actively highlight with a custom border and theme color matching if the user has selected it.' },
      { type: 'improve', text: 'Multi-View Inline Login Portal — login form updated with clean tab switching for Sign In, Sign Up, and Forgot Password views.' }
    ],
  },
  {
    version: '1.3',
    date: 'July 17, 2026',
    title: 'Personal Tasks & UX Polish',
    emoji: '🔒',
    changes: [
      { type: 'new', text: 'Personal (Private) Tasks — any logged-in student can now create tasks visible only to their own account. Public viewers cannot see them.' },
      { type: 'new', text: 'Task Visibility Toggle — officers can choose Public (visible to all) or Private (Only Me) during task creation. Standard students are locked to Private.' },
      { type: 'new', text: 'Lock badge on private task cards — personal tasks display a 🔒 Personal chip next to the type badge in the feed.' },
      { type: 'new', text: 'Custom Task Deletion Confirmation — deleted tasks now trigger a styled warning card modal with a smooth scale animation instead of the default browser alert.' },
      { type: 'new', text: 'Custom Recent Activity Deletion Confirmation — same polished warning modal added to the audit log deletion flow.' },
      { type: 'new', text: 'Task Background Image Customization — pick from 6 preselected covers or upload your own custom photo (max 1 MB) that fills the entire task card.' },
      { type: 'new', text: 'Task Edit / Modify Button — officers and task creators can now edit any task by clicking an Edit icon on the card. The creation form reopens pre-filled and converts its submit button to "Save Changes".' },
      { type: 'improve', text: 'Rolling linear progress bar at the top of the tasks panel animates during all database operations so you know work is happening.' },
      { type: 'improve', text: '"Updating..." card overlay — task cards show a spinning indicator backdrop when a toggle or edit is in-flight.' },
      { type: 'improve', text: '"Deleting..." card overlay — the target card dims and shows a spinner while a delete is pending, removing the awkward disappear delay.' },
      { type: 'improve', text: '"Signing out..." feedback — both public and officer sign-out buttons now instantly replace their label with a spinner + "Signing out..." text on click.' },
      { type: 'improve', text: 'Card replica live preview in task form — the card preview in the right column now reflects Private/Personal badge changes in real time.' },
      { type: 'improve', text: 'Private task ownership checks — edit, toggle, and delete server actions verify the logged-in user email matches created_by before proceeding.' },
      { type: 'improve', text: 'Sign-out button is disabled immediately after clicking to prevent double submission.' },
      { type: 'improve', text: 'data-scroll-behavior attribute added to <html> to silence Next.js route-transition scroll warning.' },
      { type: 'fix', text: 'Eliminated all React key prop console warnings by moving sign-out and login form elements natively inside their tab containers.' },
      { type: 'fix', text: 'Check icon (lucide) was not imported, causing a ReferenceError when selecting a background photo — now properly imported.' },
    ],
  },
  {
    version: '1.2',
    date: 'July 17, 2026',
    title: 'Freedom Wall Upgrades',
    emoji: '🎵',
    changes: [
      { type: 'new', text: 'Discord-style emoji reactions — tap any existing reaction to increment its count, or use the + button to open the emoji palette picker.' },
      { type: 'new', text: 'Emoji palette picker — 24 curated emojis available per note with a smooth slide-in dropdown.' },
      { type: 'new', text: 'Song attachment — before posting, search iTunes for any track and attach a 30-second preview clip to your note.' },
      { type: 'new', text: 'Inline mini music player — notes with songs show album artwork, track title, artist, a tappable progress bar, and a play/pause button.' },
      { type: 'new', text: 'Global audio singleton — only one song can play at a time. Starting a new track auto-pauses the previous one.' },
      { type: 'fix', text: 'Song artwork and the music player no longer disappear after re-render due to optimistic UI overwriting server data.' },
      { type: 'improve', text: 'Reactions and song data persist in localStorage between page refreshes for a seamless experience.' },
      { type: 'improve', text: 'Freedom Wall posts display timestamps formatted as relative time (e.g. "2 hours ago").' },
    ],
  },
  {
    version: '1.1',
    date: 'July 17, 2026',
    title: 'Unified Task System',
    emoji: '🎯',
    changes: [
      { type: 'new', text: 'Unified Multi-Dimensional Task Board — create tasks with course links, due dates, task types, participation modes, group sizes, and priorities.' },
      { type: 'new', text: 'Live due-date countdown badges — cards show "2d 4h left", "3h 20m left", or "Overdue" in real time.' },
      { type: 'new', text: 'Priority glow borders — Urgent (rose), High (amber), Medium (emerald), Low (muted) left-edge borders on every card.' },
      { type: 'new', text: 'Filter Dock — filter tasks by course code, task type, priority level, and participation type. Multiple filters stack simultaneously.' },
      { type: 'new', text: 'Active filter chips — active filters appear as removable tag pills above the grid. A Clear All button resets everything.' },
      { type: 'new', text: 'Search bar — fuzzy match tasks by title in real time.' },
      { type: 'new', text: 'Completed tasks toggle — a "Show Completed" switch separates done from pending tasks.' },
      { type: 'new', text: 'Course badge tooltip — hovering a course badge shows the full course name.' },
      { type: 'new', text: 'Patch notes popup — this window, with per-version localStorage tracking so it only auto-opens once per version.' },
      { type: 'improve', text: 'Inline Login — logging in no longer navigates to a separate page. The login form slides inline within the public dashboard.' },
      { type: 'improve', text: 'Officer Dashboard Home tab renders inline — no more full-page navigation to switch between dashboard sections.' },
      { type: 'improve', text: 'Bottom nav bar is fixed to the visible screen with a liquid glass blur backdrop.' },
      { type: 'improve', text: 'Nav tab icons no longer shift layout when selected — active state uses a thin underline dot instead of resizing the icon.' },
      { type: 'improve', text: 'Desktop widescreen layout — the dashboard now uses dual-column layouts on large screens (stats left, checklist right) for a less stretched appearance.' },
      { type: 'improve', text: 'All raw OS emojis replaced with Lucide vector icons across nav bars, payment lists, activity logs, task cards, and modal buttons.' },
      { type: 'fix', text: 'Supabase schema cache relation error (tasks → courses) no longer crashes the tasks section — fetched and joined in memory instead.' },
      { type: 'fix', text: 'Local Fallback Mode now only activates when a real DB error is detected, not when the tasks table is simply empty.' },
    ],
  },
  {
    version: '1.0',
    date: 'July 16, 2026',
    title: 'Initial Launch',
    emoji: '🚀',
    changes: [
      { type: 'new', text: 'Student payment tracker — weekly contribution checklist with public and officer views.' },
      { type: 'new', text: 'Officer Dashboard — protected portal for toggling payments, recording expenses, and managing calendar weeks.' },
      { type: 'new', text: 'Real-time balance card — Net Balance = (Paid students × ₱5) − Total Expenses, computed live.' },
      { type: 'new', text: 'Freedom Wall — anonymous sticky-note style posts with customizable pastel backgrounds.' },
      { type: 'new', text: 'Dark / Light mode toggle — flash-free, persisted in localStorage with head-script hydration.' },
      { type: 'new', text: 'Audit log — all officer actions (payment toggles, expense records, week edits) are stamped with email and timestamp.' },
      { type: 'new', text: 'Google OAuth — sign in with your school Google account through Supabase Auth.' },
      { type: 'new', text: 'Privacy-safe names — public view shows "First Name + Last Initial" while the officer panel shows the full roster name.' },
      { type: 'new', text: 'Calendar week management — officers can add, edit, or delete weekly date ranges and mark weeks as suspended.' },
      { type: 'new', text: 'Moderator role — accounts in the moderators table can edit log descriptions and delete entries (reversing the linked DB transaction).' },
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
            <p className="text-xs text-muted-foreground">Latest changes & improvements to BSIS 201 Section Hub</p>
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
          <p className="text-[10px] text-muted-foreground">BSIS 201 Section Hub · v{CURRENT_VERSION}</p>
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
