import { UniverseConfig, RarityTier, PipeStyle } from './multiverse-config'

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  t: number
  color?: string
  size?: number
  rot?: number
}

export interface FloatText {
  x: number
  y: number
  text: string
  t: number
  color?: string
}

export interface RainDrop {
  x: number
  y: number
  len: number
  sp: number
  wx: number
}

export interface PipeObj {
  x: number
  baseY: number
  gapY: number
  gapH: number
  drift: boolean
  dA: number
  dS: number
  ph: number
  passed: boolean
  sorry: boolean
  hologram?: boolean
  gold?: boolean
  wedding?: boolean
  hasCake?: boolean
  style?: PipeStyle
  isHerald?: boolean
  targetUniName?: string
}


export interface RecFrame {
  y: number
  rot: number
}

export interface GameStateRef {
  mode: 'start' | 'play' | 'dead'
  t: number
  timeScale: number
  targetTS: number
  baseTS: number
  slowmoT: number
  score: number
  best: number
  tears: number
  flaps: number
  runs: number
  runUnis: number
  uniIndex: number
  fusionUnis: [number, number] | null
  bannedUniId: string | null
  rarityLabel: RarityTier | ''
  pipes: PipeObj[]
  rain: RainDrop[]
  tearPs: Particle[]
  floats: FloatText[]
  thought: { text: string; t: number }
  thoughtT: number
  subText: string
  subT: number
  subNext: number
  rec: RecFrame[]
  lastRun: RecFrame[] | null
  ghostIdx: number
  ghostDead: boolean
  shake: number
  flash: number
  sobT: number
  groundOff: number
  deadAt: number
  birdY: number
  birdVy: number
  birdRot: number
  birdWing: number
  birdBlink: number
  nextBlink: number
  
  // Custom Universe Timers & Mechanics State
  sneezeTimer: number
  lastPipeGap: number
  dejaVuPattern: { gapY: number; gapH: number } | null
  dejaVuCount: number
  batteryLevel: number
  leaves: Particle[]
  snow: Particle[]
  bubbles: Particle[]
  picketBirds: Particle[]
  afkTimer: number
  afkFlapTimer: number
  spectatorY: number
  spectatorVy: number
  freeTrialExpired: boolean
  commentTimer: number
  tutorialTimer: number
  tutorialStep: number
  patchNotesShow: boolean
  dreadMeter: number
  therapyTimer: number
  rainbowTimer: number
  unlockedUniIds: string[]
  unlockedFusionKeys: string[]
  justShifted: boolean
  pendingHeraldTargetIdx: number | null
  queuedUniverseShiftIdx: number | null
}



export interface BuildingScenery {
  x: number
  w: number
  h: number
  win: { x: number; y: number; ph: number } | null
}

export interface CloudScenery {
  x: number
  y: number
  s: number
  sp: number
}

export interface PuddleScenery {
  x: number
  w: number
}

export interface SceneryState {
  buildings: BuildingScenery[]
  skyW: number
  clouds: CloudScenery[]
  puddles: PuddleScenery[]
}

export interface UniCardState {
  num: string
  name: string
  sub: string
  show: boolean
  rarity?: RarityTier
  isFusion?: boolean
}
