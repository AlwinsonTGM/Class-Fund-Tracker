'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Home, ClipboardList, MessageSquare, Lock, Plus, DollarSign } from 'lucide-react'

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
  setActiveTab,
  isOfficer,
  onAddExpense,
  onAddTask,
  onAddPost
}: BottomNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Mount check for React Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Close floating menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const tabs = [
    { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'add', label: '', icon: <Plus className="h-5 w-5" />, isMiddle: true },
    { id: 'freedom', label: 'Wall', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'portal', label: 'Portal', icon: <Lock className="h-5 w-5" /> }
  ]

  // Find index for the sliding capsule (skipping the middle button)
  const getSlidingIndex = () => {
    switch (activeTab) {
      case 'home': return 0
      case 'tasks': return 1
      case 'freedom': return 3
      case 'portal': return 4
      default: return 0
    }
  }

  const slideIndex = getSlidingIndex()

  const navContent = (
    <>
      {/* Quick Action Floating Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[85%] max-w-xs rounded-3xl p-4 z-50 flex flex-col gap-2.5 anim-modal-card-in liquid-glass sm:hidden"
        >
          <div className="text-xs font-bold text-muted-foreground px-2 pb-1 border-b border-border/40 uppercase tracking-wider">
            Quick Actions
          </div>
          
          <button
            onClick={() => {
              setMenuOpen(false)
              if (onAddPost) onAddPost()
            }}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted text-sm text-foreground font-semibold text-left transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" /> Write on Freedom Wall
          </button>

          {isOfficer && (
            <>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  if (onAddTask) onAddTask()
                }}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted text-sm text-foreground font-semibold text-left transition-colors cursor-pointer"
              >
                <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" /> Create Pending Task
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false)
                  if (onAddExpense) onAddExpense()
                }}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-destructive/10 hover:text-destructive text-sm text-foreground font-semibold text-left transition-colors cursor-pointer"
              >
                <DollarSign className="h-4 w-4 shrink-0" /> Record New Expense
              </button>
            </>
          )}
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full p-2 z-40 flex items-center justify-between liquid-glass liquid-glass-sheen sm:hidden">
        
        {/* Sliding Capsule Background */}
        <div className="absolute inset-2 pointer-events-none">
          {activeTab !== 'add' && (
            <div
              className="h-full rounded-full transition-all duration-300 liquid-ease liquid-blob"
              style={{
                width: '20%',
                transform: `translateX(${slideIndex * 100}%) scale(0.9, 0.85)`
              }}
            />
          )}
        </div>

        {/* Navigation Items */}
        {tabs.map((tab, idx) => {
          if (tab.isMiddle) {
            return (
              <div key={tab.id} className="relative flex justify-center w-1/5">
                <button
                  ref={buttonRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`size-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 press-spring cursor-pointer ${
                    menuOpen ? 'rotate-45 bg-primary text-primary-foreground' : ''
                  }`}
                  aria-label="Quick Actions"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                </button>
              </div>
            )
          }

          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMenuOpen(false)
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
