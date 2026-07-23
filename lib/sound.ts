// Audio helper utility supporting authentic Felgo audio files with Web Audio synthesis fallback

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Audio file playback helper with instant replay cloning
function playAudioFile(src: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const audio = new Audio(src)
    audio.play().catch(() => {
      // Audio autoplay blocked or failed
    })
    return true
  } catch (e) {
    return false
  }
}

/**
 * Success Chime ("Ting")
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1046.5, now) // C6
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08) // G6

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1318.5, now) // E6
    osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.12) // C7

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.3)
    osc2.stop(now + 0.3)
  } catch (err) {
    console.debug('Audio playback blocked or unavailable:', err)
  }
}

/**
 * Error Tone ("Buzz/Thud")
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.22)
  } catch (err) {
    console.debug('Audio playback blocked or unavailable:', err)
  }
}

/**
 * Flappy Bird - Flap sound ("Wing Flap / Swoosh")
 */
export function playFlapSound() {
  if (playAudioFile('/flappy/audio/sfx_wing.wav')) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.08)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  } catch (err) {
    console.debug('Flap audio failed:', err)
  }
}

/**
 * Flappy Bird - Score chime ("Coin / Point Ding")
 */
export function playFlappyScoreSound() {
  if (playAudioFile('/flappy/audio/sfx_point.wav')) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(987.77, now)
    osc1.frequency.setValueAtTime(1318.51, now + 0.07)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1318.51, now)
    osc2.frequency.setValueAtTime(1760.0, now + 0.07)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.25)
  } catch (err) {
    console.debug('Score audio failed:', err)
  }
}

/**
 * Flappy Bird - Hit Sound ("Thud Impact")
 */
export function playHitSound() {
  if (playAudioFile('/flappy/audio/sfx_hit.wav')) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  } catch (err) {
    console.debug('Hit audio failed:', err)
  }
}

/**
 * Flappy Bird - Die Sound ("Whistle Drop")
 */
export function playDieSound() {
  if (playAudioFile('/flappy/audio/sfx_die.wav')) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.35)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.4)
  } catch (err) {
    console.debug('Die audio failed:', err)
  }
}

/**
 * Flappy Bird - Swoosh Sound ("Swooshing transition")
 */
export function playSwooshSound() {
  playAudioFile('/flappy/audio/sfx_swooshing.wav')
}


