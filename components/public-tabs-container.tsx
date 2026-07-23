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
import { BirdButton } from '@/components/flappy-bird/bird-button'
import { Home, ClipboardList, MessageSquare, Lock, FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StudyHub } from '@/components/study-hub'
import { signOutAction } from '@/app/login/actions'

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


interface PublicTabsContainerProps {
  students: any[]
  payments: any[]
  weeks: any[]
  expenses: any[]
  logs: any[]
  tasks: Task[]
  posts: FreedomPost[]
  courses: any[]
  materials: any[]
  classDocs?: any[]
  postsError?: boolean
  tasksError?: boolean
  materialsError?: boolean
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
  materials,
  classDocs = [],
  tasksError = false,
  postsError = false,
  materialsError = false,
  user
}: PublicTabsContainerProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [addPostTrigger, setAddPostTrigger] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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
    { id: 'study', label: 'Study Hub', icon: <FileText className="h-4 w-4" /> },
    { id: 'freedom', label: 'Freedom Wall', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'portal', label: 'Portal', icon: <Lock className="h-4 w-4" /> }
  ]

  return (
    <div className="pb-28 relative"> {/* Extra padding bottom to prevent nav overlap */}

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

      {/* Header */}
      <header className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Bachelor of Science in Information Systems • BSIS 201</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              BSIS 201 Section Hub
            </h1>
          </div>
          <div className="flex items-center gap-2 relative">
            <ThemeToggle />
            <PatchNotesButton />
            <BirdButton />

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

        {activeTab === 'study' && (
          <StudyHub
            initialMaterials={materials}
            courses={courses}
            weeks={weeks}
            tasks={tasks}
            dbError={materialsError}
            user={user}
            initialClassDocs={classDocs}
          />
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
