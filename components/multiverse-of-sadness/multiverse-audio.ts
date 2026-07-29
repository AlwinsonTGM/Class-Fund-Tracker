// Web Audio API Sound Synthesizer & Controller for Multiverse of Sadness

export interface AudioRefs {
  audioCtx: AudioContext | null
  masterGain: GainNode | null
  rainGain: GainNode | null
}

export function createAudioContext(): AudioRefs {
  if (typeof window === 'undefined') {
    return { audioCtx: null, masterGain: null, rainGain: null }
  }

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioCtx()
    const masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime)
    masterGain.connect(audioCtx.destination)

    const rainGain = audioCtx.createGain()
    rainGain.gain.setValueAtTime(0.08, audioCtx.currentTime)
    rainGain.connect(masterGain)

    return { audioCtx, masterGain, rainGain }
  } catch (e) {
    return { audioCtx: null, masterGain: null, rainGain: null }
  }
}

export function playTone(
  refs: AudioRefs,
  soundEnabled: boolean,
  freq: number,
  dur: number,
  options: { type?: OscillatorType; vol?: number; attack?: number; glide?: number; delay?: number } = {}
) {
  const { audioCtx, masterGain } = refs
  if (!audioCtx || !masterGain || !soundEnabled) return

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  const { type = 'sine', vol = 0.25, attack = 0.01, glide = 0, delay = 0 } = options
  const startTime = Math.max(audioCtx.currentTime, 0.001) + delay
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  if (glide) {
    const targetFreq = Math.max(20, freq + glide)
    osc.frequency.linearRampToValueAtTime(targetFreq, startTime + dur)
  }

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + attack)
  gain.gain.linearRampToValueAtTime(0.0001, startTime + dur)

  osc.connect(gain)
  gain.connect(masterGain)

  try {
    osc.start(startTime)
    osc.stop(startTime + dur + 0.05)
  } catch (e) {
    // Ignore audio timing exceptions
  }
}

export function playSigh(refs: AudioRefs, soundEnabled: boolean, vol = 0.2) {
  const { audioCtx, masterGain } = refs
  if (!audioCtx || !masterGain || !soundEnabled) return

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  const startTime = Math.max(audioCtx.currentTime, 0.001)
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(280, startTime)
  osc.frequency.linearRampToValueAtTime(110, startTime + 0.65)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.12)
  gain.gain.linearRampToValueAtTime(0.0001, startTime + 0.65)

  osc.connect(gain)
  gain.connect(masterGain)

  try {
    osc.start(startTime)
    osc.stop(startTime + 0.7)
  } catch (e) {}
}

export type SoundMode = 'multiverse' | 'original' | 'flappy' | 'off'

export interface AudioVolumes {
  video: number
  flap: number
  score: number
}

// Play a short WAV file from /flappy/audio/ by cloning the audio element for overlap
const _flappyPool: Record<string, HTMLAudioElement | null> = {}
function playFlappyWav(src: string, vol = 1) {
  if (typeof window === 'undefined') return
  try {
    let base = _flappyPool[src]
    if (!base) {
      base = new window.Audio(src)
      base.preload = 'auto'
      _flappyPool[src] = base
    }
    const clone = base.cloneNode() as HTMLAudioElement
    clone.volume = Math.max(0, Math.min(1, vol))
    clone.play().catch(() => {})
  } catch (e) {}
}

export const createSfxManager = (
  refs: AudioRefs,
  soundMode: SoundMode,
  volumes: AudioVolumes = { video: 0.45, flap: 1, score: 1 }
) => {
  const isEnabled = soundMode !== 'off'
  const flapVol = Math.max(0, Math.min(1, volumes.flap ?? 1))
  const scoreVol = Math.max(0, Math.min(1, volumes.score ?? 1))

  return {
    flap: () => {
      if (!isEnabled || flapVol <= 0) return
      if (soundMode === 'flappy') {
        // Real original flappy bird wing WAV
        playFlappyWav('/flappy/audio/sfx_wing.wav', flapVol * 0.9)
      } else if (soundMode === 'original') {
        // Classic Flappy 8-Bit Jump sound (high square pitch sweep up 520Hz -> 820Hz)
        playTone(refs, true, 520, 0.06, { glide: 300, vol: 0.35 * flapVol, type: 'square' })
      } else {
        // Multiverse Atmospheric Synth flap
        playTone(refs, true, 320, 0.08, { glide: -120, vol: 0.35 * flapVol, type: 'triangle' })
        playTone(refs, true, 220, 0.12, { glide: -80, vol: 0.18 * flapVol, type: 'sine', delay: 0.02 })
      }
    },
    score: () => {
      if (!isEnabled || scoreVol <= 0) return
      if (soundMode === 'flappy') {
        // Real original flappy bird point/ting WAV
        playFlappyWav('/flappy/audio/sfx_point.wav', scoreVol * 0.9)
      } else if (soundMode === 'original') {
        // Classic Flappy 8-Bit Point Sound (2-tone high pitch ping: B5 -> E6)
        playTone(refs, true, 987.77, 0.08, { vol: 0.3 * scoreVol, type: 'square' })
        playTone(refs, true, 1318.51, 0.16, { vol: 0.35 * scoreVol, delay: 0.06, type: 'square' })
      } else {
        // Multiverse Synth score
        playTone(refs, true, 349.23, 0.14, { vol: 0.22 * scoreVol, type: 'sine' }) // F4
        playTone(refs, true, 440.0, 0.18, { vol: 0.25 * scoreVol, delay: 0.06, type: 'sine' }) // A4
        playTone(refs, true, 523.25, 0.28, { vol: 0.28 * scoreVol, delay: 0.12, type: 'triangle' }) // C5
      }
    },
    die: () => {
      if (!isEnabled) return
      if (soundMode === 'original') {
        // Classic Flappy 8-Bit Hit & Fall sound
        playTone(refs, true, 180, 0.12, { glide: -100, vol: 0.45, type: 'sawtooth' })
        playTone(refs, true, 500, 0.35, { glide: -350, vol: 0.35, type: 'square', delay: 0.12 })
      } else {
        // Multiverse Synth die
        playTone(refs, true, 240, 0.45, { glide: -160, vol: 0.4, type: 'sawtooth' })
        playSigh(refs, true, 0.2)
      }
    },
    near: () => {
      if (!isEnabled) return
      if (soundMode === 'original') {
        playTone(refs, true, 784, 0.08, { vol: 0.3, type: 'square' })
      } else {
        playTone(refs, true, 523.25, 0.12, { vol: 0.2, type: 'sine' })
      }
    },
    portal: () => {
      if (!isEnabled) return
      if (soundMode === 'original') {
        // 8-bit Teleport Arpeggio (C5 -> E5 -> G5 -> C6)
        playTone(refs, true, 523.25, 0.06, { vol: 0.25, type: 'square' })
        playTone(refs, true, 659.25, 0.06, { vol: 0.25, delay: 0.05, type: 'square' })
        playTone(refs, true, 783.99, 0.06, { vol: 0.25, delay: 0.1, type: 'square' })
        playTone(refs, true, 1046.5, 0.12, { vol: 0.3, delay: 0.15, type: 'square' })
      } else {
        playTone(refs, true, 220, 0.35, { glide: 260, vol: 0.3, type: 'sine' })
        playTone(refs, true, 480, 0.45, { glide: -180, vol: 0.22, type: 'triangle', delay: 0.08 })
      }
    },
    sneeze: () => {
      if (!isEnabled) return
      playTone(refs, true, 650, 0.05, { glide: 350, vol: 0.35, type: 'square' })
      playTone(refs, true, 160, 0.25, { glide: -110, vol: 0.38, type: 'sawtooth', delay: 0.04 })
    },
    thunder: () => {
      if (!isEnabled) return
      playTone(refs, true, 90, 0.85, { glide: -60, vol: 0.45, type: 'sawtooth' })
    },
    chime: () => {
      if (!isEnabled) return
      playTone(refs, true, 587.33, 0.35, { vol: 0.25, type: 'sine' })
      playTone(refs, true, 880.0, 0.45, { vol: 0.25, delay: 0.08, type: 'sine' })
    }
  }
}
