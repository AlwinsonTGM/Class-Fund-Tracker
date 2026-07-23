// Web Audio API helper utility for dynamic sound synthesis without external audio files

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

/**
 * Success Chime ("Ting")
 * A clean, pleasant high-frequency chime using a dual-frequency sine wave with exponential decay.
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
 * A subtle low-frequency tone when an action fails.
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
