'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { addPostAction, deletePostAction } from '@/app/officer-dashboard/actions'
import { Play, Pause, X, Music, AlertTriangle, PenSquare, Check, FolderOpen } from 'lucide-react'

export interface SongPreview {
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

export interface FreedomPost {
  id: number
  created_at?: string
  content: string
  author_name: string
  color: string
  song?: SongPreview | null
}

interface FreedomWallProps {
  initialPosts: FreedomPost[]
  isOfficer: boolean
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
}

// ─── Curated Emoji Palette for Reactions ──────────────────────────────────────
const EMOJI_PALETTE = [
  '👍','❤️','😂','😮','😢','🔥','🎉','💯',
  '👏','🥹','💀','🤯','😍','🙏','⭐','✨',
  '😭','🫡','💪','👀','🫶','🤣','😤','🥳',
]

const DEFAULT_REACTION = '👍'

// Reactions are stored purely in localStorage keyed by post ID to avoid DB migration
const REACTIONS_STORAGE_KEY = 'cft_post_reactions_v1'
const SONG_MAP_KEY = 'cft_post_songs_v1'
const PENDING_SONG_KEY = 'cft_pending_song_v1'

// Song map: { [postId]: SongPreview } — persists songs across server re-syncs
function loadSongMap(): Record<number, SongPreview> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SONG_MAP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSongMap(map: Record<number, SongPreview>) {
  localStorage.setItem(SONG_MAP_KEY, JSON.stringify(map))
}

function loadAllReactions(): Record<number, Record<string, number>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveAllReactions(reactions: Record<number, Record<string, number>>) {
  localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions))
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; name: string; chipBg: string }> = {
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

// ─── Mini Song Player ──────────────────────────────────────────────────────────
function SongMiniPlayer({ song }: { song: SongPreview }) {
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
        className="size-8 shrink-0 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors cursor-pointer"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

// ─── iTunes Song Search ────────────────────────────────────────────────────────
interface ItunesResult {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
  previewUrl: string
}

function SongSearchInput({ onSelect, selected, onClear }: {
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
        <button onClick={onClear} className="text-muted-foreground hover:text-destructive cursor-pointer">
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
          className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
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
              className="w-full flex items-center gap-2.5 p-2.5 hover:bg-muted transition-colors cursor-pointer text-left border-b border-border/40 last:border-0"
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

// ─── Reactions Component ──────────────────────────────────────────────────────
function PostReactions({ postId, colorKey }: { postId: number; colorKey: string }) {
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.yellow!
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Load reactions for this post from localStorage
  useEffect(() => {
    const all = loadAllReactions()
    const postReactions = all[postId] || { [DEFAULT_REACTION]: 0 }
    setReactions(postReactions)
  }, [postId])

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
    setReactions(prev => {
      const updated = { ...prev, [emoji]: (prev[emoji] || 0) + 1 }
      const all = loadAllReactions()
      all[postId] = updated
      saveAllReactions(all)
      return updated
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
      {reactionEntries.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => react(emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer press-spring ${colors.chipBg} border border-black/5 dark:border-white/5`}
        >
          <span>{emoji}</span>
          <span className="text-[10px] font-bold opacity-80">{count}</span>
        </button>
      ))}

      {/* + Add Reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(v => !v)}
          className={`flex items-center justify-center size-6 rounded-full text-xs transition-all cursor-pointer press-spring ${colors.chipBg} border border-black/5 dark:border-white/5 font-bold opacity-70 hover:opacity-100`}
          title="Add reaction"
        >
          +
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="absolute bottom-8 left-0 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2.5 grid grid-cols-8 gap-1 w-52">
            {EMOJI_PALETTE.map(emoji => (
              <button
                key={emoji}
                onClick={() => addNewEmoji(emoji)}
                className="size-7 flex items-center justify-center text-base rounded-lg hover:bg-muted transition-colors cursor-pointer press-spring"
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function FreedomWall({
  initialPosts,
  isOfficer,
  dbError = false,
  triggerAddOpen = false,
  onCloseAddTrigger
}: FreedomWallProps) {
  const [posts, setPosts] = useState<FreedomPost[]>(initialPosts)
  const [showAddForm, setShowAddForm] = useState(false)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [selectedSong, setSelectedSong] = useState<SongPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Sync initial posts — re-attach song data from localStorage after server re-sync
  useEffect(() => {
    if (dbError) {
      setFallbackMode(true)
      const localPostsStr = localStorage.getItem('cft_fallback_posts')
      if (localPostsStr) {
        try {
          setPosts(JSON.parse(localPostsStr) as FreedomPost[])
        } catch (e) {
          console.error('Failed to parse local posts', e)
        }
      }
    } else {
      setFallbackMode(false)
      const songMap = loadSongMap()

      // Check if there's a pending song to assign to the newest server post
      try {
        const pendingRaw = localStorage.getItem(PENDING_SONG_KEY)
        if (pendingRaw) {
          const pending: { content: string; author: string; song: SongPreview } = JSON.parse(pendingRaw)
          // Find the server post that matches the pending content + author
          const matched = initialPosts.find(
            p => p.content === pending.content && p.author_name === pending.author
          )
          if (matched) {
            songMap[matched.id] = pending.song
            saveSongMap(songMap)
            localStorage.removeItem(PENDING_SONG_KEY)
          }
        }
      } catch { /* ignore */ }

      // Attach songs from song map to posts
      const postsWithSongs = initialPosts.map(p => ({
        ...p,
        song: songMap[p.id] || null
      }))
      setPosts(postsWithSongs)
    }
  }, [initialPosts, dbError])

  // Open add form if bottom nav + requested it
  useEffect(() => {
    if (triggerAddOpen) {
      setShowAddForm(true)
      if (onCloseAddTrigger) onCloseAddTrigger()
    }
  }, [triggerAddOpen, onCloseAddTrigger])

  const resetForm = () => {
    setContent('')
    setAuthorName('')
    setSelectedColor('yellow')
    setSelectedSong(null)
    setShowAddForm(false)
    setError(null)
  }

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Please write a message first.')
      return
    }

    const name = authorName.trim() || 'Anonymous'

    startTransition(async () => {
      if (fallbackMode) {
        savePostLocally(content.trim(), name, selectedColor)
        return
      }

      try {
        // Save pending song BEFORE the server call so the sync useEffect can match it
        if (selectedSong) {
          localStorage.setItem(PENDING_SONG_KEY, JSON.stringify({
            content: content.trim(),
            author: name,
            song: selectedSong
          }))
        }

        const res = await addPostAction(content.trim(), name, selectedColor)
        if (res.success) {
          // Optimistically add to local state with song; server re-sync will re-attach properly
          const newPost: FreedomPost = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            content: content.trim(),
            author_name: name,
            color: selectedColor,
            song: selectedSong
          }
          setPosts(prev => [newPost, ...prev])
          resetForm()
        } else {
          if (res.error?.includes('relation') || res.error?.includes('Could not find the table')) {
            setFallbackMode(true)
            savePostLocally(content.trim(), name, selectedColor)
          } else {
            setError(res.error || 'Failed to add post.')
          }
        }
      } catch (err: any) {
        console.error('Add post error, using local fallback', err)
        setFallbackMode(true)
        savePostLocally(content.trim(), name, selectedColor)
      }
    })
  }

  const savePostLocally = (text: string, name: string, color: string) => {
    const newPost: FreedomPost = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      content: text,
      author_name: name,
      color,
      song: selectedSong
    }
    const updated = [newPost, ...posts]
    setPosts(updated)
    localStorage.setItem('cft_fallback_posts', JSON.stringify(updated))
    resetForm()
  }

  const handleDeletePost = (id: number) => {
    if (window.confirm('Are you sure you want to delete this message from the Freedom Wall?')) {
      if (fallbackMode) {
        const updated = posts.filter(p => p.id !== id)
        setPosts(updated)
        localStorage.setItem('cft_fallback_posts', JSON.stringify(updated))
        return
      }

      startTransition(async () => {
        try {
          const res = await deletePostAction(id)
          if (!res.success) {
            setError(res.error || 'Failed to delete post.')
          } else {
            setPosts(prev => prev.filter(p => p.id !== id))
          }
        } catch {
          setError('Failed to delete post.')
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {fallbackMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 leading-5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <span>Running in Local Fallback Mode. Posts are stored in this browser because the Supabase `freedom_posts` table is missing.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Freedom Wall</h2>
          <p className="text-xs text-muted-foreground">Share your thoughts, suggestions, or comments anonymously.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold px-4 py-2 bg-foreground text-background rounded-full hover:bg-[#383838] press-spring cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          {showAddForm ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <PenSquare className="h-3.5 w-3.5" />
              <span>Write a Note</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
          {error}
        </div>
      )}

      {/* Add Post Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 anim-stagger-in shadow-md">
          <h3 className="text-sm font-bold text-foreground">Leave a Sticky Note</h3>

          <form onSubmit={handleAddPost} className="flex flex-col gap-4">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Color Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sticky Note Color</span>
                <div className="flex items-center gap-2">
                  {Object.keys(COLOR_MAP).map(colorKey => {
                    const c = COLOR_MAP[colorKey]!
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setSelectedColor(colorKey)}
                        disabled={isPending}
                        className={`size-8 rounded-full border ${c.bg} ${c.border} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 press-spring`}
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

            <div className="flex justify-end gap-2.5 mt-1 border-t border-border/40 pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold border border-border rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 text-xs font-semibold bg-foreground hover:bg-[#383838] text-background rounded-full cursor-pointer press-spring flex items-center gap-1.5"
              >
                {isPending && <span className="h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />}
                Post Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-bold text-foreground mt-1">The Wall is Empty</h3>
          <p className="text-xs text-muted-foreground mt-1">Be the first to post something on the wall!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {posts.map(post => {
            const colors = COLOR_MAP[post.color] || COLOR_MAP.yellow!
            const dateStr = post.created_at
              ? new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })
              : 'Just now'
            const angle = (post.id % 7) - 3

            return (
              <div
                key={post.id}
                style={{ '--tilt-angle': `${angle}deg` } as React.CSSProperties}
                className={`relative flex flex-col p-4 rounded-2xl border shadow-sm sticky-note ${colors.bg} ${colors.border} ${colors.text}`}
              >
                {/* Officer Delete */}
                {isOfficer && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-2 right-2 opacity-0 hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-destructive/20 hover:text-destructive size-6 rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                    title="Delete post"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Content */}
                <div className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap pr-5 flex-1">
                  {post.content}
                </div>

                {/* Song Mini Player */}
                {post.song && <SongMiniPlayer song={post.song} />}

                {/* Footer */}
                <div className="flex flex-col gap-0.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-bold truncate flex items-center gap-1">
                    <PenSquare className="h-3 w-3 text-muted-foreground" />
                    <span>{post.author_name}</span>
                  </span>
                  <span className="text-[9px] opacity-60">{dateStr}</span>
                </div>

                {/* Reactions */}
                <PostReactions postId={post.id} colorKey={post.color} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
