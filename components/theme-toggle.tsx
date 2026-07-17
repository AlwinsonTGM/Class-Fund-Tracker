'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setIsAnimating(true)
    setTheme(nextTheme)

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }

    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Toggle to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/80 cursor-pointer text-base shadow-sm select-none press-spring ${
        isAnimating ? 'anim-theme-spin' : ''
      }`}
      style={{ transition: 'background-color 200ms var(--ease-swift), border-color 200ms var(--ease-swift)' }}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
