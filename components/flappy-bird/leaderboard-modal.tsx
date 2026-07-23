'use client'

import React, { useState } from 'react'
import { Trophy, X, RefreshCw, Wifi, WifiOff, Award, User, Flame, Sparkles, Trash2, Loader2 } from 'lucide-react'

import { LeaderboardEntry } from '@/app/flappy-bird/actions'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
  entries: LeaderboardEntry[]
  mode: 'online' | 'offline'
  onRefresh: () => void
  userBestScore: number
  playerName: string
  activeModeTab: 'classic' | 'zen'
  onTabChange: (tab: 'classic' | 'zen') => void
  onClearLeaderboard?: () => void
  isLoading?: boolean
}

export function LeaderboardModal({
  isOpen,
  onClose,
  entries,
  mode,
  onRefresh,
  userBestScore,
  playerName,
  activeModeTab,
  onTabChange,
  onClearLeaderboard,
  isLoading = false
}: LeaderboardModalProps) {
  const [isClearing, setIsClearing] = useState(false)

  if (!isOpen) return null

  const handleClear = async () => {
    if (confirm('Are you sure you want to reset/clear all leaderboard scores? This cannot be undone.')) {
      setIsClearing(true)
      if (onClearLeaderboard) {
        await onClearLeaderboard()
      }
      setIsClearing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl max-w-lg w-full h-[600px] max-h-[85vh] overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-5 text-slate-950 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-950/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Trophy className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide uppercase">Flappy Leaderboard</h2>
              <p className="text-xs font-semibold text-slate-900/80">BSIS 201 Section Rankings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-slate-950/15 hover:bg-slate-950/30 flex items-center justify-center transition-colors cursor-pointer text-slate-950"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Classic vs Zen) */}
        <div className="bg-slate-900 p-2.5 border-b border-slate-800 flex items-center justify-center gap-2 shrink-0">
          <button
            onClick={() => onTabChange('classic')}
            disabled={isLoading}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            } ${
              activeModeTab === 'classic'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLoading && activeModeTab === 'classic' ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <Flame className="h-4 w-4 text-amber-400" />
            )}
            <span>Classic Mode</span>
          </button>

          <button
            onClick={() => onTabChange('zen')}
            disabled={isLoading}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            } ${
              activeModeTab === 'zen'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLoading && activeModeTab === 'zen' ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <Sparkles className="h-4 w-4 text-teal-300" />
            )}
            <span>Zen Mode</span>
          </button>
        </div>

        {/* Sync Status Badge Mark */}
        <div className="px-5 py-2.5 bg-muted/60 border-b border-border flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            {mode === 'online' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="h-3 w-3" />
                <span>Online Sync</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-destructive/15 border border-destructive/30 text-destructive font-bold text-[11px]">
                <WifiOff className="h-3 w-3" />
                <span>Offline Fallback</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh rankings"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {onClearLeaderboard && (
              <button
                onClick={handleClear}
                disabled={isClearing || isLoading}
                className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                title="Clear table"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Table</span>
              </button>
            )}
          </div>
        </div>

        {/* User Best Score Box for Selected Mode */}
        <div className="mx-5 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="text-muted-foreground block text-[10px]">Your Handle</span>
              <span className="font-bold text-foreground">{playerName || 'Guest'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px]">
              {activeModeTab === 'zen' ? 'Zen Best' : 'Classic Best'}
            </span>
            <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{userBestScore} PTS</span>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1 flex flex-col">
          {isLoading ? (
            <div className="p-6 my-auto flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="relative flex items-center justify-center">
                <div className={`absolute size-16 rounded-full opacity-30 animate-ping ${
                  activeModeTab === 'zen' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <div className={`relative size-14 rounded-2xl flex items-center justify-center shadow-xl ${
                  activeModeTab === 'zen'
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950'
                    : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
                }`}>
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-foreground tracking-wide">
                  Loading {activeModeTab === 'zen' ? 'Zen Mode' : 'Classic Mode'}...
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Fetching latest rankings & high scores
                </p>
              </div>

              {/* Skeleton placeholder cards */}
              <div className="w-full max-w-md space-y-2 mt-2 opacity-40">
                <div className="h-11 bg-slate-800/80 border border-slate-700/50 rounded-2xl animate-pulse flex items-center px-4 justify-between">
                  <div className="h-3.5 w-24 bg-slate-700/60 rounded" />
                  <div className="h-3.5 w-12 bg-slate-700/60 rounded" />
                </div>
                <div className="h-11 bg-slate-800/80 border border-slate-700/50 rounded-2xl animate-pulse flex items-center px-4 justify-between">
                  <div className="h-3.5 w-28 bg-slate-700/60 rounded" />
                  <div className="h-3.5 w-10 bg-slate-700/60 rounded" />
                </div>
                <div className="h-11 bg-slate-800/80 border border-slate-700/50 rounded-2xl animate-pulse flex items-center px-4 justify-between">
                  <div className="h-3.5 w-20 bg-slate-700/60 rounded" />
                  <div className="h-3.5 w-14 bg-slate-700/60 rounded" />
                </div>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center my-auto py-10 text-muted-foreground text-xs space-y-2">
              <Award className="h-8 w-8 mx-auto opacity-40" />
              <p>No high scores recorded yet for {activeModeTab === 'zen' ? 'Zen Mode' : 'Classic Mode'}.</p>
              <p className="text-[10px]">Be the first to set a record!</p>
            </div>

          ) : (
            entries.map((entry, index) => {
              let rankBadge = `#${index + 1}`
              let badgeColor = 'bg-muted text-muted-foreground'
              if (index === 0) { rankBadge = '1ST'; badgeColor = 'bg-amber-500 text-slate-950 font-black' }
              else if (index === 1) { rankBadge = '2ND'; badgeColor = 'bg-slate-300 text-slate-950 font-black' }
              else if (index === 2) { rankBadge = '3RD'; badgeColor = 'bg-amber-700 text-amber-100 font-black' }

              const isUserEntry = entry.player_name.toLowerCase() === playerName.toLowerCase()

              return (
                <div
                  key={index}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isUserEntry
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-sm font-semibold'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg text-center font-bold shrink-0 ${badgeColor}`}>
                      {rankBadge}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{entry.player_name}</span>
                        {entry.is_guest ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">Guest</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">Verified</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-black text-amber-600 dark:text-amber-400 text-sm">
                    {entry.score} <span className="text-[10px] text-muted-foreground font-normal">pts</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer close button */}
        <div className="p-4 bg-muted/40 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


