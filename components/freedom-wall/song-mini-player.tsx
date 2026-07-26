'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import { SongPreview } from './types'

export function SongMiniPlayer({ song }: { song: SongPreview }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = new Audio(song.previewUrl)
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      setProgress((audio.currentTime / (audio.duration || 30)) * 100)
    })
    audio.addEventListener('ended', () => {
      setPlaying(false)
      setProgress(0)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [song.previewUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => {})
      setPlaying(true)
    }
  }

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center gap-2.5 p-2">
      <img
        src={song.artworkUrl}
        alt={song.title}
        className="size-9 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold truncate leading-tight">{song.title}</p>
        <p className="text-[9px] opacity-60 truncate">{song.artist}</p>
        {/* Progress bar */}
        <div className="mt-1 h-0.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-current rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        onClick={togglePlay}
        className="size-11 min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
