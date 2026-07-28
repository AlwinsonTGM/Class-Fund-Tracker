'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

interface MultiverseButtonProps {
  className?: string
}

function MultiverseTransition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'closing' | 'opening'>('closing')

  useEffect(() => {
    const t1 = setTimeout(() => {
      onComplete()
      setPhase('opening')
    }, 700)

    return () => clearTimeout(t1)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden bg-[#04070c]/60 backdrop-blur-md font-['Space_Grotesk']">
      {/* Top Atmospheric Dark Gate */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#0a0f16] via-[#0e1622] to-[#162032] border-b-4 border-purple-600/60 shadow-[0_20px_50px_rgba(147,51,234,0.4)] transition-transform duration-700 ease-in-out flex flex-col justify-end items-center pb-4 ${
          phase === 'closing' ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
      </div>

      {/* Bottom Atmospheric Dark Gate */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0f16] via-[#0e1622] to-[#162032] border-t-4 border-purple-600/60 shadow-[0_-20px_50px_rgba(147,51,234,0.4)] transition-transform duration-700 ease-in-out flex flex-col justify-start items-center pt-4 ${
          phase === 'closing' ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
      </div>

      {/* Center Atmospheric Badge */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-pulse">
        <div className="bg-[#0e1622] border-2 border-purple-500/80 px-6 py-3.5 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.5)] text-[#e9f0f7] font-['Special_Elite'] tracking-[2px] text-lg uppercase flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-400 animate-spin" />
          <span>ENTERING MULTIVERSE II...</span>
        </div>
        <span className="text-xs font-['Space_Grotesk'] text-purple-300/80 tracking-widest uppercase">forecast: 100% chance of feelings</span>
      </div>
    </div>
  )
}

export function MultiverseButton({ className }: MultiverseButtonProps) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleClick = () => {
    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    router.push('/multiverse-of-sadness')
  }

  return (
    <>
      <button
        id="multiverse-sadness-button"
        onClick={handleClick}
        title="Enter Multiverse of Sadness II (42 Universes & 861 Fusions)"
        className={`size-9 sm:size-10 flex items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-all cursor-pointer press-spring relative group shadow-sm ${className ?? ''}`}
        aria-label="Enter Multiverse of Sadness II"
      >
        <Sparkles className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
        {/* Subtle ping indicator pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
        </span>
      </button>

      {isTransitioning && (
        <MultiverseTransition onComplete={handleTransitionComplete} />
      )}
    </>
  )
}
