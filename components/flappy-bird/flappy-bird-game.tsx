'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  playFlapSound,
  playFlappyScoreSound,
  playHitSound,
  playDieSound,
  playSwooshSound
} from '@/lib/sound'
import {
  getFlappyLeaderboardAction,
  submitFlappyScoreAction,
  updateFlappyPlayerNameAction,
  getFlappyPlayerNameAction,
  fixMisplacedZenScoreAction,
  clearFlappyLeaderboardAction,
  LeaderboardEntry
} from '@/app/flappy-bird/actions'
import { supabase } from '@/lib/supabase'

import { UsernameModal } from './username-modal'
import { LeaderboardModal } from './leaderboard-modal'
import {
  ArrowLeft,
  Trophy,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Flame,
  Sparkles,
  Gamepad2,
  Award,
  Home,
  Shuffle,
  Sun,
  Moon,
  Waves,
  TreePine,
  Globe
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export type ThemeId = 'farm' | 'night' | 'sunset' | 'ocean'

export interface ThemeOption {
  id: ThemeId
  name: string
}

const THEMES: ThemeOption[] = [
  { id: 'farm', name: 'Classic Farm' },
  { id: 'night', name: 'Cyberpunk Night' },
  { id: 'sunset', name: 'Desert Sunset' },
  { id: 'ocean', name: 'Deep Ocean' }
]

const MULTIVERSE_VIDEOS = [
  '/multiverse/ssstik.io_1784846702443.mp4',
  '/multiverse/ssstik.io_@_caileng_1784846852587.mp4',
  '/multiverse/ssstik.io_@_japhette__1784846645457.mp4',
  '/multiverse/ssstik.io_@aveiw._.__1784846730994.mp4',
  '/multiverse/ssstik.io_@blossom_of_shadow_edit_1784846512468.mp4',
  '/multiverse/ssstik.io_@h0361238_1784846968392.mp4',
  '/multiverse/ssstik.io_@javajavijoo_1784846816701.mp4',
  '/multiverse/ssstik.io_@lu.seno_1784846888872.mp4',
  '/multiverse/ssstik.io_@moonlitblues__1784846798057.mp4',
  '/multiverse/ssstik.io_@paindevie26_1784846777168.mp4',
  '/multiverse/ssstik.io_@syrelcalampiano00_1784846942159.mp4',
  '/multiverse/ssstik.io_@unknown.man6913_1784846981285.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846436976.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846542812.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846680171.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846786537.mp4',
  '/multiverse/ssstik.io_@whos_leyyyy_1784846666515.mp4',
  '/multiverse/ssstik.io_@zy_mxc_1784846590404.mp4'
]

const DOGGIE_GIFS = [
  '/akosidogie/akosidogie.gif',
  '/akosidogie/batute-akosidogie.gif',
  '/akosidogie/dogietankbuild.gif',
  '/akosidogie/dsasadas.gif',
  '/akosidogie/meme-excitement.gif',
  '/akosidogie/puwede.gif',
  '/akosidogie/shelo-akosidogie.gif',
  '/akosidogie/shh-akosidogie.gif'
]

interface FlappyBirdGameProps {
  user: any
}

interface Pipe {
  x: number
  topHeight: number
  bottomHeight: number
  passed: boolean
  skin?: 'farm' | 'night' | 'sunset' | 'ocean' | 'gold' | 'void' | 'sakura' | 'rainbow'
}

export function FlappyBirdGame({ user }: FlappyBirdGameProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Game Mode: 'classic' (Original 90px gap) | 'zen' (Relaxing 160px gap) | 'multiverse' (Sadness Multiverse video bg)
  const [gameMode, setGameMode] = useState<'classic' | 'zen' | 'multiverse'>('classic')

  // Theme state: 'farm' | 'night' | 'sunset' | 'ocean'
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('farm')

  // Game States
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE')
  const [score, setScore] = useState(0)

  // Personal Bests across modes
  const [highScoreClassic, setHighScoreClassic] = useState(0)
  const [highScoreZen, setHighScoreZen] = useState(0)
  const [highScoreMultiverse, setHighScoreMultiverse] = useState(0)

  const [soundEnabled, setSoundEnabled] = useState(true)

  // Online / Offline Status
  const [syncMode, setSyncMode] = useState<'online' | 'offline'>('online')

  // User & Handle state
  const [playerName, setPlayerName] = useState('')
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false)

  // Leaderboard modal state & active tab
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [leaderboardTab, setLeaderboardTab] = useState<'classic' | 'zen' | 'multiverse'>('classic')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false)
  const fetchLeaderboardReqIdRef = useRef(0)

  // Multiverse background video crossfade dual-slot state
  const [videoSrcA, setVideoSrcA] = useState<string>('')
  const [videoSrcB, setVideoSrcB] = useState<string>('')
  const [activeVideoSlot, setActiveVideoSlot] = useState<'A' | 'B'>('A')
  const videoRefA = useRef<HTMLVideoElement | null>(null)
  const videoRefB = useRef<HTMLVideoElement | null>(null)
  const isVideoTransitioningRef = useRef(false)
  const lastVideoIndexRef = useRef<number>(-1)

  // Doggie Easter Egg Pop-up state
  const [doggiePop, setDoggiePop] = useState<{
    src: string
    effect: 'zoom' | 'fade'
    id: number
  } | null>(null)

  // Floating score flash
  const [scoreFlash, setScoreFlash] = useState(false)

  // Image assets cache
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({})
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Preload visual assets
  useEffect(() => {
    const assetSources: { [key: string]: string } = {
      bg: '/flappy/img/bg.png',
      rotor: '/flappy/img/rotor.png',
      pipe: '/flappy/img/pipe_green.png',
      land: '/flappy/img/land_0.png',
      bird0: '/flappy/img/bird_0.png',
      bird1: '/flappy/img/bird_1.png',
      bird2: '/flappy/img/bird_2.png',
      getReady: '/flappy/img/getReady.png',
      gameOver: '/flappy/img/gameOver.png'
    }

    let loadedCount = 0
    const totalAssets = Object.keys(assetSources).length

    Object.entries(assetSources).forEach(([key, src]) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imagesRef.current[key] = img
        loadedCount++
        if (loadedCount >= totalAssets) {
          setImagesLoaded(true)
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount >= totalAssets) {
          setImagesLoaded(true)
        }
      }
    })
  }, [])

  // Initialize Player Name & Personal Bests from localStorage / Supabase User Account
  useEffect(() => {
    const syncAccountName = async () => {
      if (user) {
        const res = await getFlappyPlayerNameAction()
        if (res.success && res.playerName) {
          setPlayerName(res.playerName)
          if (typeof window !== 'undefined') {
            localStorage.setItem('cft_flappy_player_name', res.playerName)
          }
        } else if (typeof window !== 'undefined') {
          const savedName = localStorage.getItem('cft_flappy_player_name')
          if (savedName) {
            setPlayerName(savedName)
          } else if (user?.email) {
            const defaultName = user.email.split('@')[0]
            setPlayerName(defaultName)
            localStorage.setItem('cft_flappy_player_name', defaultName)
          }
        }
      } else if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('cft_flappy_player_name')
        if (savedName) {
          setPlayerName(savedName)
        } else {
          setPlayerName('Guest_' + Math.floor(1000 + Math.random() * 9000))
        }
      }

      if (typeof window !== 'undefined') {
        const savedClassic = localStorage.getItem('cft_flappy_high_score_classic') || localStorage.getItem('cft_flappy_high_score')
        if (savedClassic) {
          setHighScoreClassic(parseInt(savedClassic, 10))
        }

        const savedZen = localStorage.getItem('cft_flappy_high_score_zen')
        if (savedZen) {
          setHighScoreZen(parseInt(savedZen, 10))
        }

        const savedMultiverse = localStorage.getItem('cft_flappy_high_score_multiverse')
        if (savedMultiverse) {
          setHighScoreMultiverse(parseInt(savedMultiverse, 10))
        }
      }
    }

    syncAccountName()

    // Auto-fix any Zen score that was mistakenly recorded under classic mode during prior bug
    fixMisplacedZenScoreAction().then(() => {
      fetchLeaderboard(leaderboardTab)
    })

    const handleFocus = () => {
      syncAccountName()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  // Video Queueing & Playback Effects for Multiverse Mode
  const getRandomVideoIndex = () => {
    if (MULTIVERSE_VIDEOS.length <= 1) return 0
    let nextIdx = Math.floor(Math.random() * MULTIVERSE_VIDEOS.length)
    while (nextIdx === lastVideoIndexRef.current) {
      nextIdx = Math.floor(Math.random() * MULTIVERSE_VIDEOS.length)
    }
    lastVideoIndexRef.current = nextIdx
    return nextIdx
  }

  useEffect(() => {
    if (gameMode === 'multiverse' && gameState === 'PLAYING' && score >= 6) {
      if (!videoSrcA && !videoSrcB) {
        const idx = getRandomVideoIndex()
        setVideoSrcA(MULTIVERSE_VIDEOS[idx])
        setActiveVideoSlot('A')
      }
    }

    // USER REQUIREMENT: "if the user dies, stop the video and yeah reset the gameplay, go"
    if (gameState === 'GAMEOVER') {
      if (videoRefA.current) {
        videoRefA.current.pause()
        videoRefA.current.currentTime = 0
      }
      if (videoRefB.current) {
        videoRefB.current.pause()
        videoRefB.current.currentTime = 0
      }
      setVideoSrcA('')
      setVideoSrcB('')
    }
  }, [gameMode, gameState, score])

  useEffect(() => {
    if (gameMode !== 'multiverse' || gameState !== 'PLAYING') return

    if (activeVideoSlot === 'A' && videoRefA.current && videoSrcA) {
      videoRefA.current.play().catch(() => {})
    } else if (activeVideoSlot === 'B' && videoRefB.current && videoSrcB) {
      videoRefB.current.play().catch(() => {})
    }
  }, [activeVideoSlot, videoSrcA, videoSrcB, gameMode, gameState])

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (gameState !== 'PLAYING' || gameMode !== 'multiverse') return
    const videoEl = e.currentTarget
    if (!videoEl.duration || isVideoTransitioningRef.current) return

    if (videoEl.duration - videoEl.currentTime <= 1.5) {
      isVideoTransitioningRef.current = true
      const nextIdx = getRandomVideoIndex()
      const nextUrl = MULTIVERSE_VIDEOS[nextIdx]

      if (activeVideoSlot === 'A') {
        setVideoSrcB(nextUrl)
        setActiveVideoSlot('B')
      } else {
        setVideoSrcA(nextUrl)
        setActiveVideoSlot('A')
      }

      setTimeout(() => {
        isVideoTransitioningRef.current = false
      }, 1500)
    }
  }

  const handleVideoEnded = () => {
    if (gameState !== 'PLAYING' || gameMode !== 'multiverse') return
    if (isVideoTransitioningRef.current) return
    const nextIdx = getRandomVideoIndex()
    const nextUrl = MULTIVERSE_VIDEOS[nextIdx]

    if (activeVideoSlot === 'A') {
      setVideoSrcB(nextUrl)
      setActiveVideoSlot('B')
    } else {
      setVideoSrcA(nextUrl)
      setActiveVideoSlot('A')
    }
  }

  // Doggie Pop-Up Animation Timer for Multiverse Mode
  useEffect(() => {
    if (gameMode !== 'multiverse' || gameState !== 'PLAYING') {
      setDoggiePop(null)
      return
    }

    let timeoutId: NodeJS.Timeout

    const scheduleDoggie = () => {
      const delay = Math.floor(6000 + Math.random() * 6000)
      timeoutId = setTimeout(() => {
        if (gameState === 'PLAYING') {
          const randomDog = DOGGIE_GIFS[Math.floor(Math.random() * DOGGIE_GIFS.length)]
          const randomEffect = Math.random() > 0.5 ? 'zoom' : 'fade'
          setDoggiePop({
            src: randomDog,
            effect: randomEffect,
            id: Date.now()
          })

          setTimeout(() => {
            setDoggiePop(null)
            scheduleDoggie()
          }, 2800)
        }
      }, delay)
    }

    scheduleDoggie()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [gameMode, gameState])

  // Helper to pick a random theme excluding current theme
  const getRandomTheme = (excludeTheme?: ThemeId): ThemeId => {
    const options: ThemeId[] = ['farm', 'night', 'sunset', 'ocean']
    const filtered = options.filter(t => t !== (excludeTheme || currentTheme))
    return filtered[Math.floor(Math.random() * filtered.length)]
  }

  // Fetch Leaderboard for specific mode
  const fetchLeaderboard = async (modeToFetch: 'classic' | 'zen' | 'multiverse' = leaderboardTab) => {
    const currentReqId = ++fetchLeaderboardReqIdRef.current
    setIsLeaderboardLoading(true)

    try {
      const res = await getFlappyLeaderboardAction(modeToFetch)
      if (currentReqId !== fetchLeaderboardReqIdRef.current) return

      setSyncMode(res.mode)

      if (res.success && res.data.length > 0) {
        setLeaderboardData(res.data)
      } else {
        const localKey = modeToFetch === 'zen'
          ? 'cft_flappy_local_leaderboard_zen'
          : modeToFetch === 'multiverse'
          ? 'cft_flappy_local_leaderboard_multiverse'
          : 'cft_flappy_local_leaderboard_classic'
        const localScores = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null
        if (localScores) {
          try {
            setLeaderboardData(JSON.parse(localScores))
          } catch (e) {
            setLeaderboardData([])
          }
        } else {
          setLeaderboardData([])
        }
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e)
    } finally {
      if (currentReqId === fetchLeaderboardReqIdRef.current) {
        setIsLeaderboardLoading(false)
      }
    }
  }

  const handleLeaderboardTabChange = (tab: 'classic' | 'zen' | 'multiverse') => {
    if (tab === leaderboardTab && !isLeaderboardLoading) return
    setIsLeaderboardLoading(true)
    setLeaderboardTab(tab)
  }

  useEffect(() => {
    fetchLeaderboard(leaderboardTab)

    // Subscribe to real-time database updates for leaderboard scores & user profile updates
    const channel = supabase
      .channel('flappy_bird_scores_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flappy_bird_scores' },
        async () => {
          fetchLeaderboard(leaderboardTab)

          // Sync user's player name if changed on another device
          if (user) {
            const res = await getFlappyPlayerNameAction()
            if (res.success && res.playerName) {
              setPlayerName(res.playerName)
              if (typeof window !== 'undefined') {
                localStorage.setItem('cft_flappy_player_name', res.playerName)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leaderboardTab, user])

  const handleClearLeaderboard = async () => {
    await clearFlappyLeaderboardAction()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cft_flappy_local_leaderboard_classic')
      localStorage.removeItem('cft_flappy_local_leaderboard_zen')
      localStorage.removeItem('cft_flappy_local_leaderboard_multiverse')
    }
    setLeaderboardData([])
    await fetchLeaderboard(leaderboardTab)
  }


  // Handle score submission & deduplication
  const handleScoreSubmit = async (finalScore: number, modeToSubmit?: 'classic' | 'zen' | 'multiverse') => {
    if (finalScore <= 0) return

    const activeMode = modeToSubmit || stateRef.current.gameMode || gameMode

    const currentBest = activeMode === 'zen'
      ? highScoreZen
      : activeMode === 'multiverse'
      ? highScoreMultiverse
      : highScoreClassic

    if (finalScore > currentBest) {
      if (activeMode === 'zen') {
        setHighScoreZen(finalScore)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cft_flappy_high_score_zen', finalScore.toString())
        }
      } else if (activeMode === 'multiverse') {
        setHighScoreMultiverse(finalScore)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cft_flappy_high_score_multiverse', finalScore.toString())
        }
      } else {
        setHighScoreClassic(finalScore)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cft_flappy_high_score_classic', finalScore.toString())
          localStorage.setItem('cft_flappy_high_score', finalScore.toString())
        }
      }
    }

    const nameToUse = playerName || (user?.email ? user.email.split('@')[0] : 'Guest')
    const res = await submitFlappyScoreAction(nameToUse, finalScore, !user, activeMode)
    setSyncMode(res.mode)

    if (typeof window !== 'undefined') {
      const localKey = activeMode === 'zen'
        ? 'cft_flappy_local_leaderboard_zen'
        : activeMode === 'multiverse'
        ? 'cft_flappy_local_leaderboard_multiverse'
        : 'cft_flappy_local_leaderboard_classic'
      const existingStr = localStorage.getItem(localKey)
      let localList: LeaderboardEntry[] = []
      if (existingStr) {
        try { localList = JSON.parse(existingStr) } catch (e) {}
      }

      const normalizedName = nameToUse.trim().toLowerCase()
      const existingIndex = localList.findIndex(item =>
        (user && item.user_id === user.id) || (item.player_name || '').trim().toLowerCase() === normalizedName
      )

      if (existingIndex >= 0) {
        if (finalScore > localList[existingIndex].score) {
          localList[existingIndex].score = finalScore
          localList[existingIndex].player_name = nameToUse
          localList[existingIndex].created_at = new Date().toISOString()
        }
      } else {
        localList.push({
          player_name: nameToUse,
          score: finalScore,
          mode: activeMode,
          is_guest: !user,
          user_id: user ? user.id : null,
          created_at: new Date().toISOString()
        })
      }

      localList.sort((a, b) => b.score - a.score)
      localList = localList.slice(0, 15)
      localStorage.setItem(localKey, JSON.stringify(localList))

      if (res.mode === 'offline' && leaderboardTab === activeMode) {
        setLeaderboardData(localList)
      } else if (leaderboardTab === activeMode) {
        fetchLeaderboard(activeMode)
      }
    }
  }

  const handleScoreSubmitRef = useRef(handleScoreSubmit)
  useEffect(() => {
    handleScoreSubmitRef.current = handleScoreSubmit
  })

  // Ref for input throttling (preventing double clicks / double audio on mobile)
  const lastFlapTimeRef = useRef<number>(0)
  const lastTouchTimeRef = useRef<number>(0)
  const gameOverTimeRef = useRef<number>(0)
  const lastUiInteractTimeRef = useRef<number>(0)


  // Ref variables for the physics engine loop
  const stateRef = useRef({
    gameState: 'IDLE' as 'IDLE' | 'PLAYING' | 'GAMEOVER',
    gameMode: 'classic' as 'classic' | 'zen' | 'multiverse',
    theme: 'farm' as ThemeId,
    score: 0,
    birdY: 210,
    birdVelocity: 0,
    birdRotation: 0,
    wingFrame: 0,
    wingTimer: 0,
    pipes: [] as Pipe[],
    groundX: 0,
    rotorAngle: 0,
    lastPipeSpawnTime: 0,
    totalTime: 0
  })

  // Synchronize stateRef with React states
  useEffect(() => {
    stateRef.current.gameState = gameState
    stateRef.current.gameMode = gameMode
    stateRef.current.theme = currentTheme
  }, [gameState, gameMode, currentTheme])

  // Canvas Engine with Multi-Theme Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let lastTime = performance.now()

    // ── FELGOSDK PHYSICS PARAMETERS ──
    const GRAVITY = 950.0            // px/s²
    const GAMEOVER_GRAVITY = 2850.0  // px/s² (3x gravity when game over triggers)
    const FLAP_IMPULSE = -320.0      // px/s (instant impulse jump)
    const TERMINAL_VELOCITY = 520.0  // px/s downward velocity cap
    const SCROLL_SPEED = 150.0       // px/s horizontal scroll
    const BIRD_X = 100               // Static X position (~25% from left)
    const BIRD_HITBOX_RADIUS = 10    // Tight hitbox radius matching Felgo circle collider
    const GROUND_HEIGHT = 90         // Ground texture height

    // Reset Game parameters
    const resetGame = () => {
      const nextTheme = getRandomTheme(stateRef.current.theme)
      setCurrentTheme(nextTheme)

      stateRef.current = {
        gameState: 'IDLE',
        gameMode: stateRef.current.gameMode,
        theme: nextTheme,
        score: 0,
        birdY: canvas.height / 2 - 40,
        birdVelocity: 0,
        birdRotation: 0,
        wingFrame: 0,
        wingTimer: 0,
        pipes: [],
        groundX: 0,
        rotorAngle: 0,
        lastPipeSpawnTime: 0,
        totalTime: 0
      }
      setScore(0)
    }

    resetGame()

    // Main Delta-Time Animation Loop
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05) // Delta time capped at 50ms
      lastTime = time

      const state = stateRef.current
      state.totalTime += dt
      state.rotorAngle += 1.5 * dt // Windmill rotor rotation

      const width = canvas.width
      const height = canvas.height
      const currentPipeGap = state.gameMode === 'zen' ? 160 : state.gameMode === 'multiverse' ? 110 : 90
      const themeId = state.theme || 'farm'
      const isMultiverseVideoActive = state.gameMode === 'multiverse' && state.score >= 6

      ctx.clearRect(0, 0, width, height)

      // ── 1. MULTI-THEME / MULTIVERSE BACKGROUND RENDERING ──
      const bgImg = imagesRef.current.bg
      const rotorImg = imagesRef.current.rotor

      if (isMultiverseVideoActive) {
        // Transparent background lets HTML background video play behind canvas!
        // No solid fill needed here
      } else if (themeId === 'farm' && bgImg && bgImg.complete && bgImg.width > 0) {
        ctx.drawImage(bgImg, 0, 0, width, height - GROUND_HEIGHT)
        if (rotorImg && rotorImg.complete && rotorImg.width > 0) {
          ctx.save()
          const rx = width * 0.55
          const ry = (height - GROUND_HEIGHT) * 0.65
          ctx.translate(rx, ry)
          ctx.rotate(state.rotorAngle)
          ctx.drawImage(rotorImg, -rotorImg.width / 2, -rotorImg.height / 2)
          ctx.restore()
        }
      } else if (themeId === 'night') {
        // Midnight Cyberpunk Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT)
        skyGrad.addColorStop(0, '#030712')
        skyGrad.addColorStop(0.6, '#0f172a')
        skyGrad.addColorStop(1, '#1e1b4b')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)

        // Moon
        ctx.save()
        ctx.fillStyle = '#f1f5f9'
        ctx.shadowColor = '#e2e8f0'
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(width * 0.8, 65, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Twinkling Stars
        ctx.fillStyle = '#ffffff'
        const stars = [
          { x: 30, y: 40, r: 1.5 }, { x: 80, y: 120, r: 1 }, { x: 140, y: 30, r: 2 },
          { x: 220, y: 90, r: 1.2 }, { x: 310, y: 50, r: 1.8 }, { x: 360, y: 130, r: 1.5 }
        ]
        stars.forEach((star, i) => {
          const alpha = 0.5 + Math.sin(state.totalTime * 3 + i) * 0.5
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 1.0

        // City Skyline Silhouette
        ctx.fillStyle = '#090d16'
        const buildings = [
          { x: 0, w: 40, h: 70 }, { x: 40, w: 30, h: 100 }, { x: 70, w: 50, h: 60 },
          { x: 120, w: 35, h: 110 }, { x: 155, w: 45, h: 80 }, { x: 200, w: 30, h: 130 },
          { x: 230, w: 50, h: 75 }, { x: 280, w: 40, h: 105 }, { x: 320, w: 45, h: 65 },
          { x: 365, w: 35, h: 90 }
        ]
        const skyBase = height - GROUND_HEIGHT
        buildings.forEach(b => {
          ctx.fillRect(b.x, skyBase - b.h, b.w, b.h)
          ctx.fillStyle = '#00f0ff'
          ctx.globalAlpha = 0.6
          for (let wy = skyBase - b.h + 10; wy < skyBase - 10; wy += 15) {
            for (let wx = b.x + 6; wx < b.x + b.w - 8; wx += 10) {
              if ((wx + wy) % 3 === 0) {
                ctx.fillRect(wx, wy, 4, 6)
              }
            }
          }
          ctx.fillStyle = '#090d16'
          ctx.globalAlpha = 1.0
        })
      } else if (themeId === 'sunset') {
        // Desert Sunset Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT)
        skyGrad.addColorStop(0, '#451a03')
        skyGrad.addColorStop(0.4, '#7c2d12')
        skyGrad.addColorStop(0.75, '#c2410c')
        skyGrad.addColorStop(1, '#ea580c')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)

        // Setting Sun
        const sunY = (height - GROUND_HEIGHT) * 0.75
        const sunGrad = ctx.createRadialGradient(width * 0.5, sunY, 10, width * 0.5, sunY, 75)
        sunGrad.addColorStop(0, '#fef08a')
        sunGrad.addColorStop(0.35, '#f97316')
        sunGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = sunGrad
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)

        ctx.fillStyle = '#fef08a'
        ctx.beginPath()
        ctx.arc(width * 0.5, sunY, 26, 0, Math.PI * 2)
        ctx.fill()

        // Canyon Ridge Silhouette
        ctx.fillStyle = '#290b02'
        const skyBase = height - GROUND_HEIGHT
        ctx.beginPath()
        ctx.moveTo(-20, skyBase)
        ctx.lineTo(80, skyBase - 90)
        ctx.lineTo(180, skyBase)
        ctx.lineTo(260, skyBase - 120)
        ctx.lineTo(360, skyBase)
        ctx.lineTo(420, skyBase - 70)
        ctx.lineTo(440, skyBase)
        ctx.fill()
      } else if (themeId === 'ocean') {
        // Deep Ocean Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT)
        skyGrad.addColorStop(0, '#0c4a6e')
        skyGrad.addColorStop(0.55, '#0284c7')
        skyGrad.addColorStop(1, '#38bdf8')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)

        // Rising Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 1.5
        const bubbles = [
          { speed: 40, x: 40, size: 6, offset: 0 },
          { speed: 30, x: 110, size: 10, offset: 2 },
          { speed: 50, x: 190, size: 5, offset: 1 },
          { speed: 35, x: 270, size: 8, offset: 3 },
          { speed: 45, x: 350, size: 7, offset: 1.5 }
        ]
        const skyBase = height - GROUND_HEIGHT
        bubbles.forEach(b => {
          const by = skyBase - ((state.totalTime * b.speed + b.offset * 100) % (skyBase + 20))
          const bx = b.x + Math.sin(state.totalTime * 2 + b.offset) * 12
          ctx.beginPath()
          ctx.arc(bx, by, b.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        })

        // Sea Bed Ridge Silhouette
        ctx.fillStyle = '#032b45'
        ctx.beginPath()
        ctx.moveTo(0, skyBase)
        ctx.quadraticCurveTo(60, skyBase - 30, 120, skyBase)
        ctx.quadraticCurveTo(200, skyBase - 45, 280, skyBase)
        ctx.quadraticCurveTo(340, skyBase - 25, 400, skyBase)
        ctx.fill()
      } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT)
        skyGrad.addColorStop(0, '#4ec0ca')
        skyGrad.addColorStop(1, '#a0e0e6')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)
      }

      // ── 2. PIPES GENERATION & SCROLLING ──
      if (state.gameState === 'PLAYING') {
        state.lastPipeSpawnTime += dt
        const spawnInterval = state.gameMode === 'zen' ? 1.65 : 1.5
        if (state.lastPipeSpawnTime >= spawnInterval) {
          const minPipeTop = 40
          const maxPipeTop = height - GROUND_HEIGHT - currentPipeGap - 40
          const variation = (Math.random() - 0.5) * 130
          let topHeight = Math.floor((height - GROUND_HEIGHT - currentPipeGap) / 2 + variation)
          topHeight = Math.max(minPipeTop, Math.min(maxPipeTop, topHeight))

          const bottomHeight = height - GROUND_HEIGHT - (topHeight + currentPipeGap)

          const pipeSkins = ['farm', 'night', 'sunset', 'ocean', 'gold', 'void', 'sakura', 'rainbow'] as const
          const randomSkin = state.gameMode === 'multiverse'
            ? pipeSkins[Math.floor(Math.random() * pipeSkins.length)]
            : undefined

          state.pipes.push({
            x: width + 10,
            topHeight,
            bottomHeight,
            passed: false,
            skin: randomSkin
          })
          state.lastPipeSpawnTime = 0
        }

        state.pipes.forEach(pipe => {
          pipe.x -= SCROLL_SPEED * dt
        })

        state.pipes = state.pipes.filter(p => p.x > -80)
      }

      // ── RENDER PIPES MATCHING ACTIVE THEME / MULTIVERSE SKINS ──
      const pipeImg = imagesRef.current.pipe
      const pipeWidth = 52

      state.pipes.forEach(pipe => {
        const effectiveSkin = pipe.skin || themeId

        if (effectiveSkin === 'farm' && pipeImg && pipeImg.complete && pipeImg.width > 0 && state.gameMode !== 'multiverse') {
          // Top Pipe (Flipped)
          ctx.save()
          ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight)
          ctx.scale(1, -1)
          ctx.drawImage(pipeImg, -pipeWidth / 2, 0, pipeWidth, pipe.topHeight)
          ctx.restore()

          // Bottom Pipe
          const bottomY = height - GROUND_HEIGHT - pipe.bottomHeight
          ctx.drawImage(pipeImg, pipe.x, bottomY, pipeWidth, pipe.bottomHeight)
        } else {
          // Custom Procedural Pipe Styling per Skin / Theme
          const drawCustomPipe = (px: number, py: number, pw: number, ph: number, isTop: boolean, skinType: string) => {
            ctx.save()
            
            let bodyGrad: CanvasGradient
            let capColor = '#87e02b'
            let borderColor = '#2d5a0b'
            let highlightColor = 'rgba(255, 255, 255, 0.3)'

            if (skinType === 'night') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#0f172a')
              bodyGrad.addColorStop(0.5, '#1e293b')
              bodyGrad.addColorStop(1, '#0f172a')
              capColor = '#00f0ff'
              borderColor = '#ff007f'
              highlightColor = 'rgba(0, 240, 255, 0.4)'
              ctx.shadowColor = '#00f0ff'
              ctx.shadowBlur = 8
            } else if (skinType === 'sunset') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#7c2d12')
              bodyGrad.addColorStop(0.5, '#c2410c')
              bodyGrad.addColorStop(1, '#7c2d12')
              capColor = '#f97316'
              borderColor = '#451a03'
              highlightColor = 'rgba(254, 240, 138, 0.4)'
            } else if (skinType === 'ocean') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#0f766e')
              bodyGrad.addColorStop(0.5, '#0d9488')
              bodyGrad.addColorStop(1, '#0f766e')
              capColor = '#2dd4bf'
              borderColor = '#134e4a'
              highlightColor = 'rgba(153, 246, 228, 0.4)'
            } else if (skinType === 'gold') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#78350f')
              bodyGrad.addColorStop(0.3, '#fbbf24')
              bodyGrad.addColorStop(0.7, '#f59e0b')
              bodyGrad.addColorStop(1, '#78350f')
              capColor = '#fef08a'
              borderColor = '#b45309'
              highlightColor = 'rgba(255, 255, 255, 0.65)'
              ctx.shadowColor = '#fbbf24'
              ctx.shadowBlur = 10
            } else if (skinType === 'void') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#1e1b4b')
              bodyGrad.addColorStop(0.5, '#4c1d95')
              bodyGrad.addColorStop(1, '#1e1b4b')
              capColor = '#d946ef'
              borderColor = '#818cf8'
              highlightColor = 'rgba(217, 70, 239, 0.5)'
              ctx.shadowColor = '#d946ef'
              ctx.shadowBlur = 10
            } else if (skinType === 'sakura') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#831843')
              bodyGrad.addColorStop(0.5, '#f472b6')
              bodyGrad.addColorStop(1, '#831843')
              capColor = '#fbcfe8'
              borderColor = '#9d174d'
              highlightColor = 'rgba(255, 255, 255, 0.6)'
            } else if (skinType === 'rainbow') {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#ef4444')
              bodyGrad.addColorStop(0.25, '#eab308')
              bodyGrad.addColorStop(0.5, '#22c55e')
              bodyGrad.addColorStop(0.75, '#06b6d4')
              bodyGrad.addColorStop(1, '#a855f7')
              capColor = '#f43f5e'
              borderColor = '#ffffff'
              highlightColor = 'rgba(255, 255, 255, 0.7)'
              ctx.shadowColor = '#3b82f6'
              ctx.shadowBlur = 8
            } else {
              bodyGrad = ctx.createLinearGradient(px, 0, px + pw, 0)
              bodyGrad.addColorStop(0, '#53a018')
              bodyGrad.addColorStop(0.5, '#73bf2e')
              bodyGrad.addColorStop(1, '#53a018')
              capColor = '#87e02b'
              borderColor = '#2d5a0b'
            }

            // Pipe Body
            ctx.fillStyle = bodyGrad
            ctx.strokeStyle = borderColor
            ctx.lineWidth = 2.5
            ctx.fillRect(px, py, pw, ph)
            ctx.strokeRect(px, py, pw, ph)

            // Vertical Shine Line
            ctx.fillStyle = highlightColor
            ctx.fillRect(px + 6, py, 6, ph)

            // Pipe Rim Cap
            const capW = pw + 8
            const capH = 22
            const capX = px - 4
            const capY = isTop ? py + ph - capH : py

            ctx.fillStyle = capColor
            ctx.fillRect(capX, capY, capW, capH)
            ctx.strokeRect(capX, capY, capW, capH)

            ctx.fillStyle = highlightColor
            ctx.fillRect(capX + 6, capY, 6, capH)

            ctx.restore()
          }

          // Top pipe
          drawCustomPipe(pipe.x, 0, pipeWidth, pipe.topHeight, true, effectiveSkin)
          // Bottom pipe
          const bottomY = height - GROUND_HEIGHT - pipe.bottomHeight
          drawCustomPipe(pipe.x, bottomY, pipeWidth, pipe.bottomHeight, false, effectiveSkin)
        }
      })

      // ── 3. BIRD PHYSICS UPDATE ──
      if (state.gameState === 'PLAYING') {
        state.birdVelocity += GRAVITY * dt
        if (state.birdVelocity > TERMINAL_VELOCITY) {
          state.birdVelocity = TERMINAL_VELOCITY
        }

        state.birdY += state.birdVelocity * dt
        state.birdRotation = Math.min(Math.max((state.birdVelocity / 6.0), -25), 90)

        state.wingTimer += dt
        if (state.wingTimer > 0.08) {
          state.wingFrame = (state.wingFrame + 1) % 3
          state.wingTimer = 0
        }

        // Score Check
        state.pipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + pipeWidth / 2 < BIRD_X) {
            pipe.passed = true
            state.score += 1
            setScore(state.score)
            setScoreFlash(true)
            setTimeout(() => setScoreFlash(false), 200)

            if (soundEnabled) playFlappyScoreSound()
          }
        })

        // Collision Check
        const birdLeft = BIRD_X - BIRD_HITBOX_RADIUS
        const birdRight = BIRD_X + BIRD_HITBOX_RADIUS
        const birdTop = state.birdY - BIRD_HITBOX_RADIUS
        const birdBottom = state.birdY + BIRD_HITBOX_RADIUS

        // Ground Collision
        if (birdBottom >= height - GROUND_HEIGHT) {
          state.birdY = height - GROUND_HEIGHT - BIRD_HITBOX_RADIUS
          triggerGameOver()
        }

        // Ceiling Collision
        if (birdTop <= 0) {
          state.birdY = BIRD_HITBOX_RADIUS
          state.birdVelocity = 0
        }

        // Pipe Collision
        for (const pipe of state.pipes) {
          const pipeLeft = pipe.x
          const pipeRight = pipe.x + pipeWidth

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            const topPipeBottom = pipe.topHeight
            const bottomPipeTop = height - GROUND_HEIGHT - pipe.bottomHeight

            if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
              triggerGameOver()
              break
            }
          }
        }
      } else if (state.gameState === 'IDLE') {
        state.birdY = (canvas.height / 2 - 40) + Math.sin(state.totalTime * 4.0) * 10
        state.birdRotation = 0

        state.wingTimer += dt
        if (state.wingTimer > 0.15) {
          state.wingFrame = (state.wingFrame + 1) % 3
          state.wingTimer = 0
        }
      } else if (state.gameState === 'GAMEOVER') {
        if (state.birdY < height - GROUND_HEIGHT - BIRD_HITBOX_RADIUS) {
          state.birdVelocity += GAMEOVER_GRAVITY * dt
          state.birdY += state.birdVelocity * dt
          state.birdRotation = 90
        } else {
          state.birdY = height - GROUND_HEIGHT - BIRD_HITBOX_RADIUS
        }
      }

      function triggerGameOver() {
        gameOverTimeRef.current = performance.now()
        if (soundEnabled) {
          playHitSound()
          setTimeout(() => playDieSound(), 120)
        }
        state.gameState = 'GAMEOVER'
        setGameState('GAMEOVER')
        handleScoreSubmitRef.current(state.score, state.gameMode)
      }


      // ── 4. RENDER BIRD SPRITE ──
      ctx.save()
      ctx.translate(BIRD_X, state.birdY)
      ctx.rotate((state.birdRotation * Math.PI) / 180)

      const birdKey = `bird${state.wingFrame}` as 'bird0' | 'bird1' | 'bird2'
      const birdImg = imagesRef.current[birdKey] || imagesRef.current.bird0

      if (birdImg && birdImg.complete && birdImg.width > 0) {
        ctx.drawImage(birdImg, -17, -12, 34, 24)
      } else {
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // ── 5. RENDER GROUND PER THEME ──
      if (state.gameState === 'PLAYING') {
        state.groundX = (state.groundX - SCROLL_SPEED * dt) % 24
      }

      const groundY = height - GROUND_HEIGHT
      const landImg = imagesRef.current.land

      if (isMultiverseVideoActive) {
        const glassGrad = ctx.createLinearGradient(0, groundY, 0, height)
        glassGrad.addColorStop(0, 'rgba(15, 23, 42, 0.75)')
        glassGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)')
        ctx.fillStyle = glassGrad
        ctx.fillRect(0, groundY, width, GROUND_HEIGHT)
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()
      } else if (themeId === 'farm' && landImg && landImg.complete && landImg.width > 0) {
        const landPatternWidth = 368
        for (let x = state.groundX - landPatternWidth; x < width + landPatternWidth; x += landPatternWidth) {
          ctx.drawImage(landImg, x, groundY, landPatternWidth, GROUND_HEIGHT)
        }
      } else if (themeId === 'night') {
        ctx.fillStyle = '#020617'
        ctx.fillRect(0, groundY, width, GROUND_HEIGHT)
        ctx.strokeStyle = '#00f0ff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
        for (let gy = groundY + 15; gy < height; gy += 18) {
          ctx.beginPath()
          ctx.moveTo(0, gy)
          ctx.lineTo(width, gy)
          ctx.stroke()
        }

        const gridOffset = (state.groundX % 30)
        for (let gx = gridOffset - 30; gx < width + 30; gx += 30) {
          ctx.beginPath()
          ctx.moveTo(gx, groundY)
          ctx.lineTo(gx - 20, height)
          ctx.stroke()
        }
      } else if (themeId === 'sunset') {
        const sandGrad = ctx.createLinearGradient(0, groundY, 0, height)
        sandGrad.addColorStop(0, '#d97706')
        sandGrad.addColorStop(1, '#78350f')
        ctx.fillStyle = sandGrad
        ctx.fillRect(0, groundY, width, GROUND_HEIGHT)

        ctx.strokeStyle = '#92400e'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()
      } else if (themeId === 'ocean') {
        const seaGrad = ctx.createLinearGradient(0, groundY, 0, height)
        seaGrad.addColorStop(0, '#0284c7')
        seaGrad.addColorStop(1, '#0369a1')
        ctx.fillStyle = seaGrad
        ctx.fillRect(0, groundY, width, GROUND_HEIGHT)

        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, groundY)
        ctx.lineTo(width, groundY)
        ctx.stroke()
      } else {
        ctx.fillStyle = '#ded895'
        ctx.fillRect(0, groundY, width, GROUND_HEIGHT)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [soundEnabled, imagesLoaded])

  // Handle Input with source differentiation (touch vs click vs keyboard)
  const handleFlap = (source: 'touch' | 'click' | 'keyboard' = 'click') => {
    if (isUsernameModalOpen || isLeaderboardOpen) return

    const now = performance.now()

    // 450ms cooldown after Game Over to prevent accidental tap restarts from lingering gameplay inputs
    if (now - gameOverTimeRef.current < 450) return

    // 450ms cooldown after interacting with UI cards or buttons to prevent synthesized clicks from triggering flap
    if (now - lastUiInteractTimeRef.current < 450) return

    // If input is a mouse click, drop it if touch activity occurred recently (prevents touch-release synthesized click)
    if (source === 'click' && now - lastTouchTimeRef.current < 600) {
      return
    }

    // Rapid double trigger guard for same-source events
    if (now - lastFlapTimeRef.current < 40) return
    lastFlapTimeRef.current = now

    const FLAP_IMPULSE = -320.0

    if (gameState === 'IDLE') {
      setGameState('PLAYING')
      stateRef.current.gameState = 'PLAYING'
      stateRef.current.birdVelocity = FLAP_IMPULSE
      stateRef.current.birdRotation = -25
      if (soundEnabled) {
        playSwooshSound()
        playFlapSound()
      }
    } else if (gameState === 'PLAYING') {
      stateRef.current.birdVelocity = FLAP_IMPULSE
      stateRef.current.birdRotation = -25
      if (soundEnabled) playFlapSound()
    }
  }

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        handleFlap('keyboard')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, isUsernameModalOpen, isLeaderboardOpen, soundEnabled])

  const restartGame = () => {
    if (!canvasRef.current) return
    const now = performance.now()

    // Ignore restart if Game Over triggered less than 350ms ago
    if (now - gameOverTimeRef.current < 350) return
    lastUiInteractTimeRef.current = now

    const height = canvasRef.current.height
    
    // Pick a new random theme for every new game
    const nextTheme = getRandomTheme(currentTheme)
    setCurrentTheme(nextTheme)

    stateRef.current = {
      gameState: 'PLAYING',
      gameMode: gameMode,
      theme: nextTheme,
      score: 0,
      birdY: height / 2 - 40,
      birdVelocity: -320.0,
      birdRotation: -25.0,
      wingFrame: 0,
      wingTimer: 0,
      pipes: [],
      groundX: 0,
      rotorAngle: 0,
      lastPipeSpawnTime: 0,
      totalTime: 0
    }
    setScore(0)
    setGameState('PLAYING')
    if (soundEnabled) {
      playSwooshSound()
      playFlapSound()
    }
  }


  const handleSavePlayerName = async (newName: string): Promise<{ success: boolean; message: string }> => {
    const oldName = playerName

    // Call server action to update player_name in database & check for duplicates
    const res = await updateFlappyPlayerNameAction(oldName, newName)

    if (!res.success) {
      return res
    }

    setPlayerName(newName)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cft_flappy_player_name', newName)

      // Update matching local storage leaderboard entries
      ;['cft_flappy_local_leaderboard_classic', 'cft_flappy_local_leaderboard_zen'].forEach((key) => {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const list: LeaderboardEntry[] = JSON.parse(stored)
            let updated = false
            list.forEach((entry) => {
              const matchesUser = user && entry.user_id === user.id
              const matchesGuest = !user && (entry.player_name || '').trim().toLowerCase() === (oldName || '').trim().toLowerCase()
              if (matchesUser || matchesGuest) {
                entry.player_name = newName
                updated = true
              }
            })
            if (updated) {
              localStorage.setItem(key, JSON.stringify(list))
            }
          } catch (e) {}
        }
      })
    }

    // Instantly refresh active leaderboard state so changes reflect immediately
    fetchLeaderboard(leaderboardTab)

    return res
  }

  const openLeaderboard = (mode: 'classic' | 'zen' | 'multiverse') => {
    setLeaderboardTab(mode)
    setIsLeaderboardOpen(true)
    fetchLeaderboard(mode)
  }

  const currentHighScore = gameMode === 'zen'
    ? highScoreZen
    : gameMode === 'multiverse'
    ? highScoreMultiverse
    : highScoreClassic

  // Rank assignment
  let medalText = ''
  if (score >= 50) medalText = 'Diamond Rank'
  else if (score >= 30) medalText = 'Gold Rank'
  else if (score >= 15) medalText = 'Silver Rank'
  else if (score >= 5) medalText = 'Bronze Rank'

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 select-none relative overflow-hidden font-sans">
      <style jsx global>{`
        @keyframes doggieZoom {
          0% { transform: scale(0); opacity: 0; }
          20% { transform: scale(1.15); opacity: 1; }
          80% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes doggieFade {
          0% { opacity: 0; transform: scale(0.9); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        .animate-doggie-zoom {
          animation: doggieZoom 2.8s ease-in-out forwards;
        }
        .animate-doggie-fade {
          animation: doggieFade 2.8s ease-in-out forwards;
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-lg flex items-center justify-between z-10 gap-2 mb-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all cursor-pointer press-spring shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {syncMode === 'online' ? (
            <span 
              title="Scores sync directly with central Supabase database"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Online Cloud Sync</span>
              <span className="sm:hidden">Online</span>
            </span>
          ) : (
            <span 
              title="Using Local Storage Fallback"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/20 border border-destructive/40 text-rose-400 text-[11px] font-bold shadow-sm"
            >
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Offline Fallback</span>
              <span className="sm:hidden">Offline</span>
            </span>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Frame Container */}
      <main className="relative z-10 w-full max-w-lg aspect-[4/5] max-h-[640px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.2)] border-4 border-slate-800 bg-sky-400 flex flex-col items-center justify-center">
        
        {/* Multiverse Video Background Layer (Active when gameMode is multiverse and score >= 6) */}
        {gameMode === 'multiverse' && score >= 6 && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black transition-opacity duration-1000">
            <video
              ref={videoRefA}
              src={videoSrcA}
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                activeVideoSlot === 'A' ? 'opacity-100' : 'opacity-0'
              }`}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
            />
            <video
              ref={videoRefB}
              src={videoSrcB}
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                activeVideoSlot === 'B' ? 'opacity-100' : 'opacity-0'
              }`}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
            />
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          </div>
        )}

        {/* Doggie Pop-up Overlay for Multiverse Mode */}
        {gameMode === 'multiverse' && doggiePop && (
          <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden">
            <img
              key={doggiePop.id}
              src={doggiePop.src}
              alt="Doggie Easter Egg"
              className={`max-w-[220px] max-h-[220px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] ${
                doggiePop.effect === 'zoom'
                  ? 'animate-doggie-zoom'
                  : 'animate-doggie-fade'
              }`}
            />
          </div>
        )}

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          onClick={() => handleFlap('click')}
          onTouchStart={(e) => {
            e.preventDefault()
            lastTouchTimeRef.current = performance.now()
            handleFlap('touch')
          }}
          onTouchEnd={() => {
            lastTouchTimeRef.current = performance.now()
          }}
          className="w-full h-full cursor-pointer touch-none block relative z-10"
        />

        {/* Real-time In-Game Score overlay with Mode & Theme Badge */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-5 inset-x-0 pointer-events-none flex flex-col items-center gap-1.5 z-20">
            <span className={`text-5xl font-black text-white drop-shadow-[0_4px_0_#0f172a] transition-transform duration-100 ${scoreFlash ? 'scale-125 text-amber-300' : 'scale-100'}`}>
              {score}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                gameMode === 'multiverse'
                  ? 'bg-purple-600/90 border-purple-300 text-white backdrop-blur-sm animate-pulse'
                  : gameMode === 'zen' 
                  ? 'bg-teal-500/90 border-teal-300 text-slate-950 backdrop-blur-sm'
                  : 'bg-amber-500/90 border-amber-300 text-slate-950 backdrop-blur-sm'
              }`}>
                {gameMode === 'multiverse' ? 'MULTIVERSE OF SADNESS' : gameMode === 'zen' ? 'ZEN MODE (160px Gap)' : 'CLASSIC MODE'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 backdrop-blur-sm">
                Theme: {gameMode === 'multiverse' ? 'Random Multiverse' : activeThemeObj.name}
              </span>
            </div>
          </div>
        )}

        {/* Start Game / Idle Menu Overlay */}
        {gameState === 'IDLE' && (
          <div 
            onClick={(e) => {
              e.stopPropagation()
              handleFlap('click')
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              lastTouchTimeRef.current = performance.now()
              handleFlap('touch')
            }}
            onTouchEnd={(e) => {
              e.stopPropagation()
              lastTouchTimeRef.current = performance.now()
            }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center cursor-pointer pointer-events-auto z-30"
          >
            <div className="bg-amber-400 border-4 border-amber-950 px-6 py-3 rounded-2xl shadow-[0_6px_0_0_#78350f] text-amber-950 font-black text-2xl uppercase mb-3 tracking-wide flex items-center gap-2.5 animate-pulse">
              <Gamepad2 className="h-7 w-7 text-amber-950" />
              <span>FLAPPY BIRD</span>
            </div>

            {/* Mode Selection Pills (Classic vs Zen vs Multiverse) */}
            <div 
              onClick={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              onTouchStart={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 flex items-center justify-center gap-1 mb-3 shadow-xl backdrop-blur-md max-w-xs w-full"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('classic')
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('classic')
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  gameMode === 'classic'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>Classic</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('zen')
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('zen')
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  gameMode === 'zen'
                    ? 'bg-teal-400 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Zen</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('multiverse')
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  lastUiInteractTimeRef.current = performance.now()
                  setGameMode('multiverse')
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  gameMode === 'multiverse'
                    ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-md scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="h-3 w-3 text-purple-200" />
                <span>Multiverse</span>
              </button>
            </div>

            {/* Theme Selector Pills */}
            <div 
              onClick={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              onTouchStart={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 max-w-xs w-full shadow-xl backdrop-blur-md mb-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-wider">
                <span>Theme: {gameMode === 'multiverse' ? 'Multiverse World' : activeThemeObj.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setCurrentTheme(getRandomTheme(currentTheme))
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setCurrentTheme(getRandomTheme(currentTheme))
                  }}
                  className="flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
                  title="Randomize Theme"
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Random</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      lastUiInteractTimeRef.current = performance.now()
                      setCurrentTheme(th.id)
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      lastUiInteractTimeRef.current = performance.now()
                      setCurrentTheme(th.id)
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      currentTheme === th.id && gameMode !== 'multiverse'
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {th.id === 'farm' && <TreePine className="h-3 w-3" />}
                    {th.id === 'night' && <Moon className="h-3 w-3" />}
                    {th.id === 'sunset' && <Sun className="h-3 w-3" />}
                    {th.id === 'ocean' && <Waves className="h-3 w-3" />}
                    <span className="truncate w-full text-center">{th.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div 
              onClick={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              onTouchStart={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 max-w-xs w-full shadow-2xl backdrop-blur-md space-y-2.5"
            >
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                {gameMode === 'multiverse' ? 'Sadness Videos @ 6 PTS + Randomized Pipes' : gameMode === 'zen' ? 'Relaxing Wide Gaps (160px)' : 'Original Felgo Physics (90px)'}
              </p>

              {/* Player Profile Handle Chip */}
              <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-slate-200">{playerName || 'Guest'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setIsUsernameModalOpen(true)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setIsUsernameModalOpen(true)
                  }}
                  className="text-[11px] font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  Edit Name
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{gameMode === 'multiverse' ? 'Multiverse Best:' : gameMode === 'zen' ? 'Zen Best:' : 'Classic Best:'}</span>
                <span className="font-bold text-amber-400 text-sm">{currentHighScore} PTS</span>
              </div>
            </div>

            <p className="text-xs text-white/90 font-bold mt-5 animate-bounce uppercase tracking-wider">
              TAP OR PRESS SPACE TO FLY
            </p>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {gameState === 'GAMEOVER' && (
          <div 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 pointer-events-auto animate-fade-in z-30"
          >
            <div className="bg-gradient-to-b from-amber-400 to-amber-500 border-4 border-amber-950 px-6 py-2 rounded-2xl shadow-[0_6px_0_0_#78350f] text-amber-950 font-black text-2xl uppercase mb-2 tracking-wider">
              GAME OVER!
            </div>

            <div 
              onClick={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              onTouchStart={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
              className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-2.5 text-center"
            >
              {/* Mode Selection Pills on Game Over */}
              <div 
                onClick={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
                onTouchStart={(e) => { e.stopPropagation(); lastUiInteractTimeRef.current = performance.now(); }}
                className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-1 flex items-center justify-center gap-1 shadow-inner backdrop-blur-md w-full"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('classic')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('classic')
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    gameMode === 'classic'
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  <span>Classic</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('zen')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('zen')
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    gameMode === 'zen'
                      ? 'bg-teal-400 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Zen</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('multiverse')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameMode('multiverse')
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    gameMode === 'multiverse'
                      ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="h-3 w-3 text-purple-200" />
                  <span>Multiverse</span>
                </button>
              </div>

              {/* Theme Badge */}
              <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                <span>Active Theme:</span>
                <span className="text-amber-400">{activeThemeObj.name}</span>
              </div>

              {medalText && (
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Award className="h-3.5 w-3.5" />
                  <span>{medalText}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-850 p-2.5 rounded-2xl border border-slate-800">
                <div className="border-r border-slate-800 pr-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Round Score</span>
                  <span className="text-2xl font-black text-white">{score}</span>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Best ({gameMode})</span>
                  <span className="text-2xl font-black text-amber-400">{currentHighScore}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Playing as: <span className="font-bold text-slate-200">{playerName}</span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    restartGame()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    restartGame()
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_4px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-0.5 cursor-pointer press-spring flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again ({gameMode})</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    openLeaderboard(gameMode)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    openLeaderboard(gameMode)
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>View {gameMode === 'zen' ? 'Zen' : gameMode === 'multiverse' ? 'Multiverse' : 'Classic'} Leaderboard</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameState('IDLE')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    lastUiInteractTimeRef.current = performance.now()
                    setGameState('IDLE')
                  }}
                  className="w-full py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Main Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer Controls */}
      <footer className="w-full max-w-lg flex items-center justify-between z-10 mt-3 text-xs">
        <button
          onClick={() => openLeaderboard(gameMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold transition-all cursor-pointer"
        >
          <Trophy className="h-4 w-4" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => setIsUsernameModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition-all cursor-pointer"
        >
          <User className="h-4 w-4 text-sky-400" />
          <span>Handle: <strong className="text-white">{playerName || 'Guest'}</strong></span>
        </button>
      </footer>

      {/* Profile Modal */}
      <UsernameModal
        user={user}
        currentName={playerName}
        onSaveName={handleSavePlayerName}
        onClose={() => setIsUsernameModalOpen(false)}
        isOpen={isUsernameModalOpen}
      />

      {/* Leaderboard Modal with Dual Mode Tabs */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboardData}
        mode={syncMode}
        onRefresh={() => fetchLeaderboard(leaderboardTab)}
        userBestScore={leaderboardTab === 'zen' ? highScoreZen : leaderboardTab === 'multiverse' ? highScoreMultiverse : highScoreClassic}
        playerName={playerName}
        activeModeTab={leaderboardTab}
        onTabChange={handleLeaderboardTabChange}
        onClearLeaderboard={handleClearLeaderboard}
        isLoading={isLeaderboardLoading}
      />

    </div>
  )
}
