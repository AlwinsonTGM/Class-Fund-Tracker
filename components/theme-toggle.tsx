'use client'

import React, { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Determine initial theme from document class
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Toggle to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer text-sm shadow-sm select-none"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
