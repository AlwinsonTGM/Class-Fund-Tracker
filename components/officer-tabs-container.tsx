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
import { Home, ClipboardList, MessageSquare, ShieldAlert, DollarSign, FileText } from 'lucide-react'
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
  classDocs?: any[]
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
  classDocs = [],
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
  
  const [mounted, setMounted] = useState(false)

  // Dogie Easter Egg states
  const [eggClicks, setEggClicks] = useState(0)
  const [dogieActive, setDogieActive] = useState(false)
  const [dogies, setDogies] = useState<FallingDogie[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])



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
            initialClassDocs={classDocs}
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
