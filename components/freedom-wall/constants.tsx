import React from 'react'
import { SongPreview } from './types'

export const EMOJI_PALETTE = [
  '👍','❤️','😂','😮','😢','🔥','🎉','💯',
  '👏','🥹','💀','🤯','😍','🙏','⭐','✨',
  '😭','🫡','💪','👀','🫶','🤣','😤','🥳',
]

export const DEFAULT_REACTION = '👍'

export const REACTIONS_STORAGE_KEY = 'cft_post_reactions_v1'
export const SONG_MAP_KEY = 'cft_post_songs_v1'
export const PENDING_SONG_KEY = 'cft_pending_song_v1'
export const USER_REACTIONS_STORAGE_KEY = 'cft_user_reactions_v2'

export function loadSongMap(): Record<number, SongPreview> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SONG_MAP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveSongMap(map: Record<number, SongPreview>) {
  localStorage.setItem(SONG_MAP_KEY, JSON.stringify(map))
}

export function loadAllReactions(): Record<number, Record<string, number>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveAllReactions(reactions: Record<number, Record<string, number>>) {
  localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions))
}

export function loadUserReactions(email: string): Record<number, Record<string, boolean>> {
  if (typeof window === 'undefined' || !email) return {}
  try {
    const raw = localStorage.getItem(USER_REACTIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveUserReactions(email: string, reactions: Record<number, Record<string, boolean>>) {
  localStorage.setItem(USER_REACTIONS_STORAGE_KEY, JSON.stringify(reactions))
}

export const COLOR_MAP: Record<string, { bg: string; border: string; text: string; name: string; chipBg: string }> = {
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-950/45',
    border: 'border-amber-200 dark:border-amber-900/50',
    text: 'text-amber-900 dark:text-amber-200',
    name: 'Yellow',
    chipBg: 'bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-300/60 dark:hover:bg-amber-800/50'
  },
  pink: {
    bg: 'bg-rose-100 dark:bg-rose-950/45',
    border: 'border-rose-200 dark:border-rose-900/50',
    text: 'text-rose-900 dark:text-rose-200',
    name: 'Pink',
    chipBg: 'bg-rose-200/60 dark:bg-rose-900/40 hover:bg-rose-300/60 dark:hover:bg-rose-800/50'
  },
  blue: {
    bg: 'bg-sky-100 dark:bg-sky-950/45',
    border: 'border-sky-200 dark:border-sky-900/50',
    text: 'text-sky-900 dark:text-sky-200',
    name: 'Blue',
    chipBg: 'bg-sky-200/60 dark:bg-sky-900/40 hover:bg-sky-300/60 dark:hover:bg-sky-800/50'
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/45',
    border: 'border-emerald-200 dark:border-emerald-900/50',
    text: 'text-emerald-900 dark:text-emerald-200',
    name: 'Green',
    chipBg: 'bg-emerald-200/60 dark:bg-emerald-900/40 hover:bg-emerald-300/60 dark:hover:bg-emerald-800/50'
  },
  purple: {
    bg: 'bg-violet-100 dark:bg-violet-950/45',
    border: 'border-violet-200 dark:border-violet-900/50',
    text: 'text-violet-900 dark:text-violet-200',
    name: 'Purple',
    chipBg: 'bg-violet-200/60 dark:bg-violet-900/40 hover:bg-violet-300/60 dark:hover:bg-violet-800/50'
  },
}

export const BACKGROUND_GIFS: Record<string, string> = {
  live1: '/live/livephoto.gif',
  live2: '/live/livephoto2.gif',
  live3: '/live/livephoto3.gif',
  live4: '/live/livephoto4.gif',
  live5: '/live/livephoto5.gif',
}

export function getPostTheme(color: string) {
  switch (color) {
    case 'green':
      return {
        cardClass: 'relative rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50 to-emerald-100/90 dark:from-emerald-950/50 dark:to-emerald-900/30 text-emerald-900 dark:text-emerald-100 shadow-md select-none overflow-hidden h-full flex flex-col',
        bgDecor: (
          <>
            <svg className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-emerald-600/10 dark:text-emerald-400/10 fill-none stroke-current stroke-[1.5] select-none pointer-events-none" viewBox="0 0 100 100">
              <path d="M 10 90 C 30 70, 50 30, 90 10" />
              <path d="M 30 70 Q 55 60, 65 45" />
              <path d="M 50 50 Q 75 45, 80 30" />
              <path d="M 40 60 Q 25 45, 20 35" />
              <path d="M 58 42 Q 45 28, 40 18" />
            </svg>
            <div className="absolute top-2 right-2 text-xs opacity-60">🍃</div>
          </>
        ),
        badge: '🍃 Leaf Note',
      }
    case 'blue':
      return {
        cardClass: 'relative rounded-xl bg-[repeating-linear-gradient(-45deg,#3b82f6,#3b82f6_6px,#fff_6px,#fff_12px,#ef4444_12px,#ef4444_18px,#fff_18px,#fff_24px)] dark:bg-[repeating-linear-gradient(-45deg,#1d4ed8,#1d4ed8_6px,#1e293b_6px,#1e293b_12px,#be123c_12px,#be123c_18px,#1e293b_18px,#1e293b_24px)] p-1 sm:p-1.5 shadow-md select-none h-full flex flex-col',
        innerClass: 'bg-sky-50 dark:bg-slate-900 text-sky-950 dark:text-sky-100 rounded-lg p-3 h-full flex flex-col relative overflow-hidden',
        bgDecor: (
          <>
            <svg className="absolute top-0 inset-x-0 w-full h-4 stroke-sky-200/60 dark:stroke-sky-800/40 fill-sky-100/20 dark:fill-sky-950/10 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M 0 0 L 50 15 L 100 0" />
            </svg>
            <div className="absolute top-2 right-2 opacity-40 select-none pointer-events-none w-6 h-6 border border-sky-400 dark:border-sky-800 rounded-full flex items-center justify-center rotate-12 text-[5px] font-bold text-sky-500 uppercase tracking-widest leading-none">
              <span>POST</span>
            </div>
          </>
        ),
        badge: '✉️ Airmail Letter',
      }
    case 'pink':
      return {
        cardClass: 'relative rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 to-rose-100/90 dark:from-rose-950/50 dark:to-rose-900/30 text-rose-900 dark:text-rose-100 shadow-md select-none overflow-hidden h-full flex flex-col',
        bgDecor: (
          <>
            <svg className="absolute top-0 inset-x-0 w-full h-4 stroke-rose-200/80 dark:stroke-rose-900/40 fill-rose-100/10 dark:fill-rose-950/5 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M 0 0 L 50 15 L 100 0" />
            </svg>
            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] z-10">
              <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-600 dark:fill-rose-700">
                <path d="M 50 10 C 25 12, 10 25, 12 50 C 14 75, 25 90, 50 88 C 75 86, 90 75, 88 50 C 86 25, 75 8, 50 10 Z" />
                <path d="M 50 20 C 35 22, 22 35, 24 50 C 26 65, 35 76, 50 74 C 65 72, 76 65, 74 50 C 72 35, 65 18, 50 20 Z" className="fill-rose-700/80 dark:fill-rose-800/80" />
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="scale(1.1) translate(28, 28)" className="fill-rose-100" />
              </svg>
            </div>
          </>
        ),
        badge: '💌 Love Letter',
      }
    case 'purple':
      return {
        cardClass: 'relative rounded-xl border-4 border-double border-violet-300 dark:border-violet-800/80 bg-violet-50 dark:bg-violet-950/40 text-violet-950 dark:text-violet-100 shadow-md select-none overflow-hidden h-full flex flex-col',
        bgDecor: (
          <>
            <div className="absolute top-2 right-2 w-6 h-6 border border-dashed border-violet-400 dark:border-violet-800 bg-violet-100/60 dark:bg-violet-900/40 rounded-sm flex items-center justify-center select-none pointer-events-none rotate-6">
              <div className="text-[5px] font-bold text-violet-500/70">POST</div>
            </div>
            <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[1px] border-l border-dashed border-violet-300/40 dark:border-violet-700/30 pointer-events-none" />
          </>
        ),
        badge: '🎴 Postcard',
      }
    case 'yellow':
    default:
      return {
        cardClass: 'relative rounded-md border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/90 dark:from-amber-950/50 dark:to-amber-900/30 text-amber-950 dark:text-amber-100 shadow-md select-none overflow-hidden h-full flex flex-col',
        bgDecor: (
          <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-10 h-3.5 bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 backdrop-blur-[1px] rotate-[-1.5deg] shadow-sm pointer-events-none" />
        ),
        badge: '📌 Sticky Note',
      }
  }
}
