'use client'

import React, { useEffect, useRef, useState } from 'react'

import {
  UNIVERSE_CONFIGS,
  FALLBACK_SUBS,
  BIRD_THOUGHTS,
  DEATH_EPITAPHS,
  APOLOGY_QUOTES,
  COMMENT_POOL,
  TUTORIAL_POUPS,
  ANIME_ATTACKS,
  MULTIVERSE_VIDEOS,
  UniverseConfig,
  RarityTier
} from './multiverse-config'

import { GameStateRef, SceneryState, UniCardState, Particle, PipeObj } from './multiverse-types'
import { createAudioContext, createSfxManager, AudioRefs } from './multiverse-audio'
import {
  W,
  H,
  GROUND,
  TAU,
  PIPE_W,
  clamp,
  renderGameFrame
} from './multiverse-renderer'

import { MultiverseHeader } from './ui/multiverse-header'
import { MultiverseHUD } from './ui/multiverse-hud'
import { MultiverseStartOverlay } from './ui/multiverse-start-overlay'
import { MultiverseDeadOverlay } from './ui/multiverse-dead-overlay'
import { MultiverseUniverseCard } from './ui/multiverse-universe-card'
import { MultiverseSidePanel } from './ui/multiverse-side-panel'
import { MultiverseDexModal } from './ui/multiverse-dex-modal'

const SPEED = 150
const GRAV = 950.0
const FLAPV = -320.0
const MAXV = 520.0

const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0]

export function MultiverseGameStandalone() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const screenRef = useRef<HTMLDivElement | null>(null)

  // Video slots for crossfading
  const videoRefA = useRef<HTMLVideoElement | null>(null)
  const videoRefB = useRef<HTMLVideoElement | null>(null)
  const [videoSrcA, setVideoSrcA] = useState<string>('')
  const [videoSrcB, setVideoSrcB] = useState<string>('')
  const [activeVideoSlot, setActiveVideoSlot] = useState<'A' | 'B'>('A')
  const unplayedVideoIndicesRef = useRef<number[]>([])
  const isVideoTransitioningRef = useRef<boolean>(false)
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Audio Context State Ref
  const audioRefs = useRef<AudioRefs>({ audioCtx: null, masterGain: null, rainGain: null })

  // UI States
  const [mode, setMode] = useState<'start' | 'play' | 'dead'>('start')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [tearsCount, setTearsCount] = useState(0)
  const [flapsCount, setFlapsCount] = useState(0)
  const [runsCount, setRunsCount] = useState(0)
  const [runUnis, setRunUnis] = useState(0)
  const [currentUniIndex, setCurrentUniIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [pixelatedVideo, setPixelatedVideo] = useState(true)

  // Multiverse Dex & Ban State
  const [isDexOpen, setIsDexOpen] = useState(false)
  const [unlockedUniIds, setUnlockedUniIds] = useState<string[]>(['rain'])
  const [bannedUniId, setBannedUniId] = useState<string | null>(null)

  // Overlays & Epitaphs
  const [epitaphText, setEpitaphText] = useState('')
  const [uniCard, setUniCard] = useState<UniCardState>({ num: '', name: '', sub: '', show: false })

  // High-frequency state ref
  const S = useRef<GameStateRef>({
    mode: 'start',
    t: 0,
    timeScale: 1,
    targetTS: 1,
    baseTS: 1,
    slowmoT: 0,
    score: 0,
    best: 0,
    tears: 0,
    flaps: 0,
    runs: 0,
    runUnis: 0,
    uniIndex: 0,
    fusionUnis: null,
    bannedUniId: null,
    rarityLabel: 'common',
    pipes: [],
    rain: [],
    tearPs: [],
    floats: [],
    thought: { text: '', t: 0 },
    thoughtT: 4,
    subText: '',
    subT: 0,
    subNext: 1.5,
    rec: [],
    lastRun: null,
    ghostIdx: 0,
    ghostDead: false,
    shake: 0,
    flash: 0,
    sobT: 3,
    groundOff: 0,
    deadAt: 0,
    birdY: H / 2,
    birdVy: 0,
    birdRot: 0,
    birdWing: 0,
    birdBlink: 0,
    nextBlink: 2,

    sneezeTimer: 4,
    lastPipeGap: 118,
    dejaVuPattern: null,
    dejaVuCount: 0,
    batteryLevel: 100,
    leaves: [],
    snow: [],
    bubbles: [],
    picketBirds: [],
    afkTimer: 0,
    afkFlapTimer: 0,
    spectatorY: H / 2,
    spectatorVy: -100,
    freeTrialExpired: false,
    commentTimer: 3,
    tutorialTimer: 2,
    tutorialStep: 0,
    patchNotesShow: false,
    dreadMeter: 0,
    therapyTimer: 0,
    rainbowTimer: 0,
    unlockedUniIds: ['rain']
  })

  // Pre-load Scenery Background Objects
  const sceneryRef = useRef<SceneryState>({
    buildings: [],
    skyW: 600,
    clouds: [],
    puddles: []
  })

  // Initialize Local Best, Scenery, and Unlocked Universes from LocalStorage
  useEffect(() => {
    try {
      const savedBest = parseInt(localStorage.getItem('mos2_standalone_best') || '0', 10)
      setBest(savedBest)
      S.current.best = savedBest

      const savedUnis = JSON.parse(localStorage.getItem('mos2_unlocked_unis') || '["rain"]')
      if (Array.isArray(savedUnis)) {
        setUnlockedUniIds(savedUnis)
        S.current.unlockedUniIds = savedUnis
      }
    } catch (e) {}

    // Generate Scenery
    const b: SceneryState['buildings'] = []
    let x = 0
    while (x < W + 260) {
      const w = 26 + Math.random() * 52
      const h = 50 + Math.random() * 150
      b.push({
        x,
        w,
        h,
        win: Math.random() < 0.6 ? { x: 5 + Math.random() * (w - 12), y: 10 + Math.random() * (h - 24), ph: Math.random() * 6 } : null
      })
      x += w + Math.random() * 12
    }
    const clouds: SceneryState['clouds'] = []
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * (W + 200),
        y: 40 + Math.random() * 120,
        s: 0.7 + Math.random() * 0.7,
        sp: 12 + Math.random() * 22
      })
    }
    const puddles: SceneryState['puddles'] = []
    for (let i = 0; i < 6; i++) {
      puddles.push({ x: Math.random() * (W + 160), w: 14 + Math.random() * 32 })
    }
    // Pre-load Special Elite font
    if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
      document.fonts.load("13px 'Special Elite'")
    }

    sceneryRef.current = { buildings: b, skyW: x, clouds, puddles }
  }, [])

  // Audio Context & SFX Initialization
  const initAudio = () => {
    if (!audioRefs.current.audioCtx) {
      audioRefs.current = createAudioContext()
    }
  }

  const sfx = createSfxManager(audioRefs.current, soundEnabled)

  // Video deck shuffle helper
  const getNextRandomVideoUrl = () => {
    if (MULTIVERSE_VIDEOS.length === 0) return ''
    if (unplayedVideoIndicesRef.current.length === 0) {
      const indices = Array.from({ length: MULTIVERSE_VIDEOS.length }, (_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      unplayedVideoIndicesRef.current = indices
    }
    const nextIdx = unplayedVideoIndicesRef.current.pop()!
    return MULTIVERSE_VIDEOS[nextIdx]
  }

  // Record witnessed universe to state & localStorage
  const unlockUniverse = (id: string) => {
    if (!S.current.unlockedUniIds.includes(id)) {
      const updated = [...S.current.unlockedUniIds, id]
      S.current.unlockedUniIds = updated
      setUnlockedUniIds(updated)
      try {
        localStorage.setItem('mos2_unlocked_unis', JSON.stringify(updated))
      } catch (e) {}
    }
  }

  // Universe Switcher (with Weighted Rarity & Fusions support)
  const applyUniverse = (i: number, announce: boolean) => {
    S.current.uniIndex = i
    setCurrentUniIndex(i)
    const u = UNIVERSE_CONFIGS[i]
    unlockUniverse(u.id)

    // Fusion Mode check (if score >= 30, combine 2 universes)
    if (S.current.score >= 30) {
      const secondIdx = (i + 1 + Math.floor(Math.random() * (UNIVERSE_CONFIGS.length - 2))) % UNIVERSE_CONFIGS.length
      const u2 = UNIVERSE_CONFIGS[secondIdx]
      S.current.fusionUnis = [i, secondIdx]
      unlockUniverse(u2.id)

      if (announce) {
        setUniCard({
          num: `∞`,
          name: `${u.name} × ${u2.name}`,
          sub: `[FUSION UNIVERSE] ${u.sub}`,
          show: true,
          rarity: 'cursed',
          isFusion: true
        })
        setTimeout(() => setUniCard(prev => ({ ...prev, show: false })), 3200)
      }
    } else {
      S.current.fusionUnis = null
      if (announce) {
        setUniCard({ num: u.num, name: u.name, sub: u.sub, show: true, rarity: u.rarity })
        setTimeout(() => setUniCard(prev => ({ ...prev, show: false })), 2800)
      }
    }

    if (S.current.mode === 'play') {
      S.current.runUnis++
      setRunUnis(S.current.runUnis)
      S.current.flash = 1.0
      sfx.portal()
    }
  }

  // Rarity Weighted Random Universe Selector
  const pickWeightedNextUniverse = (): number => {
    const available = UNIVERSE_CONFIGS.filter(u => u.id !== bannedUniId)

    const roll = Math.random() * 100
    let targetRarity: RarityTier = 'common'
    if (roll > 95) targetRarity = 'cursed'
    else if (roll > 70) targetRarity = 'uncommon'

    const candidates = available.filter(u => u.rarity === targetRarity)
    const pool = candidates.length > 0 ? candidates : available
    const picked = pick(pool)

    return UNIVERSE_CONFIGS.findIndex(u => u.id === picked.id)
  }

  // Video Queueing & Playback Effects for Multiverse Mode
  useEffect(() => {
    if (score >= 6 && mode === 'play' && (!videoSrcA || !videoSrcB)) {
      const firstUrl = getNextRandomVideoUrl()
      const secondUrl = getNextRandomVideoUrl()
      setVideoSrcA(firstUrl)
      setVideoSrcB(secondUrl)
      setActiveVideoSlot('A')
    }
  }, [score, mode, videoSrcA, videoSrcB])

  useEffect(() => {
    const activeVideo = activeVideoSlot === 'A' ? videoRefA.current : videoRefB.current
    if (activeVideo && mode === 'play' && score >= 6) {
      activeVideo.play().catch(() => {})
    }
  }, [activeVideoSlot, videoSrcA, videoSrcB, mode, score])

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (mode !== 'play') return
    const videoEl = e.currentTarget
    if (!videoEl.duration || isVideoTransitioningRef.current) return

    if (videoEl.duration - videoEl.currentTime <= 1.5) {
      isVideoTransitioningRef.current = true
      const nextUrl = getNextRandomVideoUrl()

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
    if (mode !== 'play') return
    if (isVideoTransitioningRef.current) return
    const nextUrl = getNextRandomVideoUrl()
    if (activeVideoSlot === 'A') {
      setVideoSrcB(nextUrl)
      setActiveVideoSlot('B')
    } else {
      setVideoSrcA(nextUrl)
      setActiveVideoSlot('A')
    }
  }

  const spawnTear = (x: number, y: number, count = 1, isDie = false) => {
    for (let i = 0; i < count; i++) {
      const angle = isDie ? Math.random() * TAU : Math.PI * 0.5 + (Math.random() - 0.5) * 0.8
      const speed = isDie ? 50 + Math.random() * 160 : 30 + Math.random() * 60
      S.current.tearPs.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isDie ? 40 : 0),
        t: 0
      })
    }
    S.current.tears += count
    setTearsCount(S.current.tears)
  }

  const addFloat = (x: number, y: number, txt: string, color?: string) => {
    S.current.floats.push({ x, y, text: txt, t: 0, color })
  }

  const nearMissCheck = (p: PipeObj) => {
    const topCapDist = Math.hypot(130 - (p.x + PIPE_W / 2), S.current.birdY - p.gapY)
    const botCapDist = Math.hypot(130 - (p.x + PIPE_W / 2), S.current.birdY - (p.gapY + p.gapH))

    if ((topCapDist < 36 || botCapDist < 36) && S.current.slowmoT <= 0) {
      S.current.slowmoT = 0.75
      addFloat(130 + 34, S.current.birdY - 26, 'so close. like everything else.')
      spawnTear(130, S.current.birdY + 6, 3, true)
      sfx.near()
    }
  }

  const die = (msg: string) => {
    if (S.current.mode !== 'play') return
    S.current.mode = 'dead'
    setMode('dead')
    S.current.deadAt = performance.now()
    S.current.runs++
    setRunsCount(S.current.runs)

    S.current.best = Math.max(S.current.best, S.current.score)
    setBest(S.current.best)
    try {
      localStorage.setItem('mos2_standalone_best', S.current.best.toString())
    } catch (e) {}

    S.current.lastRun = [...S.current.rec]
    S.current.rec = []

    S.current.shake = 1
    spawnTear(130, S.current.birdY, 14, true)
    sfx.die()

    setEpitaphText(msg)
  }

  const restart = () => {
    initAudio()
    S.current.mode = 'play'
    setMode('play')
    S.current.score = 0
    setScore(0)
    S.current.flaps = 0
    setFlapsCount(0)
    S.current.runUnis = 0
    setRunUnis(0)
    S.current.pipes = []
    S.current.rec = []
    S.current.ghostIdx = 0
    S.current.ghostDead = false
    S.current.shake = 0
    S.current.slowmoT = 0
    S.current.batteryLevel = 100
    S.current.freeTrialExpired = false
    S.current.dreadMeter = 0

    S.current.birdY = H / 2
    S.current.birdVy = FLAPV * 0.9
    S.current.birdRot = 0

    applyUniverse(0, true)
  }

  const press = () => {
    initAudio()
    if (S.current.mode === 'dead') {
      if (performance.now() - S.current.deadAt > 800) restart()
      return
    }
    if (S.current.mode === 'start') {
      restart()
      return
    }
    const u = UNIVERSE_CONFIGS[S.current.uniIndex]

    // Insomnia 100ms Input Queue Lag
    if (u.insomnia) {
      setTimeout(() => {
        if (S.current.mode === 'play') {
          S.current.birdVy = u.grav > 0 ? FLAPV : -FLAPV
          S.current.birdWing = 1
          S.current.flaps++
          setFlapsCount(S.current.flaps)
          sfx.flap()
        }
      }, 100)
      return
    }

    S.current.birdVy = u.grav > 0 ? FLAPV : -FLAPV
    S.current.birdWing = 1
    S.current.flaps++
    setFlapsCount(S.current.flaps)
    sfx.flap()
  }

  // Physics Delta Update
  const updateRain = (dt: number, u: UniverseConfig) => {
    const target = Math.round(u.rain * 95)
    while (S.current.rain.length < target) {
      S.current.rain.push({
        x: Math.random() * (W + 60),
        y: -12 - Math.random() * 40,
        len: 9 + Math.random() * 11,
        sp: 430 + Math.random() * 280,
        wx: -28 - Math.random() * 46
      })
    }
    if (S.current.rain.length > target) S.current.rain.length = target

    for (const d of S.current.rain) {
      d.y += d.sp * dt
      d.x += d.wx * dt
      if (d.y > H - GROUND + 8) {
        d.y = -12 - Math.random() * 40
        d.x = Math.random() * (W + 60)
      }
      if (d.x < -10) d.x = W + 8
    }
  }

  const update = (dt: number, rdt: number) => {
    const u = UNIVERSE_CONFIGS[S.current.uniIndex]

    if (S.current.slowmoT > 0) {
      S.current.slowmoT -= rdt
      if (S.current.slowmoT <= 0) S.current.targetTS = S.current.baseTS
    }
    S.current.timeScale += (S.current.targetTS - S.current.timeScale) * Math.min(1, rdt * 9)

    updateRain(dt, u)

    // Deep End Bubbles Generator
    if (u.deepEnd) {
      if (S.current.bubbles.length < 12) {
        S.current.bubbles.push({
          x: Math.random() * W,
          y: H - GROUND + 10,
          vx: (Math.random() - 0.5) * 10,
          vy: -40 - Math.random() * 30,
          t: 0,
          size: 2 + Math.random() * 4
        })
      }
      for (let i = S.current.bubbles.length - 1; i >= 0; i--) {
        const b = S.current.bubbles[i]
        b.y += b.vy * dt
        b.x += b.vx * dt
        if (b.y < -10) S.current.bubbles.splice(i, 1)
      }
    }

    // Autumn Leaves Generator
    if (u.autumn) {
      if (S.current.leaves.length < 14) {
        S.current.leaves.push({
          x: Math.random() * (W + 50),
          y: -10,
          vx: -30 - Math.random() * 20,
          vy: 40 + Math.random() * 30,
          t: 0,
          rot: Math.random() * TAU
        })
      }
      for (let i = S.current.leaves.length - 1; i >= 0; i--) {
        const l = S.current.leaves[i]
        l.y += l.vy * dt
        l.x += l.vx * dt
        l.rot! += dt * 2
        if (l.y > H - GROUND) S.current.leaves.splice(i, 1)
      }
    }

    // Snow Flakes Generator
    if (u.snow) {
      if (S.current.snow.length < 25) {
        S.current.snow.push({
          x: Math.random() * W,
          y: -10,
          vx: (Math.random() - 0.5) * 15,
          vy: 35 + Math.random() * 25,
          t: 0,
          size: 1.5 + Math.random() * 2
        })
      }
      for (let i = S.current.snow.length - 1; i >= 0; i--) {
        const s = S.current.snow[i]
        s.y += s.vy * dt
        s.x += s.vx * dt
        if (s.y > H - GROUND) S.current.snow.splice(i, 1)
      }
    }

    // Thunderstorm lightning & thunder shake
    if (u.thunderstorm && S.current.mode === 'play') {
      if (Math.random() < dt * 0.25) {
        S.current.flash = 1.0
        S.current.shake = 0.8
        sfx.thunder()
      }
    }

    // Sneeze Mechanic: random auto flap!
    if (u.sneeze && S.current.mode === 'play') {
      S.current.sneezeTimer -= dt
      if (S.current.sneezeTimer <= 0) {
        S.current.sneezeTimer = 3 + Math.random() * 3
        S.current.birdVy = FLAPV * 1.2
        addFloat(130, S.current.birdY - 20, 'ACHOO! 🤧', '#f87171')
        sfx.sneeze()
      }
    }

    // Low Battery decay
    if (u.lowBattery && S.current.mode === 'play') {
      S.current.batteryLevel = Math.max(1, S.current.batteryLevel - dt * 2.2)
    }

    // Sunday Night Dread Rise
    if (u.sundayNight && S.current.mode === 'play') {
      S.current.dreadMeter = Math.min(100, S.current.dreadMeter + dt * 4)
    }

    for (const c of sceneryRef.current.clouds) {
      c.x -= c.sp * dt
      if (c.x < -160) c.x = W + 120
    }

    for (let i = S.current.tearPs.length - 1; i >= 0; i--) {
      const p = S.current.tearPs[i]
      p.vy += 880 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.t += dt
      if (p.y > H - GROUND + 6 || p.t > 2.6) S.current.tearPs.splice(i, 1)
    }

    for (let i = S.current.floats.length - 1; i >= 0; i--) {
      const f = S.current.floats[i]
      f.t += dt
      f.y -= 16 * dt
      if (f.t > 2.4) S.current.floats.splice(i, 1)
    }

    S.current.subNext -= dt
    if (S.current.subNext <= 0) {
      S.current.subText = pick(FALLBACK_SUBS)
      S.current.subT = 0
      S.current.subNext = 4.5 + Math.random() * 2.5
    }
    S.current.subT += dt

    if (S.current.mode !== 'dead') {
      S.current.sobT -= dt
      if (S.current.sobT <= 0) {
        S.current.sobT = 3.5 + Math.random() * 5
        spawnTear(130 + 7, S.current.birdY - 2)
        if (S.current.mode === 'play') S.current.birdVy += u.grav > 0 ? 26 : -26
      }
    }

    S.current.nextBlink -= dt
    if (S.current.nextBlink <= 0) {
      S.current.birdBlink = 0.13
      S.current.nextBlink = 2 + Math.random() * 4
    }
    if (S.current.birdBlink > 0) S.current.birdBlink -= dt

    if (S.current.shake > 0) S.current.shake = Math.max(0, S.current.shake - dt * 2.8)
    if (S.current.flash > 0) S.current.flash = Math.max(0, S.current.flash - dt * 2.2)

    // Mode Play Logic
    if (S.current.mode === 'play') {
      S.current.rec.push({ y: S.current.birdY, rot: S.current.birdRot })

      if (S.current.lastRun && !S.current.ghostDead) {
        S.current.ghostIdx++
        if (S.current.ghostIdx >= S.current.lastRun.length) S.current.ghostDead = true
      }

      // Wind Gusts
      let extraWind = 0
      if (u.wind) {
        extraWind = Math.sin(S.current.t * 3) * 60
      }

      const effectiveGrav = (GRAV * u.grav) + extraWind
      S.current.birdVy += effectiveGrav * dt
      S.current.birdVy = clamp(S.current.birdVy, u.grav > 0 ? -MAXV : -50, u.grav > 0 ? MAXV : 50)
      S.current.birdY += S.current.birdVy * dt

      const targetRot = clamp(S.current.birdVy * 0.0028 * u.grav, -0.6, 1.2)
      S.current.birdRot += (targetRot - S.current.birdRot) * Math.min(1, dt * 14)
      S.current.birdWing = Math.max(0, S.current.birdWing - dt * 5)

      const curSpeed = SPEED * u.speed
      S.current.groundOff = (S.current.groundOff + curSpeed * dt) % 48

      // Spawn Pipes (Therapy Break suppresses pipe spawns)
      if (!u.therapyBreak) {
        const lastP = S.current.pipes[S.current.pipes.length - 1]
        if (!lastP || lastP.x < W - 235) {
          let gapH = 118
          if (u.longGoodbye) {
            S.current.lastPipeGap = Math.max(88, S.current.lastPipeGap - 2)
            gapH = S.current.lastPipeGap
          }

          const minGapY = 75
          const maxGapY = H - GROUND - gapH - 65

          let gapY: number
          if (u.dejaVu) {
            if (S.current.dejaVuPattern && S.current.dejaVuCount < 1) {
              gapY = S.current.dejaVuPattern.gapY
              gapH = S.current.dejaVuPattern.gapH
              S.current.dejaVuCount++
            } else {
              let rawTarget = minGapY + Math.random() * (maxGapY - minGapY)
              if (lastP) {
                const maxDelta = 110
                rawTarget = lastP.gapY + (Math.random() - 0.5) * (maxDelta * 2)
              }
              gapY = clamp(rawTarget, minGapY, maxGapY)
              S.current.dejaVuPattern = { gapY, gapH }
              S.current.dejaVuCount = 0
            }
          } else {
            if (lastP) {
              const maxDelta = 110
              const rawTarget = lastP.gapY + (Math.random() - 0.5) * (maxDelta * 2)
              gapY = clamp(rawTarget, minGapY, maxGapY)
            } else {
              gapY = minGapY + Math.random() * (maxGapY - minGapY)
            }
          }

          const isHolo = u.trust && Math.random() < 0.25
          const isGold = u.freeTrial && S.current.freeTrialExpired
          const isWedding = u.wedding && Math.random() < 0.3
          const hasCake = u.birthday && Math.random() < 0.3

          S.current.pipes.push({
            x: W + 10,
            baseY: gapY,
            gapY,
            gapH,
            drift: Math.random() < 0.35,
            dA: 12 + Math.random() * 12,
            dS: 1.0 + Math.random() * 1.2,
            ph: Math.random() * TAU,
            passed: false,
            sorry: Math.random() < 0.25,
            hologram: isHolo,
            gold: isGold,
            wedding: isWedding,
            hasCake
          })
        }
      }

      // Update Pipes
      for (let i = S.current.pipes.length - 1; i >= 0; i--) {
        const p = S.current.pipes[i]
        p.x -= curSpeed * dt

        if (p.drift && S.current.score >= 3) {
          p.gapY = p.baseY + Math.sin(S.current.t * p.dS + p.ph) * p.dA
          p.gapY = clamp(p.gapY, 60, H - GROUND - p.gapH - 55)
        }

        // Score Passing
        if (!p.passed && p.x + PIPE_W < 130) {
          p.passed = true
          S.current.score++
          setScore(S.current.score)
          sfx.score()

          // Anime Attack Name Popup
          if (u.anime) {
            addFloat(130, S.current.birdY - 20, pick(ANIME_ATTACKS), '#60a5fa')
          }

          // Tax Season 10% Deduction
          if (u.taxSeason && S.current.score % 10 === 0 && S.current.score > 0) {
            S.current.score = Math.max(0, S.current.score - 1)
            setScore(S.current.score)
            addFloat(130, S.current.birdY - 25, '-1 SCORE (IRS TAX)', '#ef4444')
          }

          // Random thought & apologetic float quotes
          if (Math.random() < 0.4) {
            addFloat(p.x + PIPE_W / 2, p.gapY + p.gapH + 18, pick(APOLOGY_QUOTES))
          }
          if (Math.random() < 0.6) {
            S.current.thought = { text: pick(BIRD_THOUGHTS), t: 2.8 }
          }

          // Weighted Universe Switcher every 4 pipes
          if (S.current.score % 4 === 0) {
            const nextIdx = pickWeightedNextUniverse()
            applyUniverse(nextIdx, true)
          }
        }

        nearMissCheck(p)

        if (p.x < -PIPE_W - 20) S.current.pipes.splice(i, 1)
      }

      // Collision Detection (Hologram pipes skip collision check)
      const birdBox = { l: 130 - 9, r: 130 + 9, t: S.current.birdY - 8, b: S.current.birdY + 8 }

      if (birdBox.b >= H - GROUND) {
        die(pick(DEATH_EPITAPHS))
        return
      }
      if (birdBox.t <= -20 && u.grav > 0) {
        die('the sky is not a shelter.')
        return
      }

      for (const p of S.current.pipes) {
        if (p.hologram) continue // Hologram pipe bypass!

        if (birdBox.r > p.x + 4 && birdBox.l < p.x + PIPE_W - 4) {
          if (birdBox.t < p.gapY || birdBox.b > p.gapY + p.gapH) {
            die(pick(DEATH_EPITAPHS))
            return
          }
        }
      }
    }
  }

  // Animation Loop
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()

    const loop = (now: number) => {
      const rdt = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now

      const dt = rdt * S.current.timeScale
      S.current.t += dt

      update(dt, rdt)

      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        renderGameFrame(
          ctx,
          S.current,
          sceneryRef.current,
          pixelatedVideo,
          activeVideoSlot === 'A' ? videoRefA.current : videoRefB.current,
          offscreenCanvasRef.current,
          offscreenCtxRef.current
        )
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [pixelatedVideo, activeVideoSlot])

  // Setup Offscreen Canvas for Downsampling Video
  useEffect(() => {
    const offCanvas = document.createElement('canvas')
    offCanvas.width = 64
    offCanvas.height = 85
    offscreenCanvasRef.current = offCanvas
    offscreenCtxRef.current = offCanvas.getContext('2d')
  }, [])

  return (
    <div className="multiverse-rain relative w-full min-h-screen bg-[#0a0f16] text-[#c9d6e2] flex flex-col justify-between font-['Space_Grotesk'] overflow-y-auto overflow-x-hidden select-none">
      <div className="atmo-vig" />

      {/* Background Video Elements for Crossfading */}
      <video
        ref={videoRefA}
        src={videoSrcA}
        muted
        playsInline
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={handleVideoEnded}
        className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none z-0 ${
          score >= 6 && mode === 'play' && activeVideoSlot === 'A' ? 'opacity-35' : 'opacity-0'
        }`}
      />
      <video
        ref={videoRefB}
        src={videoSrcB}
        muted
        playsInline
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={handleVideoEnded}
        className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none z-0 ${
          score >= 6 && mode === 'play' && activeVideoSlot === 'B' ? 'opacity-35' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-[30px] pb-[44px] flex flex-col justify-between min-h-screen">
        {/* Header Bar */}
        <MultiverseHeader
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          pixelatedVideo={pixelatedVideo}
          setPixelatedVideo={setPixelatedVideo}
          onOpenDex={() => setIsDexOpen(true)}
          unlockedCount={unlockedUniIds.length}
          totalCount={UNIVERSE_CONFIGS.length}
          best={best}
        />

        {/* Main Game Screen & Side Panel Container */}
        <main className="relative flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-[26px] my-6 w-full">
          <div
            ref={screenRef}
            onClick={press}
            className="relative w-full max-w-[460px] aspect-[480/640] max-h-[80vh] bg-[#060a10] rounded-[8px] shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden border border-[#22344a] hover:border-[#33527a] transition-all duration-500 cursor-pointer group shrink-0"
          >
            <canvas ref={canvasRef} width={W} height={H} className="w-full h-full block" />

            <MultiverseUniverseCard card={uniCard} />
            <MultiverseHUD score={score} best={best} uniIndex={currentUniIndex} runUnis={runUnis} tearsCount={tearsCount} />

            {mode === 'start' && <MultiverseStartOverlay onStart={restart} />}
            {mode === 'dead' && (
              <MultiverseDeadOverlay
                score={score}
                best={best}
                epitaph={epitaphText}
                onRestart={restart}
                onOpenDex={() => setIsDexOpen(true)}
                unlockedCount={unlockedUniIds.length}
                runsCount={runsCount}
                tearsCount={tearsCount}
                runUnis={runUnis}
                flapsCount={flapsCount}
              />
            )}
          </div>

          {/* Multiverse Side Panel Details */}
          <MultiverseSidePanel
            flapsCount={flapsCount}
            tearsCount={tearsCount}
            runsCount={runsCount}
            currentUniIndex={currentUniIndex}
          />
        </main>

        <footer className="mt-[30px] text-[11px] text-[#5a6d82] tracking-[0.5px] flex justify-between flex-wrap gap-2 w-full font-['Space_Grotesk']">
          <span>multiverse of sadness ii — a concept build for your flappy mode</span>
          <span>no birds were harmed. only mildly devastated.</span>
        </footer>
      </div>

      {/* Universe Dex Modal */}
      <MultiverseDexModal
        isOpen={isDexOpen}
        onClose={() => setIsDexOpen(false)}
        unlockedUniIds={unlockedUniIds}
        bannedUniId={bannedUniId}
        onSetBannedUni={setBannedUniId}
      />

    </div>
  )
}
