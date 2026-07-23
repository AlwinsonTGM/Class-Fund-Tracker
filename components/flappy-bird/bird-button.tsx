'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlappyBirdTransition } from './flappy-bird-transition'
import { Gamepad2 } from 'lucide-react'

interface BirdButtonProps {
  className?: string
}

export function BirdButton({ className }: BirdButtonProps) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleClick = () => {
    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    router.push('/flappy-bird')
  }

  return (
    <>
      <button
        id="flappy-bird-button"
        onClick={handleClick}
        title="Play Flappy Bird Arcade!"
        className={`size-9 flex items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer press-spring relative group shadow-sm ${className ?? ''}`}
        aria-label="Play Flappy Bird"
      >
        <Gamepad2 className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
        {/* Subtle ping indicator pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
      </button>

      {isTransitioning && (
        <FlappyBirdTransition onComplete={handleTransitionComplete} />
      )}
    </>
  )
}
