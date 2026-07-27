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

import type { User } from '@supabase/supabase-js'
import { AuditLogItem } from '@/components/recent-activity'
import { Course, StudyMaterial, ClassDocument } from '@/components/study-hub/types'

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

export interface ContainerStudent {
  id: number
  first_name: string
  last_name: string | null
  seat_number: number
  student_id_number?: string
}

export interface ContainerPayment {
  id: number
  student_id: number
  week_number: number
  status: string
  amount?: number
  paid_at?: string | null
  created_at?: string
  receipt_id?: number | null
}

export interface ContainerWeek {
  id: number
  week_number: number
  date_range: string
  status: string
  [key: string]: unknown
}

export interface ContainerExpense {
  id: number
  description: string
  amount: number
  recorded_by?: string
  category?: string
  created_at?: string
}

interface PublicTabsContainerProps {
  students: ContainerStudent[]
  payments: ContainerPayment[]
  weeks: ContainerWeek[]
  expenses: ContainerExpense[]
  logs: AuditLogItem[]
  tasks: Task[]
  posts: FreedomPost[]
  courses: Course[]
  materials: StudyMaterial[]
  classDocs?: ClassDocument[]
  postsError?: boolean
  tasksError?: boolean
  materialsError?: boolean
  user: User | null
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
      speedY: Math.random() * 0.4 + 0.25,
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

  // Scroll to top when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [activeTab])

  // Calculate stats
  const totalContributions = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : 5.0), 0)
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
    <div className="pb-28 relative">
      {/* Dogie Easter Egg Falling Container */}
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
                opacity: 0.16,
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

      {/* Header Container (Natural Scroll on Mobile & Desktop) */}
      <header className="relative w-full mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-primary">Bachelor of Science in Information Systems • BSIS 201</p>
            <h1 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              BSIS 201 Section Hub
            </h1>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <ThemeToggle />
              <PatchNotesButton />
              <BirdButton />
            </div>

            {user && (
              <form 
                action={signOutAction} 
                onSubmit={() => setSigningOut(true)} 
                className="shrink-0"
              >
                <button
                  type="submit"
                  disabled={signingOut}
                  className="px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-full cursor-pointer press-spring flex items-center justify-center gap-1.5"
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
        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 border border-border/40 rounded-2xl w-fit mt-4">
          {desktopTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setAddPostTrigger(false)
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 press-spring ${
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

      {/* Tab Panes Container */}
      <div className="w-full">
        {/* Tab Pane 1: Home */}
        <div className={`w-full ${activeTab === 'home' ? 'block' : 'hidden'}`}>
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
        </div>

        {/* Tab Pane 2: Tasks */}
        <div className={`w-full ${activeTab === 'tasks' ? 'block animate-fade-slide-in' : 'hidden'}`}>
          <TasksSection initialTasks={tasks} isOfficer={false} courses={courses} dbError={tasksError} user={user} />
        </div>

        {/* Tab Pane 3: Study Hub */}
        <div className={`w-full ${activeTab === 'study' ? 'block animate-fade-slide-in' : 'hidden'}`}>
          <StudyHub
            initialMaterials={materials}
            courses={courses}
            weeks={weeks}
            tasks={tasks}
            dbError={materialsError}
            user={user}
            initialClassDocs={classDocs}
          />
        </div>

        {/* Tab Pane 4: Freedom Wall */}
        <div className={`w-full ${activeTab === 'freedom' ? 'block animate-fade-slide-in' : 'hidden'}`}>
          <FreedomWall
            initialPosts={posts}
            isOfficer={false}
            dbError={postsError}
            triggerAddOpen={addPostTrigger}
            onCloseAddTrigger={() => setAddPostTrigger(false)}
            user={user}
          />
        </div>

        {/* Tab Pane 5: Portal */}
        <div className={`w-full ${activeTab === 'portal' ? 'block' : 'hidden'}`}>
          {!user ? (
            <InlineLogin />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-semibold text-muted-foreground">Redirecting to Officer Portal...</p>
            </div>
          )}
        </div>
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
