'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { addPostAction, deletePostAction } from '@/app/officer-dashboard/actions'
import { AlertTriangle, PenSquare, X, FolderOpen } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import {
  FreedomPost,
  SongPreview,
  UserType,
  ToolType,
  Position,
  Velocity
} from './freedom-wall/types'
import {
  BACKGROUND_GIFS,
  getPostTheme,
  loadAllReactions
} from './freedom-wall/constants'
import { FreedomPostCard } from './freedom-wall/freedom-post-card'
import { PhysicsCanvas } from './freedom-wall/physics-canvas'
import { SongMiniPlayer } from './freedom-wall/song-mini-player'

// Dynamic imports for heavy components
const AddPostModal = dynamic(
  () => import('./freedom-wall/add-post-modal').then(m => m.AddPostModal),
  {
    loading: () => (
      <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center text-xs text-muted-foreground animate-pulse shadow-md">
        Loading note editor...
      </div>
    ),
    ssr: false
  }
)

const SandboxTools = dynamic(
  () => import('./freedom-wall/sandbox-tools').then(m => m.SandboxTools),
  {
    loading: () => (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl px-6 py-2 text-[10px] text-muted-foreground animate-pulse shadow-md">
        Loading sandbox tools...
      </div>
    ),
    ssr: false
  }
)

export type { FreedomPost, SongPreview }

interface FreedomWallProps {
  initialPosts: FreedomPost[]
  isOfficer: boolean
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
  user?: UserType | null
}

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

  const [posts, setPosts] = useState<FreedomPost[]>(initialPosts)
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
  const [positions, setPositions] = useState<Record<number, Position>>({})
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
  const positionsRef = useRef<Record<number, Position>>({})
  const velocitiesRef = useRef<Record<number, Velocity>>({})
  const isSimulating = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const bombLocationRef = useRef<Position | null>(null)
  const activeToolRef = useRef<ToolType>(null)
  const toolPosRef = useRef<Position | null>(null)
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const [activeTool, setActiveTool] = useState<ToolType>(null)
  const [toolPos, setToolPos] = useState<Position | null>(null)
  const [isDraggingTool, setIsDraggingTool] = useState(false)
  const [bombCountdown, setBombCountdown] = useState<number | null>(null)
  const [bombLocation, setBombLocation] = useState<Position | null>(null)
  const [shakeCanvas, setShakeCanvas] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)

  const dragStartRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const backgrounds: Array<'sky' | 'live1' | 'live2' | 'live3' | 'live4' | 'live5'> = ['sky', 'live1', 'live2', 'live3', 'live4', 'live5']
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    setActiveBackground(randomBg)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight })
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

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
      const postsWithSongs = initialPosts.map(p => ({
        ...p,
        song: p.song_data || p.song || null
      }))
      setPosts(postsWithSongs)
    }
  }, [initialPosts, dbError])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('cft_post_positions_v2')
      const savedPos = saved ? JSON.parse(saved) : {}
      
      const updated: Record<number, Position> = { ...savedPos }
      let changed = false
      
      activePosts.forEach(p => {
        if (!updated[p.id]) {
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
      } catch (err: unknown) {
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

  // ─── Drag Handlers ───────────────────────────────────────────────────────────
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

    positionsRef.current[postId] = { x: newX, y: newY }
    if (velocitiesRef.current[postId]) {
      velocitiesRef.current[postId] = { vx: 0, vy: 0 }
    }

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
      } catch {}

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
    setTimeout(() => {
      setIsZoomed(true)
    }, 25)
  }

  const closeZoom = () => {
    setIsZoomed(false)
    setTimeout(() => {
      setFocusedPostId(null)
      setFocusedRect(null)
    }, 400)
  }

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
    zIndex: 9999,
  } : {}

  // ─── Physics Loop ────────────────────────────────────────────────────────────
  const startPhysicsLoop = () => {
    if (isSimulating.current) return
    isSimulating.current = true

    const updatePhysics = () => {
      let hasMotion = false
      const damp = 0.94
      const limit = 0.05

      const updatedPos = { ...positionsRef.current }
      const updatedVel = { ...velocitiesRef.current }

      const currentTool = activeToolRef.current
      const currentToolPos = toolPosRef.current

      if (currentTool === 'magnet' && currentToolPos) {
        activePosts.forEach(post => {
          const pos = updatedPos[post.id] || { x: 30, y: 30 }
          const vel = updatedVel[post.id] || { vx: 0, vy: 0 }
          
          const dx = currentToolPos.x - pos.x
          const dy = currentToolPos.y - pos.y
          const dist = Math.hypot(dx, dy)
          
          if (dist > 1.0) {
            const pull = Math.min(0.8, dist * 0.025)
            vel.vx += (dx / dist) * pull
            vel.vy += (dy / dist) * pull
          } else {
            vel.vx *= 0.8
            vel.vy *= 0.8
          }
          updatedVel[post.id] = vel
        })
        hasMotion = true
      }

      if (currentTool === 'tornado' && currentToolPos) {
        activePosts.forEach(post => {
          const pos = updatedPos[post.id] || { x: 30, y: 30 }
          const vel = updatedVel[post.id] || { vx: 0, vy: 0 }
          
          const dx = currentToolPos.x - pos.x
          const dy = currentToolPos.y - pos.y
          const dist = Math.hypot(dx, dy)
          
          if (dist > 0.1) {
            const targetRadius = 5.0
            const radialDiff = dist - targetRadius
            const pull = radialDiff * 0.15
            const spin = 0.85
            
            const px = -dy
            const py = dx
            
            vel.vx += (dx / dist) * pull + (px / dist) * spin
            vel.vy += (dy / dist) * pull + (py / dist) * spin
          }
          updatedVel[post.id] = vel
        })
        hasMotion = true
      }

      const repulsionRadius = 14.0
      const repulsionStrength = 0.35
      
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
            const force = (repulsionRadius - dist) * repulsionStrength
            const forceX = (dx / dist) * force
            const forceY = (dy / dist) * force
            
            const velA = updatedVel[postA.id] || { vx: 0, vy: 0 }
            const velB = updatedVel[postB.id] || { vx: 0, vy: 0 }
            
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
        if (activeDragIdRef.current === post.id) return

        let pos = updatedPos[post.id] || { x: 30, y: 30 }
        let vel = updatedVel[post.id] || { vx: 0, vy: 0 }

        pos.x += vel.vx
        pos.y += vel.vy

        vel.vx *= damp
        vel.vy *= damp

        if (pos.x < 2) {
          pos.x = 2
          vel.vx = -vel.vx * 0.45
        }
        if (pos.x > 88) {
          pos.x = 88
          vel.vx = -vel.vx * 0.45
        }
        if (pos.y < 2) {
          pos.y = 2
          vel.vy = -vel.vy * 0.45
        }
        if (pos.y > 82) {
          pos.y = 82
          vel.vy = -vel.vy * 0.45
        }

        if (Math.abs(vel.vx) > limit || Math.abs(vel.vy) > limit) {
          hasMotion = true
        } else {
          vel.vx = 0
          vel.vy = 0
        }

        updatedPos[post.id] = pos
        updatedVel[post.id] = vel

        const el = cardRefs.current[post.id]
        if (el) {
          el.style.left = `${pos.x}%`
          el.style.top = `${pos.y}%`
        }
      })

      positionsRef.current = updatedPos
      velocitiesRef.current = updatedVel

      if (hasMotion || currentTool === 'magnet' || currentTool === 'tornado' || bombCountdown !== null) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics)
      } else {
        isSimulating.current = false
        setPositions({ ...positionsRef.current })
        localStorage.setItem('cft_post_positions_v2', JSON.stringify(positionsRef.current))
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePhysics)
  }

  const changeActiveTool = (tool: ToolType) => {
    setActiveTool(tool)
    activeToolRef.current = tool
  }

  const changeToolPos = (pos: Position | null) => {
    setToolPos(pos)
    toolPosRef.current = pos
  }

  const handleToolPointerDown = (e: React.PointerEvent, tool: 'bomb' | 'magnet' | 'tornado') => {
    e.preventDefault()
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    isSimulating.current = false

    changeActiveTool(tool)
    setIsDraggingTool(true)

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
    } catch {}

    const currentTool = activeToolRef.current
    const currentToolPos = toolPosRef.current

    if (currentTool === 'bomb' && currentToolPos) {
      setBombLocation(currentToolPos)
      bombLocationRef.current = currentToolPos
      setBombCountdown(3)

      let timer = 3
      const countdownInterval = setInterval(() => {
        timer -= 1
        setBombCountdown(timer)
        if (timer <= 0) {
          clearInterval(countdownInterval)
          
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
            
            const force = Math.min(30, 160 / (dist + 6))
            
            vel.vx = (dx / dist) * force + (Math.random() * 4 - 2)
            vel.vy = (dy / dist) * force + (Math.random() * 4 - 2)
            
            velocitiesRef.current[post.id] = vel
          })

          startPhysicsLoop()

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
      const releaseLoc = currentToolPos || { x: 50, y: 50 }
      
      activePosts.forEach(post => {
        const pos = positionsRef.current[post.id] || { x: 30, y: 30 }
        const vel = velocitiesRef.current[post.id] || { vx: 0, vy: 0 }
        
        const dx = pos.x - releaseLoc.x
        const dy = pos.y - releaseLoc.y
        const dist = Math.hypot(dx, dy) || 1
        
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
      changeActiveTool(tool)
      changeToolPos({ x: 50, y: 50 })
      startPhysicsLoop()
    }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return
    
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
    if ((activeToolRef.current === 'magnet' || activeToolRef.current === 'tornado') && !isDraggingTool) {
      e.stopPropagation()
      
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

      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive leading-5">
          {error}
        </div>
      )}

      {/* Dynamic Add Post Form */}
      {showAddForm && (
        <AddPostModal
          content={content}
          setContent={setContent}
          authorName={authorName}
          setAuthorName={setAuthorName}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSong={selectedSong}
          setSelectedSong={setSelectedSong}
          onSubmit={handleAddPost}
          onReset={resetForm}
          isPending={isPending}
        />
      )}

      {/* Main Canvas / Grid */}
      {posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-12 px-6 text-center shadow-sm flex flex-col items-center justify-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-bold text-foreground mt-1">The Wall is Empty</h3>
          <p className="text-xs text-muted-foreground mt-1">Be the first to post something on the wall!</p>
        </div>
      ) : viewMode === 'scatter' ? (
        <PhysicsCanvas
          canvasRef={canvasRef}
          cardRefs={cardRefs}
          activePosts={activePosts}
          isOfficer={isOfficer}
          user={user}
          activeBackground={activeBackground}
          backgroundGifs={BACKGROUND_GIFS}
          shakeCanvas={shakeCanvas}
          activeDragId={activeDragId}
          activeTool={activeTool}
          isDraggingTool={isDraggingTool}
          positions={positions}
          highestZIndexes={highestZIndexes}
          toolPos={toolPos}
          bombLocation={bombLocation}
          bombCountdown={bombCountdown}
          showExplosion={showExplosion}
          onCanvasPointerMove={handleCanvasPointerMove}
          onCanvasClick={handleCanvasClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDeletePost={handleDeletePost}
        >
          <SandboxTools
            activeTool={activeTool}
            bombLocation={bombLocation}
            onToolPointerDown={handleToolPointerDown}
            onToolPointerMove={handleToolPointerMove}
            onToolPointerUp={handleToolPointerUp}
            onToggleTool={handleToggleTool}
          />
        </PhysicsCanvas>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3.5">
          {posts.map(post => (
            <FreedomPostCard
              key={post.id}
              post={post}
              isOfficer={isOfficer}
              user={user}
              onDelete={handleDeletePost}
              onNoteClick={(id, el) => handleNoteClick(id, el)}
              mode="grid"
            />
          ))}
        </div>
      )}

      {/* ─── Zoom Overlay Modal ───────────────────────────────────── */}
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
            <div
              onClick={closeZoom}
              className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] transition-opacity duration-400 ${
                isZoomed ? 'opacity-100' : 'opacity-0'
              }`}
            />

            <div
              style={zoomStyle}
              className="z-[9999] overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className={`${theme.cardClass} h-full w-full flex flex-col`}>
                <button
                  onClick={closeZoom}
                  className="absolute top-3 right-3 text-current/60 hover:text-current hover:bg-current/10 size-7 rounded-full flex items-center justify-center transition-colors cursor-pointer z-[10001]"
                  title="Close note"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className={`${isBlue ? theme.innerClass + ' p-5 sm:p-6' : 'p-5 sm:p-6'} flex-1 flex flex-col h-full justify-between relative`}>
                  {theme.bgDecor}

                  {isPostcard ? (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 flex-1 h-full pt-4 text-violet-950 dark:text-violet-100 overflow-y-auto sm:overflow-y-visible">
                      <div className="col-span-1 sm:col-span-3 border-b sm:border-b-0 sm:border-r border-violet-200 dark:border-violet-800/80 pb-4 sm:pb-0 sm:pr-4 flex flex-col justify-between h-full">
                        <div className="text-xs sm:text-sm font-medium leading-relaxed break-words whitespace-pre-wrap flex-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                          {post.content}
                        </div>
                        {post.song && <SongMiniPlayer song={post.song} />}
                      </div>

                      <div className="col-span-1 sm:col-span-2 sm:pl-2 flex flex-col justify-between h-full">
                        <div className="flex flex-col gap-1 text-violet-900 dark:text-violet-200 text-xs">
                          <div className="flex items-center gap-1 font-bold">
                            <PenSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[140px] sm:max-w-[100px]">{post.author_name}</span>
                          </div>
                          <span className="text-[10px] opacity-60">{dateStr}</span>
                          
                          <div className="mt-4 border-t border-violet-300 dark:border-violet-700/60 pt-2 flex flex-col gap-1.5 opacity-80 select-none">
                            <div className="text-[8px] uppercase tracking-wider font-semibold opacity-60">To Address:</div>
                            <div className="border-b border-violet-300 dark:border-violet-700/60 pb-1 text-[10px] font-mono italic truncate">BSIS 201 Section Hub</div>
                            <div className="border-b border-violet-300 dark:border-violet-700/60 pb-1 text-[10px] font-mono italic truncate">Room: transparency-wall</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between h-full pt-4 flex-1">
                      <div>
                        <span className="inline-block text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-current/10 opacity-70 mb-3">
                          {theme.badge}
                        </span>
                        
                        <div className="text-xs sm:text-sm font-medium leading-relaxed break-words whitespace-pre-wrap max-h-[160px] overflow-y-auto custom-scrollbar">
                          {post.content}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        {post.song && <SongMiniPlayer song={post.song} />}

                        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <PenSquare className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{post.author_name}</span>
                            </span>
                            <span className="text-[10px] opacity-60 mt-0.5">{dateStr}</span>
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
