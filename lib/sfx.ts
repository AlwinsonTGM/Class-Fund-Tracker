'use client';

/**
 * Retro square-wave sound synthesizer engine using Web AudioContext.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

export function setMuted(muted: boolean) {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}

export function playSfx(name: 'coin' | 'pickup' | 'correct' | 'wrong' | 'click' | 'join' | 'pop' | 'door') {
  if (isMuted || typeof window === 'undefined') return;

  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const sequences: Record<string, Array<[number, number]>> = {
      coin: [[880, 0.07], [1318, 0.1]],
      pickup: [[523, 0.06], [784, 0.09]],
      correct: [[659, 0.07], [880, 0.07], [1175, 0.11]],
      wrong: [[233, 0.13], [174, 0.17]],
      click: [[440, 0.05]],
      join: [[523, 0.07], [659, 0.07], [784, 0.13]],
      pop: [[660, 0.04]],
      door: [[280, 0.08], [370, 0.09], [520, 0.14]],
    };

    const seq = sequences[name] || [[440, 0.05]];
    let t = audioCtx.currentTime;

    seq.forEach(([freq, duration]) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.02);

      t += duration * 0.85;
    });
  } catch (e) {
    console.warn('AudioContext SFX playback error:', e);
  }
}
