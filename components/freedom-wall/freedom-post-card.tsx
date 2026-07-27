'use client'

import React from 'react'
import { FreedomPost, UserType } from './types'
import { getPostTheme } from './constants'
import { SongMiniPlayer } from './song-mini-player'
import { X, Music, PenSquare } from 'lucide-react'

export interface FreedomPostCardProps {
  post: FreedomPost
  isOfficer: boolean
  user?: UserType | null
  onDelete?: (id: number) => void
  onNoteClick?: (id: number, element: HTMLElement) => void
  mode?: 'scatter' | 'grid'
}

export function FreedomPostCard({
  post,
  isOfficer,
  user,
  onDelete,
  onNoteClick,
  mode = 'grid'
}: FreedomPostCardProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const theme = getPostTheme(post.color)
  const isBlue = post.color === 'blue'
  const dateStr = post.created_at
    ? new Date(post.created_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'Just now'
  const angle = (post.id % 7) - 3

  if (mode === 'scatter') {
    const innerCardContent = (
      <>
        {theme.bgDecor}
        {isOfficer && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(post.id)
            }}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-destructive/20 hover:text-destructive size-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-opacity cursor-pointer z-10"
            title="Delete post"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
        
        <div className="text-[10px] sm:text-xs font-medium leading-normal break-words line-clamp-3 pr-2 flex-1 mt-1 font-sans cursor-zoom-in">
          {post.content}
        </div>

        {post.song && (
          <div className="mt-1 flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded border border-black/5 dark:border-white/5 select-none text-[8px] sm:text-[9px] leading-tight max-w-full">
            <img
              src={post.song.artworkUrl}
              alt={post.song.title}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover shrink-0"
            />
            <span className="truncate opacity-80 font-semibold">{post.song.title}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[8px] sm:text-[9px] opacity-75">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold truncate max-w-[65px]">{post.author_name}</span>
            {post.song && <Music className="h-2.5 w-2.5 text-primary shrink-0" />}
          </div>
        </div>
      </>
    )

    return (
      <div className={`${theme.cardClass} flex-1 flex flex-col h-full overflow-hidden`}>
        {isBlue ? (
          <div className={`${theme.innerClass} flex-1 flex flex-col`}>
            {innerCardContent}
          </div>
        ) : (
          <div className="p-3 sm:p-4 flex-1 flex flex-col relative h-full">
            {innerCardContent}
          </div>
        )}
      </div>
    )
  }

  // Grid mode
  const contentNode = (
    <div className="p-4 flex-1 flex flex-col relative h-full">
      {theme.bgDecor}
      {isOfficer && onDelete && (
        <button
          onClick={() => onDelete(post.id)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-destructive/20 hover:text-destructive size-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-opacity cursor-pointer z-10"
          title="Delete post"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <div 
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (!target.closest('button') && onNoteClick) {
            onNoteClick(post.id, e.currentTarget.closest('.grid-card') as HTMLElement)
          }
        }}
        className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap pr-5 flex-1 cursor-zoom-in mt-1"
      >
        {post.content}
      </div>

      {post.song && <SongMiniPlayer song={post.song} />}

      <div className="flex flex-col gap-0.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
        <span className="font-bold truncate flex items-center gap-1">
          <PenSquare className="h-3 w-3 text-muted-foreground" />
          <span>{post.author_name}</span>
        </span>
        <span className="text-[9px] opacity-60">{dateStr}</span>
      </div>
    </div>
  )

  return (
    <div
      style={{ '--tilt-angle': `${angle}deg` } as React.CSSProperties}
      className={`relative flex flex-col rounded-2xl border shadow-sm sticky-note grid-card p-0.5`}
    >
      <div className={`${theme.cardClass} flex-1 flex flex-col h-full overflow-hidden`}>
        {isBlue ? (
          <div className={`${theme.innerClass} flex-1 flex flex-col p-0.5`}>
            {contentNode}
          </div>
        ) : (
          contentNode
        )}
      </div>
    </div>
  )
}
