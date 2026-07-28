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

  // Animated display balance & delta tracking
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [delta, setDelta] = useState<number | null>(null)
  const [isPulsing, setIsPulsing] = useState(false)
  const prevBalanceRef = useRef(balance)
  const startAnimTimeRef = useRef<number | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const deltaTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(hover: none)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Smooth numeric counter animation on balance change
  useEffect(() => {
    const prev = prevBalanceRef.current
    if (prev !== balance) {
      const diff = balance - prev
      setDelta(diff)
      setIsPulsing(true)

      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current)
      deltaTimeoutRef.current = setTimeout(() => {
        setDelta(null)
        setIsPulsing(false)
      }, 2400)

      const startValue = displayBalance
      const targetValue = balance
      const duration = 400 // ms
      startAnimTimeRef.current = performance.now()

      const step = (now: number) => {
        if (!startAnimTimeRef.current) return
        const elapsed = now - startAnimTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const current = startValue + (targetValue - startValue) * easeProgress
        setDisplayBalance(current)

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step)
        } else {
          setDisplayBalance(targetValue)
          prevBalanceRef.current = targetValue
        }
      }

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(step)
    }
  }, [balance])

  // Cleanup timers & animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current)
    }
  }, [])

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(displayBalance)

  const formattedDelta = delta !== null ? `${delta > 0 ? '+' : ''}${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(delta)}` : ''

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
      className={`relative overflow-hidden rounded-3xl bg-foreground p-4.5 text-background shadow-lg sm:p-6 md:p-8 gpu-accelerate anim-fade-slide-in transition-all duration-300 ${
        isPulsing ? 'ring-4 ring-primary/40 ring-offset-2 ring-offset-background scale-[1.01]' : ''
      }`}
      style={{
        transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease, ring 300ms ease',
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
            <div className="relative inline-flex items-center gap-2.5 flex-nowrap min-w-0 max-w-full">
              <p className="text-2xl font-bold tracking-tight text-background sm:text-4xl md:text-5xl truncate shrink-0">
                {formattedBalance}
              </p>
              {delta !== null && (
                <span
                  className={`inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                    delta > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  }`}
                  style={{ animation: 'stagger-in 300ms var(--ease-spring-smooth) both' }}
                >
                  {formattedDelta}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="w-fit rounded-full border border-background/20 px-3 py-1.5 text-[10px] font-semibold text-background/70 sm:text-xs">
          Updated live
        </p>
      </div>
    </section>
  )
}

