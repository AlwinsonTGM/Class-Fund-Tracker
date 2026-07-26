'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp } from 'lucide-react'

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!mounted || typeof window === 'undefined') return null

  return createPortal(
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={`fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 h-12 w-12 rounded-full liquid-glass flex items-center justify-center text-primary shadow-lg border border-primary/20 cursor-pointer press-spring transition-all duration-300 ${
        visible ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
    </button>,
    document.body
  )
}
