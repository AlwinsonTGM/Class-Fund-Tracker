'use client'

import React, { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { BalanceCard } from '@/components/balance-card'
import { OfficerPaymentList } from '@/components/officer-payment-list'
import { ManageWeeksPanel } from '@/components/manage-weeks-panel'
import { RecentActivity } from '@/components/recent-activity'
import { TasksSection, Task } from '@/components/tasks-section'
import { FreedomWall, FreedomPost } from '@/components/freedom-wall'
import { AddExpenseModal } from '@/components/add-expense-modal'
import { StudentPaymentList } from '@/components/student-payment-list'
import { PatchNotesModal, PatchNotesButton } from '@/components/patch-notes-modal'
import { Home, ClipboardList, MessageSquare, ShieldAlert, DollarSign, FileText, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StudyHub } from '@/components/study-hub'
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

interface FallingDogie {
  src: string
  left: number
  top: number
  speedY: number
  width: number
  rotation: number
  rotationSpeed: number
}

const DOGIE_GIFS = [
  '/akosidogie/akosidogie.gif',
  '/akosidogie/batute-akosidogie.gif',
  '/akosidogie/dogietankbuild.gif',
  '/akosidogie/dsasadas.gif',
  '/akosidogie/meme-excitement.gif',
  '/akosidogie/puwede.gif',
  '/akosidogie/shelo-akosidogie.gif',
  '/akosidogie/shh-akosidogie.gif'
]


interface OfficerTabsContainerProps {
  students: any[]
  payments: any[]
  weeks: any[]
  expenses: any[]
  logs: any[]
  tasks: Task[]
  posts: FreedomPost[]
  courses: any[]
  materials: any[]
  tasksError?: boolean
  postsError?: boolean
  materialsError?: boolean
  isModerator: boolean
  user: any
}

export function OfficerTabsContainer({
  students,
  payments,
  weeks,
  expenses,
  logs,
  tasks,
  posts,
  courses,
  materials,
  tasksError = false,
  postsError = false,
  materialsError = false,
  isModerator,
  user
}: OfficerTabsContainerProps) {
  // Start on the management portal view by default
  const [activeTab, setActiveTab] = useState('portal')
  const [addTaskTrigger, setAddTaskTrigger] = useState(false)
  const [addPostTrigger, setAddPostTrigger] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  
  // Customizable Canvas/Page Effects
  const [activeEffect, setActiveEffect] = useState<'none' | 'rain' | 'snow' | 'leaves'>('none')
  const [showSettings, setShowSettings] = useState(false)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<WeatherParticle[]>([])
  const [mounted, setMounted] = useState(false)

  // Dogie Easter Egg states
  const [eggClicks, setEggClicks] = useState(0)
  const [dogieActive, setDogieActive] = useState(false)
  const [dogies, setDogies] = useState<FallingDogie[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dogie animation loop
  useEffect(() => {
    if (!dogieActive) return

    const count = 12
    const initial: FallingDogie[] = Array.from({ length: count }).map(() => ({
      src: DOGIE_GIFS[Math.floor(Math.random() * DOGIE_GIFS.length)],
      left: Math.random() * 90,
      top: Math.random() * -800 - 150,
      speedY: Math.random() * 0.4 + 0.25, // very slow falling
      width: Math.random() * 60 + 50,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 0.3 - 0.15
    }))
    setDogies(initial)

    let active = true
    let lastTime = performance.now()

    const update = (time: number) => {
      if (!active) return
      const delta = time - lastTime
      lastTime = time

      setDogies(prev => 
        prev.map(d => {
          let newTop = d.top + d.speedY * (delta * 0.1)
          let newRotation = d.rotation + d.rotationSpeed * (delta * 0.1)
          
          if (newTop > (typeof window !== 'undefined' ? window.innerHeight : 800) + 150) {
            newTop = -150
            return {
              ...d,
              left: Math.random() * 90,
              top: -150,
              speedY: Math.random() * 0.4 + 0.25,
              width: Math.random() * 60 + 50,
              rotation: Math.random() * 360,
              rotationSpeed: Math.random() * 0.3 - 0.15
            }
          }
          return { ...d, top: newTop, rotation: newRotation }
        })
      )

      requestAnimationFrame(update)
    }

    const animFrame = requestAnimationFrame(update)
    return () => {
      active = false
      cancelAnimationFrame(animFrame)
    }
  }, [dogieActive])

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.weather-settings-trigger') && !target.closest('.weather-settings-dropdown')) {
        setShowSettings(false)
      }
    }
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
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

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (canvas) {
          canvas.width = entry.contentRect.width || canvas.clientWidth || window.innerWidth
          canvas.height = entry.contentRect.height || canvas.clientHeight || window.innerHeight
        }
      }
    })
    resizeObserver.observe(canvas)

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
      resizeObserver.disconnect()
      cancelAnimationFrame(animationId)
    }
  }, [activeEffect, mounted])

  // Hidden button ref to trigger AddExpenseModal from BottomNav
  const addExpenseBtnRef = useRef<HTMLButtonElement>(null)



  // Calculate calculations
  const totalContributions = payments.filter(p => p.status === 'paid').length * 5
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const netBalance = totalContributions - totalExpenses

  const triggerAddExpense = () => {
    // Locate the trigger button of AddExpenseModal and click it
    if (addExpenseBtnRef.current) {
      addExpenseBtnRef.current.click()
    }
  }

  const desktopTabs = [
    { id: 'portal', label: 'Officer Portal', icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'home', label: 'Student View', icon: <Home className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'study', label: 'Study Hub', icon: <FileText className="h-4 w-4" /> },
    { id: 'freedom', label: 'Freedom Wall', icon: <MessageSquare className="h-4 w-4" /> }
  ]

  return (
    <div className="pb-28 relative"> {/* Extra padding bottom to prevent nav overlap */}
      {/* Weather Particle Simulation Overlay Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      />

      {/* Dogie Easter Egg Falling Container (rendered behind everything with z-[-10]) */}
      {dogieActive && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-10]">
          {dogies.map((dogie, i) => (
            <img
              key={i}
              src={dogie.src}
              style={{
                position: 'absolute',
                left: `${dogie.left}%`,
                top: `${dogie.top}px`,
                width: `${dogie.width}px`,
                height: 'auto',
                opacity: 0.16, // subtle watermark opacity
                transform: `rotate(${dogie.rotation}deg)`,
                pointerEvents: 'none',
              }}
              alt="easter egg"
            />
          ))}
        </div>
      )}

      {/* Auto-popup patch notes on first visit */}
      <PatchNotesModal />
      
      {/* Invisible container holding the AddExpenseModal trigger */}
      <div className="hidden">
        <AddExpenseModal />
      </div>

      {/* Header */}
      <header className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Officer Management Portal</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Officer Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 relative">
            <ThemeToggle />
            <PatchNotesButton />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(!showSettings)
                setEggClicks(prev => {
                  const next = prev + 1
                  if (next >= 10 && !dogieActive) {
                    setDogieActive(true)
                  }
                  return next
                })
              }}
              className="weather-settings-trigger bg-card text-foreground border border-border hover:bg-muted size-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-all press-spring"
              title="Page Effects & Background Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Page Effects Settings Modal/Dropdown */}
            {showSettings && (
              <div 
                className="weather-settings-dropdown absolute top-10 right-0 bg-white/95 dark:bg-zinc-900/95 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl dark:shadow-2xl z-50 backdrop-blur-md text-[11px] font-sans w-56 flex flex-col gap-3.5 anim-fade-in pointer-events-auto"
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

            {/* Direct Record Expense button for desktop */}
            <button
              onClick={triggerAddExpense}
              className="hidden sm:flex text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25 rounded-full px-3.5 py-1.5 cursor-pointer press-spring items-center gap-1.5"
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Record Expense</span>
            </button>

            {/* Render the AddExpenseModal so we can target it via click delegation */}
            <div className="hidden" ref={el => {
              if (el) {
                const btn = el.querySelector('button')
                if (btn) {
                  // Reference the button
                  (addExpenseBtnRef as any).current = btn
                }
              }
            }}>
              <AddExpenseModal />
            </div>

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
          </div>
        </div>
        <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
          Logged in as <strong className="text-foreground">{user.email}</strong>. Manage payments, expenses, tasks, and posts.
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
                  setAddTaskTrigger(false)
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

        {activeTab === 'portal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-slide-in">
            {/* Left Column: Stats, Manage Weeks, and Activity */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
              <BalanceCard balance={netBalance} />
              <ManageWeeksPanel weeks={weeks} />
              <RecentActivity activities={logs} isModerator={isModerator} />
            </div>
            {/* Right Column: Officer Student Checklist */}
            <div className="lg:col-span-7">
              <OfficerPaymentList students={students} initialPayments={payments} weeks={weeks} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksSection
            initialTasks={tasks}
            isOfficer={true}
            courses={courses}
            dbError={tasksError}
            triggerAddOpen={addTaskTrigger}
            onCloseAddTrigger={() => setAddTaskTrigger(false)}
            user={user}
          />
        )}

        {activeTab === 'study' && (
          <StudyHub
            initialMaterials={materials}
            courses={courses}
            weeks={weeks}
            tasks={tasks}
            dbError={materialsError}
            user={user}
          />
        )}

        {activeTab === 'freedom' && (
          <FreedomWall
            initialPosts={posts}
            isOfficer={true}
            dbError={postsError}
            triggerAddOpen={addPostTrigger}
            onCloseAddTrigger={() => setAddPostTrigger(false)}
            user={user}
          />
        )}
      </div>

      {/* Dedicated spacer to prevent BottomNav overlapping lowest scrollable content */}
      <div className="h-36 pointer-events-none" aria-hidden="true" />

      {/* Bottom Floating Navigation for Officers */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOfficer={true}
        onAddExpense={triggerAddExpense}
        onAddTask={() => {
          setActiveTab('tasks')
          setAddTaskTrigger(true)
        }}
        onAddPost={() => {
          setActiveTab('freedom')
          setAddPostTrigger(true)
        }}
      />
    </div>
  )
}
