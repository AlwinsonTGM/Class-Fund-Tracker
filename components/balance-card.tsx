'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(balance)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(hover: none)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 3D tilt + magnetic glow (desktop only)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Tilt: max ±6 degrees
    const rotateY = ((x - centerX) / centerX) * 6
    const rotateX = ((centerY - y) / centerY) * 4

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`

    // Glow follows cursor
    glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 60%)`
  }, [isMobile])

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsHovering(true)
  }, [isMobile])

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return
    setIsHovering(false)
    const card = cardRef.current
    const glow = glowRef.current
    if (card) card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    if (glow) glow.style.background = 'transparent'
  }, [isMobile])

  // Mobile spring press
  const handleTouchStart = () => setIsPressed(true)
  const handleTouchEnd = () => setIsPressed(false)

  return (
    <section
      aria-labelledby="balance-heading"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background shadow-lg sm:p-8 gpu-accelerate anim-fade-slide-in"
      style={{
        transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease',
        transformStyle: 'preserve-3d',
        ...(isPressed ? { transform: 'scale(0.97)' } : {}),
        ...(isHovering ? { boxShadow: '0 20px 50px -12px rgba(0,0,0,0.35)' } : {}),
      }}
    >
      {/* Magnetic glow overlay */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
        style={{ transition: 'background 100ms ease' }}
      />

      <div className="relative z-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-background/60 sm:text-xs">Class Treasury</p>
          <div className="flex flex-col gap-0.5">
            <h2 id="balance-heading" className="text-xs font-medium text-background/60 sm:text-sm">Total Fund Balance</h2>
            <p className="text-3xl font-bold tracking-tight text-background sm:text-5xl" style={{ wordBreak: 'break-word' }}>
              {formattedBalance}
            </p>
          </div>
        </div>
        <p className="w-fit rounded-full border border-background/20 px-3 py-1.5 text-[10px] font-semibold text-background/70 sm:text-xs">
          Updated today
        </p>
      </div>
    </section>
  )
}
