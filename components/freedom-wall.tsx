'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { createPortal } from 'react-dom'
import { addPostAction, deletePostAction } from '@/app/officer-dashboard/actions'
import { Play, Pause, X, Music, AlertTriangle, PenSquare, Check, FolderOpen, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

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
  user?: any
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

const USER_REACTIONS_STORAGE_KEY = 'cft_user_reactions_v2'

function loadUserReactions(email: string): Record<number, Record<string, boolean>> {
  if (typeof window === 'undefined' || !email) return {}
  try {
    const raw = localStorage.getItem(USER_REACTIONS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveUserReactions(email: string, reactions: Record<number, Record<string, boolean>>) {
  localStorage.setItem(USER_REACTIONS_STORAGE_KEY, JSON.stringify(reactions))
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
function PostReactions({ postId, colorKey, user }: { postId: number; colorKey: string; user?: any }) {
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.yellow!
  const [reactions, setReactions] = useState<Record<string, number>>({})
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
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer press-spring border ${
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

const BACKGROUND_GIFS: Record<string, string> = {
  live1: '/live/livephoto.gif',
  live2: '/live/livephoto2.gif',
  live3: '/live/livephoto3.gif',
  live4: '/live/livephoto4.gif',
  live5: '/live/livephoto5.gif',
}

interface WeatherParticle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  sway: number
  swaySpeed: number
  angle?: number
  spin?: number
  emoji?: string
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FreedomWall({
  initialPosts,
  isOfficer,
  dbError = false,
  triggerAddOpen = false,
  onCloseAddTrigger,
  user
}: FreedomWallProps) {
  const { toast } = useToast()
  const [activeBackground, setActiveBackground] = useState<'sky' | 'live1' | 'live2' | 'live3' | 'live4' | 'live5'>('sky')
  const [showSettings, setShowSettings] = useState(false)

  const [posts, setPosts] = useState<FreedomPost[]>(initialPosts)
  // Scatter canvas and physics simulation are limited to the top 10 posts so invisible notes do not exist in physics world
  const activePosts = posts.length > 10 ? posts.slice(0, 10) : posts
  const [showAddForm, setShowAddForm] = useState(false)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [selectedSong, setSelectedSong] = useState<SongPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ─── Interactive States ───────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'scatter' | 'grid'>('scatter')
  const [positions, setPositions] = useState<Record<number, { x: number; y: number }>>({})
  const [highestZIndexes, setHighestZIndexes] = useState<Record<number, number>>({})
  const [focusedPostId, setFocusedPostId] = useState<number | null>(null)
  const [focusedRect, setFocusedRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [activeDragId, setActiveDragId] = useState<number | null>(null)
  const activeDragIdRef = useRef<number | null>(null)
  const [draggedDistance, setDraggedDistance] = useState(0)
  const [viewportSize, setViewportSize] = useState({ w: 1000, h: 800 })
  const [mounted, setMounted] = useState(false)

  // Physics Engine state / refs
  const positionsRef = useRef<Record<number, { x: number; y: number }>>({})
  const velocitiesRef = useRef<Record<number, { vx: number; vy: number }>>({})
  const isSimulating = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const bombLocationRef = useRef<{ x: number; y: number } | null>(null)
  const activeToolRef = useRef<'bomb' | 'magnet' | 'tornado' | null>(null)
  const toolPosRef = useRef<{ x: number; y: number } | null>(null)
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const [activeTool, setActiveTool] = useState<'bomb' | 'magnet' | 'tornado' | null>(null)
  const [toolPos, setToolPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingTool, setIsDraggingTool] = useState(false)
  const [bombCountdown, setBombCountdown] = useState<number | null>(null)
  const [bombLocation, setBombLocation] = useState<{ x: number; y: number } | null>(null)
  const [shakeCanvas, setShakeCanvas] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)

  const dragStartRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // Track window resizing for zoom overlay calculations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight })
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Scroll locking on body while dragging or utilizing sandbox tools to improve mobile UX
  useEffect(() => {
    if (typeof window !== 'undefined' && document.body) {
      if (activeDragId !== null || isDraggingTool || activeTool !== null) {
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
      } else {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }
    return () => {
      if (typeof window !== 'undefined' && document.body) {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }
  }, [activeDragId, isDraggingTool, activeTool])



  // Sync initial posts — song data now comes from database
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
      // Songs are now stored in the database, map song_data to song property
      const postsWithSongs = initialPosts.map(p => ({
        ...p,
        song: p.song_data || null
      }))
      setPosts(postsWithSongs)
    }
  }, [initialPosts, dbError])



  // Sync positions state with localStorage and generate missing random locations
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('cft_post_positions_v2')
      const savedPos = saved ? JSON.parse(saved) : {}
      
      let updated = { ...savedPos }
      let changed = false
      
      activePosts.forEach(p => {
        if (!updated[p.id]) {
          // Scattered positioning:
          // X: 5% to 75%
          // Y: 5% to 70%
          updated[p.id] = {
            x: Math.random() * 70 + 5,
            y: Math.random() * 65 + 5,
          }
          changed = true
        }
      })
      
      setPositions(updated)
      if (!isSimulating.current) {
        positionsRef.current = updated
        // Initialize velocities
        activePosts.forEach(p => {
          if (!velocitiesRef.current[p.id]) {
            velocitiesRef.current[p.id] = { vx: 0, vy: 0 }
          }
        })
      }
      if (changed) {
        localStorage.setItem('cft_post_positions_v2', JSON.stringify(updated))
      }
    } catch (e) {
      console.error('Failed to sync post positions', e)
    }
  }, [posts])

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
        const res = await addPostAction({
          content: content.trim(),
          author_name: name,
          color: selectedColor,
          song_data: selectedSong || null
        })
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
          toast.success('Your note has been posted to the Freedom Wall!', 'Note Posted')
          resetForm()
        } else {
          if (res.error?.includes('relation') || res.error?.includes('Could not find the table')) {
            setFallbackMode(true)
            savePostLocally(content.trim(), name, selectedColor)
            toast.success('Note posted locally.', 'Note Posted')
          } else {
            const msg = res.error || 'Failed to add post.'
            setError(msg)
            toast.error(msg, 'Post Failed')
          }
        }
      } catch (err: any) {
        console.error('Add post error, using local fallback', err)
        setFallbackMode(true)
        savePostLocally(content.trim(), name, selectedColor)
        toast.success('Note posted locally.', 'Note Posted')
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
        toast.success('Note removed from Freedom Wall.', 'Note Deleted')
        return
      }

      startTransition(async () => {
        try {
          const res = await deletePostAction(id)
          if (!res.success) {
            const msg = res.error || 'Failed to delete post.'
            setError(msg)
            toast.error(msg, 'Deletion Failed')
          } else {
            setPosts(prev => prev.filter(p => p.id !== id))
            toast.success('Note removed from Freedom Wall.', 'Note Deleted')
          }
        } catch {
          const msg = 'Failed to delete post.'
          setError(msg)
          toast.error(msg, 'Deletion Failed')
        }
      })
    }
  }

  // ─── Custom Visual Templates ──────────────────────────────────────────────────
  const getPostTheme = (color: string) => {
    switch (color) {
      case 'green': // Pressed Leaf Card
        return {
          cardClass: 'relative rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50 to-emerald-100/90 dark:from-emerald-950/50 dark:to-emerald-900/30 text-emerald-900 dark:text-emerald-100 shadow-md select-none overflow-hidden h-full flex flex-col',
          bgDecor: (
            <>
              {/* Detailed leaf skeleton overlay in background */}
              <svg className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-emerald-600/10 dark:text-emerald-400/10 fill-none stroke-current stroke-[1.5] select-none pointer-events-none" viewBox="0 0 100 100">
                <path d="M 10 90 C 30 70, 50 30, 90 10" />
                <path d="M 30 70 Q 55 60, 65 45" />
                <path d="M 50 50 Q 75 45, 80 30" />
                <path d="M 40 60 Q 25 45, 20 35" />
                <path d="M 58 42 Q 45 28, 40 18" />
              </svg>
              {/* Cute leaf sticker emblem */}
              <div className="absolute top-2 right-2 text-xs opacity-60">🍃</div>
            </>
          ),
          badge: '🍃 Leaf Note',
        }
      case 'blue': // Classic Airmail Letter Envelope
        return {
          cardClass: 'relative rounded-xl bg-[repeating-linear-gradient(-45deg,#3b82f6,#3b82f6_6px,#fff_6px,#fff_12px,#ef4444_12px,#ef4444_18px,#fff_18px,#fff_24px)] dark:bg-[repeating-linear-gradient(-45deg,#1d4ed8,#1d4ed8_6px,#1e293b_6px,#1e293b_12px,#be123c_12px,#be123c_18px,#1e293b_18px,#1e293b_24px)] p-1 sm:p-1.5 shadow-md select-none h-full flex flex-col',
          innerClass: 'bg-sky-50 dark:bg-slate-900 text-sky-950 dark:text-sky-100 rounded-lg p-3 h-full flex flex-col relative overflow-hidden',
          bgDecor: (
            <>
              {/* Envelope Flap Drawing */}
              <svg className="absolute top-0 inset-x-0 w-full h-4 stroke-sky-200/60 dark:stroke-sky-800/40 fill-sky-100/20 dark:fill-sky-950/10 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M 0 0 L 50 15 L 100 0" />
              </svg>
              {/* Postmark stamp in corner */}
              <div className="absolute top-2 right-2 opacity-40 select-none pointer-events-none w-6 h-6 border border-sky-400 dark:border-sky-800 rounded-full flex items-center justify-center rotate-12 text-[5px] font-bold text-sky-500 uppercase tracking-widest leading-none">
                <span>POST</span>
              </div>
            </>
          ),
          badge: '✉️ Airmail Letter',
        }
      case 'pink': // Love Letter / Wax Seal
        return {
          cardClass: 'relative rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 to-rose-100/90 dark:from-rose-950/50 dark:to-rose-900/30 text-rose-900 dark:text-rose-100 shadow-md select-none overflow-hidden h-full flex flex-col',
          bgDecor: (
            <>
              {/* Letter Flap line */}
              <svg className="absolute top-0 inset-x-0 w-full h-4 stroke-rose-200/80 dark:stroke-rose-900/40 fill-rose-100/10 dark:fill-rose-950/5 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M 0 0 L 50 15 L 100 0" />
              </svg>
              {/* Heart Wax Seal sticker centered on top flap */}
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
      case 'purple': // Vintage Postcard
        return {
          cardClass: 'relative rounded-xl border-4 border-double border-violet-300 dark:border-violet-800/80 bg-violet-50 dark:bg-violet-950/40 text-violet-950 dark:text-violet-100 shadow-md select-none overflow-hidden h-full flex flex-col',
          bgDecor: (
            <>
              {/* Postage Stamp in corner */}
              <div className="absolute top-2 right-2 w-6 h-6 border border-dashed border-violet-400 dark:border-violet-800 bg-violet-100/60 dark:bg-violet-900/40 rounded-sm flex items-center justify-center select-none pointer-events-none rotate-6">
                <div className="text-[5px] font-bold text-violet-500/70">POST</div>
              </div>
              {/* Small vertical dividing line in background */}
              <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[1px] border-l border-dashed border-violet-300/40 dark:border-violet-700/30 pointer-events-none" />
            </>
          ),
          badge: '🎴 Postcard',
        }
      case 'yellow':
      default: // Sticky Note with Tape
        return {
          cardClass: 'relative rounded-md border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/90 dark:from-amber-950/50 dark:to-amber-900/30 text-amber-950 dark:text-amber-100 shadow-md select-none overflow-hidden h-full flex flex-col',
          bgDecor: (
            /* Clear semi-transparent sticky tape overlay on top center */
            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-10 h-3.5 bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/5 backdrop-blur-[1px] rotate-[-1.5deg] shadow-sm pointer-events-none" />
          ),
          badge: '📌 Sticky Note',
        }
    }
  }

  // ─── Drag Event Handlers ─────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent, postId: number) => {
    if (viewMode === 'grid') return
    if (focusedPostId !== null) return

    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('a')) {
      return
    }

    setHighestZIndexes(prev => ({
      ...prev,
      [postId]: Math.max(...Object.values(prev), 0) + 1
    }))

    e.preventDefault()
    setActiveDragId(postId)
    activeDragIdRef.current = postId
    setDraggedDistance(0)

    const currentPos = positionsRef.current[postId] || positions[postId] || { x: 30, y: 30 }
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentPos.x,
      startPosY: currentPos.y
    }

    const element = e.currentTarget as HTMLElement
    element.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent, postId: number) => {
    if (activeDragIdRef.current !== postId || !dragStartRef.current || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const dragInfo = dragStartRef.current

    const deltaX = e.clientX - dragInfo.startX
    const deltaY = e.clientY - dragInfo.startY

    const dist = Math.hypot(deltaX, deltaY)
    setDraggedDistance(dist)

    const deltaXPercent = (deltaX / canvasRect.width) * 100
    const deltaYPercent = (deltaY / canvasRect.height) * 100

    const newX = Math.max(2, Math.min(88, dragInfo.startPosX + deltaXPercent))
    const newY = Math.max(2, Math.min(85, dragInfo.startPosY + deltaYPercent))

    // Update positionsRef & zero out velocity so physics engine doesn't fight the user's drag or snap back
    positionsRef.current[postId] = { x: newX, y: newY }
    if (velocitiesRef.current[postId]) {
      velocitiesRef.current[postId] = { vx: 0, vy: 0 }
    }

    // Direct DOM manipulation for fast rendering
    const el = cardRefs.current[postId]
    if (el) {
      el.style.left = `${newX}%`
      el.style.top = `${newY}%`
    }

    setPositions(prev => {
      const updated = {
        ...prev,
        [postId]: { x: newX, y: newY }
      }
      localStorage.setItem('cft_post_positions_v2', JSON.stringify(updated))
      return updated
    })
  }

  const handlePointerUp = (e: React.PointerEvent, postId: number) => {
    if (activeDragIdRef.current === postId) {
      setActiveDragId(null)
      activeDragIdRef.current = null
      dragStartRef.current = null
      const element = e.currentTarget as HTMLElement
      try {
        element.releasePointerCapture(e.pointerId)
      } catch (err) {}

      // If user did not drag, trigger fly-out zoom detail overlay
      if (draggedDistance < 5) {
        handleNoteClick(postId, element)
      }
    }
  }

  // ─── Zoom Action Animations ──────────────────────────────────────────────────
  const handleNoteClick = (postId: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setFocusedRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    })
    setFocusedPostId(postId)
    // Small timeout to allow mount at starting coordinates before zooming
    setTimeout(() => {
      setIsZoomed(true)
    }, 25)
  }

  const closeZoom = () => {
    setIsZoomed(false)
    setTimeout(() => {
      setFocusedPostId(null)
      setFocusedRect(null)
    }, 400) // matches 400ms transition time
  }

  // Calculate coordinates for screen-centered focused note
  const targetWidth = Math.min(460, viewportSize.w - 32)
  const targetHeight = Math.min(350, viewportSize.h - 64)
  const targetLeft = (viewportSize.w - targetWidth) / 2
  const targetTop = (viewportSize.h - targetHeight) / 2

  const zoomStyle = focusedRect ? {
    position: 'fixed' as const,
    left: isZoomed ? `${targetLeft}px` : `${focusedRect.left}px`,
    top: isZoomed ? `${targetTop}px` : `${focusedRect.top}px`,
    width: isZoomed ? `${targetWidth}px` : `${focusedRect.width}px`,
    height: isZoomed ? `${targetHeight}px` : `${focusedRect.height}px`,
    transform: isZoomed ? 'rotate(0deg)' : `rotate(${(focusedPostId ? (focusedPostId % 13) - 6 : 0)}deg)`,
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    zIndex: 9999, // Render on top of the blurred backdrop (z-[9998])
  } : {}

  // ─── Physics Simulation Engine ───────────────────────────────────────────────
  const startPhysicsLoop = () => {
    if (isSimulating.current) return
    isSimulating.current = true

    const updatePhysics = () => {
      let hasMotion = false
      const damp = 0.94 // sliding friction coefficient (ice-like)
      const limit = 0.05 // threshold to stop simulating static notes

      const updatedPos = { ...positionsRef.current }
      const updatedVel = { ...velocitiesRef.current }

      const currentTool = activeToolRef.current
      const currentToolPos = toolPosRef.current

      // If magnet is active, pull notes toward it
      if (currentTool === 'magnet' && currentToolPos) {
        activePosts.forEach(post => {
          const pos = updatedPos[post.id] || { x: 30, y: 30 }
          const vel = updatedVel[post.id] || { vx: 0, vy: 0 }
          
          const dx = currentToolPos.x - pos.x
          const dy = currentToolPos.y - pos.y
          const dist = Math.hypot(dx, dy)
          
          if (dist > 1.0) {
            // Spring force: grows with distance, capped to avoid excessive speed
            const pull = Math.min(0.8, dist * 0.025)
            vel.vx += (dx / dist) * pull
            vel.vy += (dy / dist) * pull
          } else {
            // Slow down near magnet center so they clump nicely
            vel.vx *= 0.8
            vel.vy *= 0.8
          }
          updatedVel[post.id] = vel
        })
        hasMotion = true
      }

      // If tornado is active, orbit pull notes in a tight circular vortex
      if (currentTool === 'tornado' && currentToolPos) {
        activePosts.forEach(post => {
          const pos = updatedPos[post.id] || { x: 30, y: 30 }
          const vel = updatedVel[post.id] || { vx: 0, vy: 0 }
          
          const dx = currentToolPos.x - pos.x
          const dy = currentToolPos.y - pos.y
          const dist = Math.hypot(dx, dy)
          
          if (dist > 0.1) {
            // Tight circular vortex physics (very small orbital radius for small screens)
            const targetRadius = 5.0 // very tight orbital radius (approx 30px)
            const radialDiff = dist - targetRadius
            const pull = radialDiff * 0.15 // pull/push to lock into target radius
            const spin = 0.85 // fast orbital spin velocity
            
            const px = -dy
            const py = dx
            
            vel.vx += (dx / dist) * pull + (px / dist) * spin
            vel.vy += (dy / dist) * pull + (py / dist) * spin
          }
          updatedVel[post.id] = vel
        })
        hasMotion = true
      }

      // Mutual Repulsion (Separation force) to keep notes spaced out and prevent them from clumping/merging
      const repulsionRadius = 14.0 // distance in % where notes start repelling each other
      const repulsionStrength = 0.35 // strength of the repulsion push
      
      for (let i = 0; i < activePosts.length; i++) {
        const postA = activePosts[i]
        const posA = updatedPos[postA.id] || { x: 30, y: 30 }
        
        for (let j = i + 1; j < activePosts.length; j++) {
          const postB = activePosts[j]
          const posB = updatedPos[postB.id] || { x: 30, y: 30 }
          
          const dx = posB.x - posA.x
          const dy = posB.y - posA.y
          const dist = Math.hypot(dx, dy) || 0.1
          
          if (dist < repulsionRadius) {
            // Push force is stronger when they are closer
            const force = (repulsionRadius - dist) * repulsionStrength
            const forceX = (dx / dist) * force
            const forceY = (dy / dist) * force
            
            const velA = updatedVel[postA.id] || { vx: 0, vy: 0 }
            const velB = updatedVel[postB.id] || { vx: 0, vy: 0 }
            
            // Only push them if they are not the active drag note (so dragging feels responsive)
            if (activeDragIdRef.current !== postA.id) {
              velA.vx -= forceX
              velA.vy -= forceY
            }
            if (activeDragIdRef.current !== postB.id) {
              velB.vx += forceX
              velB.vy += forceY
            }
            
            updatedVel[postA.id] = velA
            updatedVel[postB.id] = velB
          }
        }
      }

      activePosts.forEach(post => {
        // Skip physics velocity movement for the post currently being dragged
        if (activeDragIdRef.current === post.id) return

        let pos = updatedPos[post.id] || { x: 30, y: 30 }
        let vel = updatedVel[post.id] || { vx: 0, vy: 0 }

        // Apply velocities
        pos.x += vel.vx
        pos.y += vel.vy

        // Apply friction
        vel.vx *= damp
        vel.vy *= damp

        // Bounce off canvas boundaries
        // Width boundary: 2% to 88%
        if (pos.x < 2) {
          pos.x = 2
          vel.vx = -vel.vx * 0.45
        }
        if (pos.x > 88) {
          pos.x = 88
          vel.vx = -vel.vx * 0.45
        }
        // Height boundary: 2% to 82%
        if (pos.y < 2) {
          pos.y = 2
          vel.vy = -vel.vy * 0.45
        }
        if (pos.y > 82) {
          pos.y = 82
          vel.vy = -vel.vy * 0.45
        }

        // Check if movement is significant enough to continue physics loop
        if (Math.abs(vel.vx) > limit || Math.abs(vel.vy) > limit) {
          hasMotion = true
        } else {
          vel.vx = 0
          vel.vy = 0
        }

        updatedPos[post.id] = pos
        updatedVel[post.id] = vel

        // High performance rendering: update DOM element style directly
        const el = cardRefs.current[post.id]
        if (el) {
          el.style.left = `${pos.x}%`
          el.style.top = `${pos.y}%`
        }
      })

      positionsRef.current = updatedPos
      velocitiesRef.current = updatedVel

      // Continue animating as long as notes are moving or active tools are affecting them
      if (hasMotion || currentTool === 'magnet' || currentTool === 'tornado' || bombCountdown !== null) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics)
      } else {
        isSimulating.current = false
        // Write final resting positions to React state and persist to localStorage
        setPositions({ ...positionsRef.current })
        localStorage.setItem('cft_post_positions_v2', JSON.stringify(positionsRef.current))
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePhysics)
  }

  // Helpers to update both React state and Refs for physics loop synchronization
  const changeActiveTool = (tool: 'bomb' | 'magnet' | 'tornado' | null) => {
    setActiveTool(tool)
    activeToolRef.current = tool
  }

  const changeToolPos = (pos: { x: number; y: number } | null) => {
    setToolPos(pos)
    toolPosRef.current = pos
  }

  // ─── Tool Drag Handlers ──────────────────────────────────────────────────────
  const handleToolPointerDown = (e: React.PointerEvent, tool: 'bomb' | 'magnet' | 'tornado') => {
    e.preventDefault()
    
    // Stop any existing simulation or animations
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    isSimulating.current = false

    changeActiveTool(tool)
    setIsDraggingTool(true)

    // Calculate canvas-relative coordinates
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      changeToolPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
    }

    const element = e.currentTarget as HTMLElement
    element.setPointerCapture(e.pointerId)
  }

  const handleToolPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTool || !activeToolRef.current || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const currentPos = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
    
    changeToolPos(currentPos)

    // If magnet/tornado, start physics simulation
    if (activeToolRef.current === 'magnet' || activeToolRef.current === 'tornado') {
      startPhysicsLoop()
    }
  }

  const handleToolPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingTool) return
    setIsDraggingTool(false)

    const element = e.currentTarget as HTMLElement
    try {
      element.releasePointerCapture(e.pointerId)
    } catch (err) {}

    const currentTool = activeToolRef.current
    const currentToolPos = toolPosRef.current

    if (currentTool === 'bomb' && currentToolPos) {
      // Place the bomb on the board
      setBombLocation(currentToolPos)
      bombLocationRef.current = currentToolPos
      setBombCountdown(3)

      let timer = 3
      const countdownInterval = setInterval(() => {
        timer -= 1
        setBombCountdown(timer)
        if (timer <= 0) {
          clearInterval(countdownInterval)
          
          // BOOM!
          setBombCountdown(null)
          setShowExplosion(true)
          setShakeCanvas(true)

          const bombLoc = bombLocationRef.current || currentToolPos
          activePosts.forEach(post => {
            const pos = positionsRef.current[post.id] || { x: 30, y: 30 }
            const vel = velocitiesRef.current[post.id] || { vx: 0, vy: 0 }
            
            const dx = pos.x - bombLoc.x
            const dy = pos.y - bombLoc.y
            const dist = Math.hypot(dx, dy) || 1
            
            // Blast force is inversely proportional to distance (with a cap)
            const force = Math.min(30, 160 / (dist + 6))
            
            vel.vx = (dx / dist) * force + (Math.random() * 4 - 2)
            vel.vy = (dy / dist) * force + (Math.random() * 4 - 2)
            
            velocitiesRef.current[post.id] = vel
          })

          startPhysicsLoop()

          // Shake / explosion visual timing
          setTimeout(() => {
            setShowExplosion(false)
            setShakeCanvas(false)
            setBombLocation(null)
            bombLocationRef.current = null
          }, 600)
        }
      }, 1000)

      changeActiveTool(null)
      changeToolPos(null)
    } else {
      // Magnet and tornado slide back to place, notes glide on ice
      const releaseLoc = currentToolPos || { x: 50, y: 50 }
      
      activePosts.forEach(post => {
        const pos = positionsRef.current[post.id] || { x: 30, y: 30 }
        const vel = velocitiesRef.current[post.id] || { vx: 0, vy: 0 }
        
        const dx = pos.x - releaseLoc.x
        const dy = pos.y - releaseLoc.y
        const dist = Math.hypot(dx, dy) || 1
        
        // Outward scatter force (adds beautiful glide momentum)
        const force = Math.random() * 10 + 6
        vel.vx = (dx / dist) * force + (Math.random() * 4 - 2)
        vel.vy = (dy / dist) * force + (Math.random() * 4 - 2)
        
        velocitiesRef.current[post.id] = vel
      })
      
      changeActiveTool(null)
      changeToolPos(null)
      startPhysicsLoop()
    }
  }

  const handleToggleTool = (tool: 'magnet' | 'tornado') => {
    // If the selected tool is already active, turn it off and scatter notes outwards
    if (activeToolRef.current === tool) {
      const releaseLoc = toolPosRef.current || { x: 50, y: 50 }
      activePosts.forEach(post => {
        const pos = positionsRef.current[post.id] || { x: 30, y: 30 }
        const vel = velocitiesRef.current[post.id] || { vx: 0, vy: 0 }
        
        const dx = pos.x - releaseLoc.x
        const dy = pos.y - releaseLoc.y
        const dist = Math.hypot(dx, dy) || 1
        
        const force = Math.random() * 12 + 8
        vel.vx = (dx / dist) * force + (Math.random() * 4 - 2)
        vel.vy = (dy / dist) * force + (Math.random() * 4 - 2)
        
        velocitiesRef.current[post.id] = vel
      })
      
      changeActiveTool(null)
      changeToolPos(null)
      startPhysicsLoop()
    } else {
      // Activate the toggle follow-mode tool, start at center coordinates
      changeActiveTool(tool)
      changeToolPos({ x: 50, y: 50 })
      startPhysicsLoop()
    }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return
    
    // Only track cursor for magnet/tornado if active and NOT dragging a tool
    if ((activeToolRef.current === 'magnet' || activeToolRef.current === 'tornado') && !isDraggingTool) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      const currentPos = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
      changeToolPos(currentPos)
      startPhysicsLoop()
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If magnet or tornado is active, clicking the canvas deactivates it and triggers the scatter kick
    if ((activeToolRef.current === 'magnet' || activeToolRef.current === 'tornado') && !isDraggingTool) {
      e.stopPropagation()
      
      const releaseLoc = toolPosRef.current || { x: 50, y: 50 }
      activePosts.forEach(post => {
        const pos = positionsRef.current[post.id] || { x: 30, y: 30 }
        const vel = velocitiesRef.current[post.id] || { vx: 0, vy: 0 }
        
        const dx = pos.x - releaseLoc.x
        const dy = pos.y - releaseLoc.y
        const dist = Math.hypot(dx, dy) || 1
        
        // Outward scatter force
        const force = Math.random() * 12 + 8
        vel.vx = (dx / dist) * force + (Math.random() * 4 - 2)
        vel.vy = (dy / dist) * force + (Math.random() * 4 - 2)
        
        velocitiesRef.current[post.id] = vel
      })
      
      changeActiveTool(null)
      changeToolPos(null)
      startPhysicsLoop()
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Freedom Wall</h2>
          <p className="text-xs text-muted-foreground">Share your thoughts, suggestions, or comments anonymously.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-full border border-border/40 text-[11px] font-semibold">
            <button
              onClick={() => setViewMode('scatter')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                viewMode === 'scatter' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🍃 Scatter
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🗂️ Grid
            </button>
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

      {/* Main Freedom Wall Canvas / Grid Rendering */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-bold text-foreground mt-1">The Wall is Empty</h3>
          <p className="text-xs text-muted-foreground mt-1">Be the first to post something on the wall!</p>
        </div>
      ) : viewMode === 'scatter' ? (
        <div
          ref={canvasRef}
          onPointerMove={handleCanvasPointerMove}
          onClick={handleCanvasClick}
          className={`relative w-full h-[650px] bg-sky-200 dark:bg-slate-950 rounded-3xl overflow-hidden border border-border/60 shadow-inner select-none cursor-grab active:cursor-grabbing bg-cover bg-center transition-all duration-1000 bg-[url('/sky/daytime.png')] dark:bg-[url('/sky/nighttime.png')] ${
            shakeCanvas ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''
          } ${
            (activeDragId !== null || activeTool !== null || isDraggingTool) ? 'touch-none' : ''
          }`}
          style={
            activeBackground !== 'sky'
              ? {
                  backgroundImage: `url(${BACKGROUND_GIFS[activeBackground]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : {}
          }
        >
          {/* Custom style animations inside the component for portability */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shake {
              0%, 100% { transform: translate(0, 0); }
              10%, 30%, 50%, 70%, 90% { transform: translate(-3px, -1px); }
              20%, 40%, 60%, 80% { transform: translate(3px, 1px); }
            }
            @keyframes explosion {
              0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; filter: brightness(1.5); }
              50% { opacity: 0.9; }
              100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
            }
          `}} />

          {activePosts.map(post => {
            const theme = getPostTheme(post.color)
            const isBlue = post.color === 'blue'
            const pos = positions[post.id] || { x: 30, y: 30 }
            const isDragging = activeDragId === post.id
            const angle = (post.id % 13) - 6 // -6deg to +6deg deterministic rotation
            const zIndex = highestZIndexes[post.id] || 2

            // Count reactions locally to show as a small aggregate summary badge
            const reactions = loadAllReactions()[post.id] || {}
            const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0)
            const reactionEmojis = Object.keys(reactions).filter(k => reactions[k] > 0).slice(0, 3)

            const innerCardContent = (
              <>
                {theme.bgDecor}
                {/* Officer Delete */}
                {isOfficer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePost(post.id)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-destructive/20 hover:text-destructive size-5 rounded-full flex items-center justify-center transition-opacity cursor-pointer z-10"
                    title="Delete post"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                
                {/* Content */}
                <div className="text-[10px] sm:text-xs font-medium leading-normal break-words line-clamp-3 pr-2 flex-1 mt-1 font-sans cursor-zoom-in">
                  {post.content}
                </div>

                {/* Song artwork preview directly on the note */}
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

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[8px] sm:text-[9px] opacity-75">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-bold truncate max-w-[65px]">{post.author_name}</span>
                    {post.song && <Music className="h-2.5 w-2.5 text-primary shrink-0" />}
                  </div>
                  
                  {/* Inline reaction badge to avoid overflow clipping */}
                  {totalReactions > 0 && (
                    <div className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-0.5 select-none shrink-0 border border-black/5 dark:border-white/5">
                      <span>{reactionEmojis.slice(0, 1).join('')}</span>
                      <span className="opacity-90">{totalReactions}</span>
                    </div>
                  )}
                </div>
              </>
            )

            return (
              <div
                key={post.id}
                ref={el => { cardRefs.current[post.id] = el }}
                onPointerDown={e => {
                  e.stopPropagation()
                  handlePointerDown(e, post.id)
                }}
                onPointerMove={e => handlePointerMove(e, post.id)}
                onPointerUp={e => handlePointerUp(e, post.id)}
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  zIndex: zIndex,
                  transform: isDragging
                    ? 'scale(1.08) rotate(0deg)'
                    : `rotate(${angle}deg)`,
                  transition: isDragging ? 'transform 100ms ease, z-index 100ms ease' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  touchAction: 'none'
                }}
                className="w-32 sm:w-40 min-h-[110px] sm:min-h-[130px] flex flex-col p-0.5 group cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-300"
              >
                {/* Visual Template Frame */}
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
              </div>
            )
          })}

          {/* Floating drag/follow preview tool */}
          {activeTool && toolPos && (
            <div
              style={{
                position: 'absolute',
                left: `${toolPos.x}%`,
                top: `${toolPos.y}%`,
                transform: 'translate(-50%, -50%) scale(1.4)',
                zIndex: 500,
                pointerEvents: 'none'
              }}
              className="text-4xl select-none pointer-events-none"
            >
              {activeTool === 'bomb' ? '💣' : activeTool === 'magnet' ? '🧲' : '🌪️'}
            </div>
          )}

          {/* Dropped bomb countdown display */}
          {bombLocation && bombCountdown !== null && (
            <div
              style={{
                position: 'absolute',
                left: `${bombLocation.x}%`,
                top: `${bombLocation.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 400
              }}
              className="flex flex-col items-center justify-center pointer-events-none select-none"
            >
              <div className="text-4xl animate-bounce">💣</div>
              <div className="bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow border border-white/20 animate-pulse mt-1">
                {bombCountdown}s
              </div>
            </div>
          )}

          {/* Explosion ring visual overlay */}
          {showExplosion && bombLocation && (
            <div
              style={{
                position: 'absolute',
                left: `${bombLocation.x}%`,
                top: `${bombLocation.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 450
              }}
              className="w-44 h-44 rounded-full bg-radial from-amber-500/80 via-orange-500/40 to-transparent animate-[explosion_0.6s_ease-out_forwards] pointer-events-none"
            />
          )}

          {/* Physics Sandbox Hotbar Toolbox */}
          <div 
            onPointerDown={e => e.stopPropagation()} 
            onClick={e => e.stopPropagation()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xl dark:shadow-2xl z-20 backdrop-blur-md text-[11px] font-sans pointer-events-auto transition-all duration-300"
          >
            <span className="font-bold text-slate-500 dark:text-zinc-400 mr-1 hidden sm:inline">
              {activeTool === 'magnet' || activeTool === 'tornado'
                ? '✨ Click canvas to release:'
                : '🕹️ Sandbox tools:'}
            </span>
            
            {/* Bomb Button */}
            <button
              onPointerDown={e => {
                if (bombLocation !== null) return
                handleToolPointerDown(e, 'bomb')
              }}
              onPointerMove={handleToolPointerMove}
              onPointerUp={handleToolPointerUp}
              disabled={bombLocation !== null}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/40 px-2.5 py-1 rounded-xl transition-all cursor-grab active:cursor-grabbing disabled:opacity-40 disabled:cursor-not-allowed font-semibold press-spring text-[10px] select-none touch-action-none"
              title="Drag bomb on board to blow up notes"
            >
              <span>💣</span> <span>Bomb</span>
            </button>

            {/* Magnet Toggle Button */}
            <button
              onClick={() => handleToggleTool('magnet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all font-semibold press-spring text-[10px] select-none border cursor-pointer ${
                activeTool === 'magnet'
                  ? 'ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-400'
                  : 'bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40'
              }`}
              title="Click to toggle Magnet follow mode"
            >
              <span>🧲</span> <span>Magnet</span>
            </button>

            {/* Tornado Toggle Button */}
            <button
              onClick={() => handleToggleTool('tornado')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all font-semibold press-spring text-[10px] select-none border cursor-pointer ${
                activeTool === 'tornado'
                  ? 'ring-2 ring-cyan-500 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-400'
                  : 'bg-cyan-50 hover:bg-cyan-100/80 dark:bg-cyan-950/20 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/40'
              }`}
              title="Click to toggle Tornado follow mode"
            >
              <span>🌪️</span> <span>Tornado</span>
            </button>
          </div>

          {/* Settings Cog Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSettings(!showSettings)
            }}
            className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 size-8 rounded-full flex items-center justify-center shadow-md z-20 transition-all duration-300 press-spring cursor-pointer"
            title="Canvas Background Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Settings Dropdown Box */}
          {showSettings && (
            <div 
              className="absolute top-14 right-4 bg-white/95 dark:bg-zinc-900/95 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl dark:shadow-2xl z-30 backdrop-blur-md text-[11px] font-sans w-56 flex flex-col gap-3.5 anim-fade-in pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                <span className="font-bold text-xs">Canvas Settings ⚙️</span>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="text-muted-foreground hover:text-foreground text-[10px] font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Background Choice */}
              <div className="flex flex-col gap-1.5 text-left">
                <span className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Live Background:</span>
                <select 
                  value={activeBackground} 
                  onChange={e => setActiveBackground(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none cursor-pointer text-slate-800 dark:text-zinc-100"
                >
                  <option value="sky">🌅 Default Sky Image</option>
                  <option value="live1">📺 Live Backdrop 1</option>
                  <option value="live2">📺 Live Backdrop 2</option>
                  <option value="live3">📺 Live Backdrop 3</option>
                  <option value="live4">📺 Live Background 4</option>
                  <option value="live5">📺 Live Background 5</option>
                </select>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Classic Grid Mode with Visual Templates */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {posts.map(post => {
            const theme = getPostTheme(post.color)
            const isBlue = post.color === 'blue'
            const dateStr = post.created_at
              ? new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })
              : 'Just now'
            const angle = (post.id % 7) - 3

            const contentNode = (
              <div className="p-4 flex-1 flex flex-col relative h-full">
                {theme.bgDecor}
                {/* Officer Delete */}
                {isOfficer && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-destructive/20 hover:text-destructive size-6 rounded-full flex items-center justify-center transition-opacity cursor-pointer z-10"
                    title="Delete post"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Content */}
                <div 
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (!target.closest('button')) {
                      handleNoteClick(post.id, e.currentTarget.closest('.grid-card') as HTMLElement)
                    }
                  }}
                  className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap pr-5 flex-1 cursor-zoom-in mt-1"
                >
                  {post.content}
                </div>

                {/* Song Mini Player */}
                {post.song && <SongMiniPlayer song={post.song} />}

                {/* Footer */}
                <div className="flex flex-col gap-0.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                  <span className="font-bold truncate flex items-center gap-1">
                    <PenSquare className="h-3 w-3 text-muted-foreground" />
                    <span>{post.author_name}</span>
                  </span>
                  <span className="text-[9px] opacity-60">{dateStr}</span>
                </div>

                {/* Reactions */}
                <PostReactions postId={post.id} colorKey={post.color} user={user} />
              </div>
            )

            return (
              <div
                key={post.id}
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
          })}
        </div>
      )}

      {/* ─── Zoom Overlay Modal using Portal ───────────────────────────────────── */}
      {mounted && focusedPostId !== null && (() => {
        const post = posts.find(p => p.id === focusedPostId)
        if (!post) return null

        const theme = getPostTheme(post.color)
        const isBlue = post.color === 'blue'
        const dateStr = post.created_at
          ? new Date(post.created_at).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })
          : 'Just now'
        const isPostcard = post.color === 'purple'

        return createPortal(
          <>
            {/* Backdrop */}
            <div
              onClick={closeZoom}
              className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] transition-opacity duration-400 ${
                isZoomed ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Note zooming container */}
            <div
              style={zoomStyle}
              className="z-[9999] overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className={`${theme.cardClass} h-full w-full flex flex-col`}>
                {/* Close button */}
                <button
                  onClick={closeZoom}
                  className="absolute top-3 right-3 text-current/60 hover:text-current hover:bg-current/10 size-7 rounded-full flex items-center justify-center transition-colors cursor-pointer z-[10001]"
                  title="Close note"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Main zoomed note render */}
                <div className={`${isBlue ? theme.innerClass + ' p-5 sm:p-6' : 'p-5 sm:p-6'} flex-1 flex flex-col h-full justify-between relative`}>
                  {theme.bgDecor}

                  {isPostcard ? (
                    /* Postcard Zoom: Split view Layout (Message left / Details right) */
                    <div className="grid grid-cols-5 gap-4 flex-1 h-full pt-4 text-violet-950 dark:text-violet-100">
                      {/* Left Side: Message */}
                      <div className="col-span-3 border-r border-violet-200 dark:border-violet-800/80 pr-4 flex flex-col justify-between h-full">
                        <div className="text-xs sm:text-sm font-medium leading-relaxed break-words whitespace-pre-wrap flex-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                          {post.content}
                        </div>
                        {post.song && <SongMiniPlayer song={post.song} />}
                      </div>

                      {/* Right Side: Address & Emojis */}
                      <div className="col-span-2 pl-2 flex flex-col justify-between h-full">
                        <div className="flex flex-col gap-1 text-violet-900 dark:text-violet-200 text-xs">
                          <div className="flex items-center gap-1 font-bold">
                            <PenSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[100px]">{post.author_name}</span>
                          </div>
                          <span className="text-[10px] opacity-60">{dateStr}</span>
                          
                          {/* Vintage Postcard Details */}
                          <div className="mt-4 border-t border-violet-300 dark:border-violet-700/60 pt-2 flex flex-col gap-1.5 opacity-80 select-none">
                            <div className="text-[8px] uppercase tracking-wider font-semibold opacity-60">To Address:</div>
                            <div className="border-b border-violet-300 dark:border-violet-700/60 pb-1 text-[10px] font-mono italic truncate">BSIS 201 Section Hub</div>
                            <div className="border-b border-violet-300 dark:border-violet-700/60 pb-1 text-[10px] font-mono italic truncate">Room: transparency-wall</div>
                          </div>
                        </div>

                        {/* Reactions directly inside postcard right column */}
                        <div className="mt-2.5">
                          <PostReactions postId={post.id} colorKey={post.color} user={user} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Other Visual Templates Zoom Layout: Standard flow */
                    <div className="flex flex-col justify-between h-full pt-4 flex-1">
                      <div>
                        {/* Note badge */}
                        <span className="inline-block text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-current/10 opacity-70 mb-3">
                          {theme.badge}
                        </span>
                        
                        <div className="text-xs sm:text-sm font-medium leading-relaxed break-words whitespace-pre-wrap max-h-[160px] overflow-y-auto custom-scrollbar">
                          {post.content}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        {post.song && <SongMiniPlayer song={post.song} />}

                        {/* Footer & Reactions */}
                        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <PenSquare className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{post.author_name}</span>
                            </span>
                            <span className="text-[10px] opacity-60 mt-0.5">{dateStr}</span>
                          </div>
                          
                          {/* Reactions aligned to right */}
                          <div className="w-1/2 flex justify-end">
                            <PostReactions postId={post.id} colorKey={post.color} user={user} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      })()}
    </div>
  )
}
