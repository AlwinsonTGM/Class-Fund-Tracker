'use client'

import React, { useState, useEffect } from 'react'
import { User, LogIn, Check, Edit2, ShieldAlert, Gamepad2 } from 'lucide-react'

interface UsernameModalProps {
  user: any
  currentName: string
  onSaveName: (name: string) => void
  onClose: () => void
  isOpen: boolean
}

export function UsernameModal({
  user,
  currentName,
  onSaveName,
  onClose,
  isOpen
}: UsernameModalProps) {
  const [nameInput, setNameInput] = useState(currentName)

  useEffect(() => {
    setNameInput(currentName)
  }, [currentName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = nameInput.trim() || (user ? user.email.split('@')[0] : 'Guest')
    onSaveName(trimmed)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        {/* Top Header Decorative Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 -mx-6 -mt-6 p-6 mb-6 text-white text-center shadow-inner">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl shadow-lg border border-white/30">
            <Gamepad2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Player Profile</h2>
          <p className="text-xs font-medium text-amber-100 mt-1">
            Customize your arcade player handle for the Leaderboard
          </p>
        </div>

        {/* Auth Status Banner */}
        {user ? (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">Logged In Account</span>
              <span className="text-muted-foreground truncate block max-w-[220px]">{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Playing as Guest</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We recommend logging in to sync your high scores to the central section database! You can also play right now with a guest handle.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-1 self-start"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Log in to sync global scores →</span>
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span>Display Handle:</span>
              <span className="text-[10px] text-muted-foreground">Visible on Leaderboard</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter player name..."
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                required
              />
              <Edit2 className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none opacity-60" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer press-spring"
            >
              <Check className="h-4 w-4" />
              <span>Save & Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
