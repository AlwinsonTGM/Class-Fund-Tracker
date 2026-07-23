'use client'

import React, { useEffect, useState } from 'react'
import { Gamepad2 } from 'lucide-react'

interface FlappyBirdTransitionProps {
  onComplete: () => void
  text?: string
}

export function FlappyBirdTransition({ onComplete, text = "ENTERING FLAPPY BIRD..." }: FlappyBirdTransitionProps) {
  const [phase, setPhase] = useState<'closing' | 'opening'>('closing')

  useEffect(() => {
    // Phase 1: Pipes close together (0 - 650ms)
    const t1 = setTimeout(() => {
      onComplete()
      setPhase('opening')
    }, 700)

    return () => {
      clearTimeout(t1)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden bg-sky-400/20 backdrop-blur-sm">
      {/* Top green pipe sliding down */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-emerald-600 via-emerald-500 to-green-400 border-b-8 border-emerald-950 shadow-2xl transition-transform duration-700 ease-in-out flex flex-col justify-end items-center pb-4 ${
          phase === 'closing' ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full h-8 bg-emerald-700 border-t-2 border-b-2 border-emerald-400/40" />
      </div>

      {/* Bottom green pipe sliding up */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-600 via-emerald-500 to-green-400 border-t-8 border-emerald-950 shadow-2xl transition-transform duration-700 ease-in-out flex flex-col justify-start items-center pt-4 ${
          phase === 'closing' ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full h-8 bg-emerald-700 border-t-2 border-b-2 border-emerald-400/40" />
      </div>

      {/* Center Arcade Badge */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-bounce">
        <div className="bg-amber-400 border-4 border-amber-950 px-6 py-3 rounded-2xl shadow-[0_8px_0_0_#78350f] text-amber-950 font-black tracking-wider text-xl uppercase flex items-center gap-3">
          <Gamepad2 className="h-7 w-7 text-amber-950 animate-spin" />
          <span>{text}</span>
        </div>
      </div>
    </div>
  )
}
