'use client'

import React, { useState, useEffect, useRef } from 'react'
import { UserType } from './types'
import {
  EMOJI_PALETTE,
  DEFAULT_REACTION,
  COLOR_MAP,
  loadAllReactions,
  saveAllReactions,
  loadUserReactions,
  saveUserReactions
} from './constants'

export function PostReactions(_props: { postId: number; colorKey: string; user?: UserType | null }) {
  return null
}
  const [userHasReacted, setUserHasReacted] = useState<Record<string, boolean>>({})
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Load reactions for this post from localStorage
  useEffect(() => {
    const all = loadAllReactions()
    const postReactions = all[postId] || { [DEFAULT_REACTION]: 0 }
    setReactions(postReactions)
  }, [postId])

  // Load user reaction states
  useEffect(() => {
    if (user?.email) {
      const allUser = loadUserReactions(user.email)
      setUserHasReacted(allUser[postId] || {})
    } else {
      setUserHasReacted({})
    }
  }, [postId, user])

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  const react = (emoji: string) => {
    if (!user) {
      alert('Please log in to react to posts!')
      return
    }

    const email = user.email
    if (!email) return

    const hasReacted = userHasReacted[emoji] || false

    setReactions(prev => {
      const currentCount = prev[emoji] || 0
      const nextCount = hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1
      
      const updated = { ...prev, [emoji]: nextCount }
      const all = loadAllReactions()
      all[postId] = updated
      saveAllReactions(all)
      return updated
    })

    setUserHasReacted(prev => {
      const updatedUser = { ...prev, [emoji]: !hasReacted }
      const allUser = loadUserReactions(email)
      allUser[postId] = updatedUser
      saveUserReactions(email, allUser)
      return updatedUser
    })

    setShowPicker(false)
  }

  const addNewEmoji = (emoji: string) => {
    react(emoji)
  }

  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0 || reactions[DEFAULT_REACTION] !== undefined)

  return (
    <div className="relative flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
      {/* Existing reaction chips */}
      {reactionEntries.map(([emoji, count]) => {
        const isUserReacted = userHasReacted[emoji] || false
        return (
          <button
            key={emoji}
            onClick={() => react(emoji)}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer press-spring border ${
              isUserReacted
                ? 'bg-primary/20 border-primary text-primary font-extrabold shadow-sm'
                : `${colors.chipBg} border-black/5 dark:border-white/5 text-current`
            }`}
          >
            <span>{emoji}</span>
            <span className="text-[10px] font-bold opacity-80">{count}</span>
          </button>
        )
      })}

      {/* + Add Reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => {
            if (!user) {
              alert('Please log in to react to posts!')
              return
            }
            setShowPicker(v => !v)
          }}
          className={`size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-xs transition-all cursor-pointer press-spring ${colors.chipBg} border border-black/5 dark:border-white/5 font-bold opacity-70 hover:opacity-100`}
          title="Add reaction"
        >
          +
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="absolute bottom-12 left-0 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2.5 grid grid-cols-6 gap-1.5 w-[296px] max-w-[85vw]">
            {EMOJI_PALETTE.map(emoji => (
              <button
                key={emoji}
                onClick={() => addNewEmoji(emoji)}
                className="size-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-xl rounded-lg hover:bg-muted transition-colors cursor-pointer press-spring"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
