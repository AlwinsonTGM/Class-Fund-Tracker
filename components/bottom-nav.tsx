'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Home, ClipboardList, MessageSquare, Lock, Plus, DollarSign, FileText } from 'lucide-react'

export interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOfficer: boolean
  onAddExpense?: () => void
  onAddTask?: () => void
  onAddPost?: () => void
}

export function BottomNav({
  activeTab,
  setActiveTab
}: BottomNavProps) {
  const [mounted, setMounted] = useState(false)
  
  // Mount check for React Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'study', label: 'Study', icon: <FileText className="h-5 w-5" /> },
    { id: 'freedom', label: 'Wall', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'portal', label: 'Portal', icon: <Lock className="h-5 w-5" /> }
  ]

  // Find index for the sliding capsule
  const getSlidingIndex = () => {
    switch (activeTab) {
      case 'home': return 0
      case 'tasks': return 1
      case 'study': return 2
      case 'freedom': return 3
      case 'portal': return 4
      default: return 0
    }
  }

  const slideIndex = getSlidingIndex()

  const navContent = (
    <>
      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full p-2 z-40 flex items-center justify-between liquid-glass liquid-glass-sheen sm:hidden">
        
        {/* Sliding Capsule Background */}
        <div className="absolute inset-2 pointer-events-none">
          <div
            className="h-full rounded-full transition-all duration-300 liquid-ease liquid-blob"
            style={{
              width: '20%',
              transform: `translateX(${slideIndex * 100}%) scale(0.9, 0.85)`
            }}
          />
        </div>

        {/* Navigation Items */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
              }}
              className="relative flex items-center justify-center w-1/5 h-12 rounded-full cursor-pointer group"
            >
              <span className={`transition-all duration-300 transform ${
                isActive ? '-translate-y-2 scale-105 filter drop-shadow-sm' : 'translate-y-0 opacity-70 group-hover:opacity-100'
              }`}>
                {tab.icon}
              </span>
              <span className={`absolute bottom-1 text-[9px] font-bold tracking-wide transition-all duration-300 transform ${
                isActive ? 'translate-y-0 opacity-100 text-primary' : 'translate-y-2 opacity-0 pointer-events-none'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )

  if (!mounted || typeof window === 'undefined') return null

  return createPortal(navContent, document.body)
}
