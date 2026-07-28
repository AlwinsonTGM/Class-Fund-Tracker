'use client'

import React, { useEffect, useRef } from 'react'

interface ConfettiCanvasProps {
  durationMs?: number
  onComplete?: () => void
}

export function ConfettiCanvas({ durationMs = 3000, onComplete }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const startTime = performance.now()

    const colors = [
      '#f59e0b', '#ec4899', '#3b82f6', '#10b981',
      '#8b5cf6', '#ef4444', '#06b6d4', '#eab308'
    ]

    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1
    }))

    const render = (now: number) => {
      const elapsed = now - startTime
      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        p.rotation += p.rotationSpeed

        if (elapsed > durationMs - 800) {
          p.opacity = Math.max(0, 1 - (elapsed - (durationMs - 800)) / 800)
        }

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      })

      if (elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, width, height)
        onComplete?.()
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [durationMs, onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[120]"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
