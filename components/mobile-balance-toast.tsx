'use client'

import React, { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, X, Wallet } from 'lucide-react'

interface MobileBalanceToastProps {
  balance: number
}

export function MobileBalanceToast({ balance }: MobileBalanceToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [delta, setDelta] = useState<number | null>(null)
  
  const prevBalanceRef = useRef(balance)
  const isInitialMount = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const startAnimTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevBalanceRef.current = balance
      setDisplayBalance(balance)
      return
    }

    const prev = prevBalanceRef.current
    if (prev !== balance) {
      const diff = balance - prev
      setDelta(diff)
      setIsVisible(true)
      prevBalanceRef.current = balance

      // Reset auto-dismiss timer on new update (3.5s)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setDelta(null)
      }, 3500)

      // Smooth number animation (400ms lerp)
      const startValue = displayBalance
      const targetValue = balance
      const duration = 400
      startAnimTimeRef.current = performance.now()

      const step = (now: number) => {
        if (!startAnimTimeRef.current) return
        const elapsed = now - startAnimTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const current = startValue + (targetValue - startValue) * easeProgress
        setDisplayBalance(current)

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step)
        } else {
          setDisplayBalance(targetValue)
        }
      }

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(step)
    }
  }, [balance])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  if (!isVisible) return null

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(displayBalance)

  const formattedDelta = delta !== null ? `${delta > 0 ? '+' : ''}${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(delta)}` : ''

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed top-4 right-4 z-[9999] sm:hidden max-w-[280px] w-auto pointer-events-auto"
      style={{ animation: 'stagger-in 300ms var(--ease-spring-smooth) both' }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-foreground p-3 text-background shadow-2xl backdrop-blur-md">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
          delta && delta < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
        }`}>
          {delta && delta < 0 ? (
            <TrendingDown className="h-5 w-5" />
          ) : (
            <TrendingUp className="h-5 w-5" />
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-background/70">Total Balance</span>
            {delta !== null && (
              <span className={`text-[11px] font-extrabold px-1.5 py-0.2 rounded-full ${
                delta > 0 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/30 text-rose-300 border border-rose-500/30'
              }`}>
                {formattedDelta}
              </span>
            )}
          </div>
          <p className="text-base font-extrabold tracking-tight text-background truncate">
            {formattedBalance}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="size-6 text-background/60 hover:text-background flex items-center justify-center rounded-full shrink-0 -mr-1 cursor-pointer"
          aria-label="Dismiss balance popup"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
