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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioCtx()
    const masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime)
    masterGain.connect(audioCtx.destination)

    const rainGain = audioCtx.createGain()
    rainGain.gain.setValueAtTime(0.04, audioCtx.currentTime)
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
    audioCtx.resume()
  }

  const { type = 'sine', vol = 0.08, attack = 0.012, glide = 0, delay = 0 } = options
  const startTime = audioCtx.currentTime + delay
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  if (glide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + glide), startTime + dur)
  }

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur)

  osc.connect(gain)
  gain.connect(masterGain)

  osc.start(startTime)
  osc.stop(startTime + dur + 0.05)
}

export function playSigh(refs: AudioRefs, soundEnabled: boolean, vol = 0.03) {
  const { audioCtx, masterGain } = refs
  if (!audioCtx || !masterGain || !soundEnabled) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const startTime = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(260, startTime)
  osc.frequency.exponentialRampToValueAtTime(110, startTime + 0.65)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.12)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65)

  osc.connect(gain)
  gain.connect(masterGain)

  osc.start(startTime)
  osc.stop(startTime + 0.7)
}

export const createSfxManager = (refs: AudioRefs, soundEnabled: boolean) => ({
  flap: () => {
    playTone(refs, soundEnabled, 280, 0.1, { glide: 140, vol: 0.09, type: 'triangle' })
    playTone(refs, soundEnabled, 190, 0.2, { glide: -60, vol: 0.04, type: 'sine', delay: 0.03 })
  },
  score: () => {
    playTone(refs, soundEnabled, 349.23, 0.18, { vol: 0.06 }) // F4
    playTone(refs, soundEnabled, 440.0, 0.35, { vol: 0.07, delay: 0.08 }) // A4
  },
  die: () => {
    playTone(refs, soundEnabled, 180, 0.45, { glide: -110, vol: 0.14, type: 'sawtooth' })
    playSigh(refs, soundEnabled, 0.06)
  },
  near: () => {
    playTone(refs, soundEnabled, 523.25, 0.12, { vol: 0.05, type: 'sine' })
  },
  portal: () => {
    playTone(refs, soundEnabled, 220, 0.4, { glide: 220, vol: 0.07, type: 'sine' })
    playTone(refs, soundEnabled, 440, 0.5, { glide: -150, vol: 0.05, type: 'triangle', delay: 0.1 })
  },
  sneeze: () => {
    playTone(refs, soundEnabled, 600, 0.05, { glide: 400, vol: 0.1, type: 'square' })
    playTone(refs, soundEnabled, 150, 0.25, { glide: -100, vol: 0.12, type: 'sawtooth', delay: 0.05 })
  },
  thunder: () => {
    playTone(refs, soundEnabled, 80, 0.8, { glide: -50, vol: 0.2, type: 'sawtooth' })
  },
  chime: () => {
    playTone(refs, soundEnabled, 587.33, 0.4, { vol: 0.08, type: 'sine' })
    playTone(refs, soundEnabled, 880.0, 0.5, { vol: 0.08, delay: 0.1, type: 'sine' })
  }
})
