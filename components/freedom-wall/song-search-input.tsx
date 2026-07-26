'use client'

import React, { useState, useRef } from 'react'
import { Music, X } from 'lucide-react'
import { SongPreview, ItunesResult } from './types'

export function SongSearchInput({ onSelect, selected, onClear }: {
  onSelect: (song: SongPreview) => void
  selected: SongPreview | null
  onClear: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ItunesResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=5`
      )
      const data = await res.json()
      setResults((data.results || []).filter((r: ItunesResult) => r.previewUrl))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 500)
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-border">
        <img src={selected.artworkUrl} alt={selected.title} className="size-8 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold truncate">{selected.title}</p>
          <p className="text-[9px] text-muted-foreground truncate">{selected.artist}</p>
        </div>
        <button onClick={onClear} className="size-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search a song to attach... (optional)"
          className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 min-h-[44px] text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-md">
          {results.map(r => (
            <button
              key={r.trackId}
              type="button"
              onClick={() => {
                onSelect({ title: r.trackName, artist: r.artistName, artworkUrl: r.artworkUrl100, previewUrl: r.previewUrl })
                setResults([])
                setQuery('')
              }}
              className="w-full flex items-center gap-2.5 p-2.5 min-h-[44px] hover:bg-muted transition-colors cursor-pointer text-left border-b border-border/40 last:border-0"
            >
              <img src={r.artworkUrl100} alt={r.trackName} className="size-8 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate text-foreground">{r.trackName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{r.artistName}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">▶ 30s</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
