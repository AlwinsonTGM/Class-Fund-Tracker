'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Check } from 'lucide-react'
import { COLOR_MAP } from './constants'
import { SongPreview } from './types'

const SongSearchInput = dynamic(
  () => import('./song-search-input').then(m => m.SongSearchInput),
  {
    loading: () => <div className="h-10 rounded-xl bg-muted/40 animate-pulse border border-border" />,
    ssr: false
  }
)

export interface AddPostModalProps {
  content: string
  setContent: (val: string) => void
  authorName: string
  setAuthorName: (val: string) => void
  selectedColor: string
  setSelectedColor: (val: string) => void
  selectedSong: SongPreview | null
  setSelectedSong: (val: SongPreview | null) => void
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
  isPending: boolean
}

export function AddPostModal({
  content,
  setContent,
  authorName,
  setAuthorName,
  selectedColor,
  setSelectedColor,
  selectedSong,
  setSelectedSong,
  onSubmit,
  onReset,
  isPending
}: AddPostModalProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 anim-stagger-in shadow-md">
      <h3 className="text-sm font-bold text-foreground">Leave a Sticky Note</h3>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-content" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Your Message
          </label>
          <textarea
            id="post-content"
            required
            disabled={isPending}
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? Keep it friendly and clean! ✨"
            maxLength={200}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors resize-none"
          />
          <div className="text-[10px] text-right text-muted-foreground">{content.length}/200</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Nickname */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="post-author" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Nickname (Optional)
            </label>
            <input
              id="post-author"
              type="text"
              disabled={isPending}
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              maxLength={25}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 min-h-[44px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sticky Note Color</span>
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(COLOR_MAP).map(colorKey => {
                const c = COLOR_MAP[colorKey]!
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setSelectedColor(colorKey)}
                    disabled={isPending}
                    className={`size-11 min-h-[44px] min-w-[44px] rounded-full border ${c.bg} ${c.border} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 press-spring`}
                    aria-label={`Select ${c.name}`}
                  >
                    {selectedColor === colorKey && <Check className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Song Attach (Optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Attach a Song Preview (Optional)
          </label>
          <SongSearchInput
            onSelect={setSelectedSong}
            selected={selectedSong}
            onClear={() => setSelectedSong(null)}
          />
        </div>

        <div className="flex flex-col-reverse xs:flex-row justify-end gap-2.5 mt-1 border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={onReset}
            disabled={isPending}
            className="w-full xs:w-auto min-h-[44px] px-4 py-2.5 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer flex items-center justify-center press-spring"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="w-full xs:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center justify-center gap-1.5"
          >
            {isPending && <span className="h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />}
            Post Note
          </button>
        </div>
      </form>
    </div>
  )
}
