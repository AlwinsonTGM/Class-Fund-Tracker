'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { BalanceCard } from '@/components/balance-card'
import { StudentPaymentList } from '@/components/student-payment-list'
import { RecentActivity } from '@/components/recent-activity'
import { TasksSection, Task } from '@/components/tasks-section'
import { FreedomWall, FreedomPost } from '@/components/freedom-wall'
import { InlineLogin } from '@/components/inline-login'
import { PatchNotesModal, PatchNotesButton } from '@/components/patch-notes-modal'
import { Home, ClipboardList, MessageSquare, Lock, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOutAction } from '@/app/login/actions'

interface WeatherParticle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  sway: number
  swaySpeed: number
  angle?: number
  spin?: number
  emoji?: string
}

interface PublicTabsContainerProps {
  students: any[]
  payments: any[]
  weeks: any[]
  expenses: any[]
  logs: any[]
  tasks: Task[]
  posts: FreedomPost[]
  courses: any[]
  postsError?: boolean
  tasksError?: boolean
  user: any
}

export function PublicTabsContainer({
  students,
  payments,
  weeks,
  expenses,
  logs,
  tasks,
  posts,
  courses,
  tasksError = false,
  postsError = false,
  user
}: PublicTabsContainerProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [addPostTrigger, setAddPostTrigger] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Customizable Canvas/Page Effects
  const [activeEffect, setActiveEffect] = useState<'none' | 'rain' | 'snow' | 'leaves'>('none')
  const [showSettings, setShowSettings] = useState(false)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<WeatherParticle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])



  // Falling Weather Particle Simulation rendering loop
  useEffect(() => {
    if (!mounted || activeEffect === 'none') {
      const canvas = particleCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = particleCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const count = activeEffect === 'rain' ? 120 : 60
    const list: WeatherParticle[] = []
    const leafEmojis = ['🍂', '🍁', '🍃', '🍀']
    
    for (let i = 0; i < count; i++) {
      list.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: activeEffect === 'rain'
          ? Math.random() * 1.5 + 0.8
          : activeEffect === 'snow'
          ? Math.random() * 3.5 + 1.5
          : Math.random() * 8 + 12, // font size
        speedY: activeEffect === 'rain'
          ? Math.random() * 7 + 12
          : activeEffect === 'snow'
          ? Math.random() * 1.2 + 0.8
          : Math.random() * 1.0 + 0.6,
        speedX: activeEffect === 'rain'
          ? -1.5
          : Math.random() * 1.0 - 0.5,
        opacity: Math.random() * 0.5 + 0.35,
        sway: Math.random() * 100,
        swaySpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.02 - 0.01,
        emoji: activeEffect === 'leaves'
          ? leafEmojis[Math.floor(Math.random() * leafEmojis.length)]
          : undefined
      })
    }
    particlesRef.current = list

    let animationId: number

    const drawParticles = () => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(p => {
        p.y += p.speedY
        
        if (activeEffect === 'snow') {
          p.sway += p.swaySpeed
          p.x += Math.sin(p.sway) * 0.5
        } else if (activeEffect === 'leaves') {
          p.sway += p.swaySpeed
          p.x += Math.sin(p.sway) * 0.7
          if (p.angle !== undefined && p.spin !== undefined) {
            p.angle += p.spin
          }
        } else {
          p.x += p.speedX
        }

        // Reset particles out of bounds
        if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
          p.opacity = Math.random() * 0.5 + 0.35
        }

        ctx.save()
        ctx.globalAlpha = p.opacity

        if (activeEffect === 'rain') {
          ctx.strokeStyle = 'rgba(156, 163, 175, 0.45)'
          ctx.lineWidth = p.size
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.speedY * 1.2)
          ctx.stroke()
        } else if (activeEffect === 'snow') {
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (activeEffect === 'leaves' && p.emoji) {
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle || 0)
          ctx.font = `${p.size}px sans-serif`
          ctx.fillText(p.emoji, -p.size / 2, p.size / 2)
        }

        ctx.restore()
      })

      animationId = requestAnimationFrame(drawParticles)
    }

    drawParticles()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [activeEffect, mounted])

  // Read URL search params on mount to handle redirects from /login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('tab') === 'portal') {
        setActiveTab('portal')
      }
    }
  }, [])

  // Handle portal tab redirect only when authenticated
  useEffect(() => {
    if (activeTab === 'portal' && user) {
      window.location.href = '/officer-dashboard'
    }
  }, [activeTab, user])

  // Calculate stats
  const totalContributions = payments.filter(p => p.status === 'paid').length * 5
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const netBalance = totalContributions - totalExpenses

  const desktopTabs = [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'freedom', label: 'Freedom Wall', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'portal', label: 'Portal', icon: <Lock className="h-4 w-4" /> }
  ]

  return (
    <div className="pb-28 relative"> {/* Extra padding bottom to prevent nav overlap */}
      {/* Weather Particle Simulation Overlay Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      />

      {/* Auto-popup patch notes on first visit */}
      <PatchNotesModal />

      {/* Header */}
      <header className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">School Year 2026–2027</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Class Fund Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 relative">
            <ThemeToggle />
            <PatchNotesButton />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(!showSettings)
              }}
              className="bg-card text-foreground border border-border hover:bg-muted size-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-all press-spring"
              title="Page Effects & Background Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Page Effects Settings Modal/Dropdown */}
            {showSettings && (
              <div 
                className="absolute top-10 right-0 bg-white/95 dark:bg-zinc-900/95 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl dark:shadow-2xl z-50 backdrop-blur-md text-[11px] font-sans w-56 flex flex-col gap-3.5 anim-fade-in pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                  <span className="font-bold text-xs">Weather Settings 🌧️</span>
                  <button 
                    onClick={() => setShowSettings(false)} 
                    className="text-muted-foreground hover:text-foreground text-[10px] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* Falling Weather Effects */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Falling Weather:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'none', label: 'None', emoji: '❌' },
                      { id: 'rain', label: 'Rain', emoji: '🌧️' },
                      { id: 'snow', label: 'Snow', emoji: '❄️' },
                      { id: 'leaves', label: 'Leaves', emoji: '🍂' }
                    ].map(eff => (
                      <button
                        type="button"
                        key={eff.id}
                        onClick={() => setActiveEffect(eff.id as any)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[9px] font-semibold cursor-pointer transition-all ${
                          activeEffect === eff.id
                            ? 'ring-2 ring-primary border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="text-sm">{eff.emoji}</span>
                        <span>{eff.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {user && (
              <form 
                action={signOutAction} 
                onSubmit={() => setSigningOut(true)} 
                className="shrink-0"
              >
                <button
                  type="submit"
                  disabled={signingOut}
                  className="text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-full px-3 py-1.5 cursor-pointer press-spring flex items-center gap-1.5"
                >
                  {signingOut && <span className="h-3 w-3 animate-spin rounded-full border border-destructive border-t-transparent" />}
                  <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
          A simple overview of our class contributions and activities.
        </p>

        {/* Desktop Top Tab Navigation */}
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-muted/60 dark:bg-muted/30 border border-border/40 rounded-2xl w-fit mt-4">
          {desktopTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setAddPostTrigger(false)
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 press-spring ${
                  isActive 
                    ? 'bg-card text-foreground shadow-sm border border-border/10' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Conditional Rendering Based on Active Tab */}
      <div className="anim-fade-slide-in">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-slide-in">
            {/* Left Column: Stats & Recent Activity */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
              <BalanceCard balance={netBalance} />
              <RecentActivity activities={logs} />
            </div>
            {/* Right Column: Student Checklist */}
            <div className="lg:col-span-7">
              <StudentPaymentList students={students} payments={payments} weeks={weeks} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksSection initialTasks={tasks} isOfficer={false} courses={courses} dbError={tasksError} user={user} />
        )}

        {activeTab === 'freedom' && (
          <FreedomWall
            initialPosts={posts}
            isOfficer={false}
            dbError={postsError}
            triggerAddOpen={addPostTrigger}
            onCloseAddTrigger={() => setAddPostTrigger(false)}
            user={user}
          />
        )}

        {activeTab === 'portal' && !user && (
          <InlineLogin />
        )}

        {activeTab === 'portal' && user && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-semibold text-muted-foreground">Redirecting to Officer Portal...</p>
          </div>
        )}
      </div>

      {/* Dedicated spacer to prevent BottomNav overlapping lowest scrollable content */}
      <div className="h-36 pointer-events-none" aria-hidden="true" />

      {/* Bottom Floating Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOfficer={false}
        onAddPost={() => {
          setActiveTab('freedom')
          setAddPostTrigger(true)
        }}
      />
    </div>
  )
}
