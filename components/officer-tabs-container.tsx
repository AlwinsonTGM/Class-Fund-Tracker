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
import { BirdButton } from '@/components/flappy-bird/bird-button'
import { Home, ClipboardList, MessageSquare, ShieldAlert, DollarSign, FileText, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StudyHub } from '@/components/study-hub'
import { signOutAction } from '@/app/login/actions'
import { OfficerReceiptApprovalQueue, ReceiptItem } from '@/components/officer-receipt-approval-queue'
import { FinancialAuditReportModal } from '@/components/financial-audit-report-modal'
import { OfficerSidebarDrawer } from '@/components/officer-sidebar-drawer'
import {
  generatePaymentMatrixCSV,
  generatePaymentsCSV,
  generateExpensesCSV,
  downloadCSV
} from '@/lib/csv-exporter'

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

import type { User } from '@supabase/supabase-js'
import { AuditLogItem } from '@/components/recent-activity'
import { Course, StudyMaterial, ClassDocument } from '@/components/study-hub/types'

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

interface OfficerTabsContainerProps {
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
  receipts?: ReceiptItem[]
  tasksError?: boolean
  postsError?: boolean
  materialsError?: boolean
  isModerator: boolean
  user: User
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
  receipts = [],
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

  // Scroll snap container refs and state for mobile swipe synchronization
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const tabOrder = ['home', 'tasks', 'study', 'freedom', 'portal']
  const activeTabRef = useRef(activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  // Dogie Easter Egg states
  const [eggClicks, setEggClicks] = useState(0)
  const [dogieActive, setDogieActive] = useState(false)
  const [dogies, setDogies] = useState<FallingDogie[]>([])

  // Shrink header effect on scroll with hysteresis threshold to prevent flickering
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled((prev) => {
        if (!prev && y > 45) return true
        if (prev && y < 10) return false
        return prev
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hidden button ref to trigger AddExpenseModal from BottomNav
  const addExpenseBtnRef = useRef<HTMLButtonElement | null>(null)

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync scroll position when activeTab changes programmatically
  useEffect(() => {
    const index = tabOrder.indexOf(activeTab)
    if (index !== -1 && scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth
      if (width > 0) {
        const targetLeft = index * width
        if (Math.abs(scrollContainerRef.current.scrollLeft - targetLeft) > 5) {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
          }
          isProgrammaticScroll.current = true
          scrollContainerRef.current.scrollTo({ left: targetLeft, behavior: 'instant' })
          scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScroll.current = false
          }, 200)
        }
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [activeTab])

  const handleContainerScroll = () => {
    if (isProgrammaticScroll.current || !scrollContainerRef.current) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth === 0) return
    const newIndex = Math.round(scrollLeft / clientWidth)
    if (tabOrder[newIndex] && tabOrder[newIndex] !== activeTabRef.current) {
      setActiveTab(tabOrder[newIndex])
    }
  }

  // Calculate stats
  const totalContributions = payments.filter(p => p.status === 'paid').length * 5
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const netBalance = totalContributions - totalExpenses

  const triggerAddExpense = () => {
    if (addExpenseBtnRef.current) {
      addExpenseBtnRef.current.click()
    }
  }

  const desktopTabs = [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'study', label: 'Study Hub', icon: <FileText className="h-4 w-4" /> },
    { id: 'freedom', label: 'Freedom Wall', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'portal', label: 'Officer Portal', icon: <ShieldAlert className="h-4 w-4" /> }
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
      
      {/* Invisible container holding the AddExpenseModal trigger */}
      <div className="hidden">
        <AddExpenseModal />
      </div>

      {/* Sticky / Docked Quick Nav Header on Mobile with Dynamic Scroll Shrink */}
      <header className={`sticky top-0 z-30 -mx-3 px-3 backdrop-blur-md border-b border-border/40 sm:relative sm:top-auto sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none transition-all duration-300 ${isScrolled ? 'py-2 bg-background/95 shadow-sm mb-3' : 'py-3 bg-background/80 mb-6'}`}>
        {isScrolled ? (
          /* Scrolled Sticky Bar: Compact title on left, mini icon controls on right */
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 min-w-0 shrink">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate text-left">
                Officer Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-1 xs:gap-1.5 shrink-0">
              <FinancialAuditReportModal
                students={students}
                payments={payments}
                weeks={weeks}
                expenses={expenses}
                receipts={receipts}
              />
              <PatchNotesButton />
              <ThemeToggle />
              <OfficerSidebarDrawer
                user={user}
                students={students}
                payments={payments}
                weeks={weeks}
                expenses={expenses}
                receipts={receipts}
                onRecordExpenseClick={triggerAddExpense}
              />
            </div>
          </div>
        ) : (
          /* Unscrolled Full Header: Title top/left, full action buttons below/right */
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              {/* Title Block */}
              <div className="min-w-0 text-left">
                <p className="text-xs sm:text-sm font-semibold text-primary mb-0.5">
                  Officer Management Portal
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground text-left text-balance">
                  Officer Dashboard
                </h1>
              </div>

              {/* Action Toolbar Row */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                {/* Essential Financial Tools — Left side of toolbar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <FinancialAuditReportModal
                    students={students}
                    payments={payments}
                    weeks={weeks}
                    expenses={expenses}
                    receipts={receipts}
                  />

                  <button
                    onClick={triggerAddExpense}
                    title="Record Expense"
                    aria-label="Record Expense"
                    className="size-8 xs:size-9 sm:w-auto shrink-0 sm:px-3 sm:py-1.5 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25 rounded-full cursor-pointer press-spring flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <DollarSign className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Record Expense</span>
                  </button>

                  {/* Render the AddExpenseModal so we can target it via click delegation */}
                  <div className="hidden" ref={el => {
                    if (el) {
                      const btn = el.querySelector('button')
                      if (btn) {
                        addExpenseBtnRef.current = btn
                      }
                    }
                  }}>
                    <AddExpenseModal />
                  </div>
                </div>

                {/* Extras & Shenanigans — Right side of toolbar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <BirdButton />
                  <PatchNotesButton />
                  <ThemeToggle />
                  <OfficerSidebarDrawer
                    user={user}
                    students={students}
                    payments={payments}
                    weeks={weeks}
                    expenses={expenses}
                    receipts={receipts}
                    onRecordExpenseClick={triggerAddExpense}
                  />

                  <form 
                    action={signOutAction} 
                    onSubmit={() => setSigningOut(true)} 
                    className="shrink-0 hidden lg:block"
                  >
                    <button
                      type="submit"
                      disabled={signingOut}
                      className="px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-full cursor-pointer press-spring flex items-center justify-center gap-1.5"
                    >
                      {signingOut && <span className="h-3 w-3 animate-spin rounded-full border border-destructive border-t-transparent shrink-0" />}
                      <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <p className="text-pretty text-left text-xs sm:text-base leading-5 sm:leading-6 text-muted-foreground">
              Logged in as <strong className="text-foreground">{user.email}</strong>. Manage payments, expenses, tasks, and posts.
            </p>
          </div>
        )}

        {/* Desktop Top Tab Navigation */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 border border-border/40 rounded-2xl w-fit mt-4">
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

      {/* Horizontal CSS Scroll-Snap Container on Mobile (`< sm`), Block layout on Desktop (`>= sm`) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleContainerScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none sm:block [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Tab Pane 1: Home (Student View) */}
        <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'home' ? 'sm:block' : 'sm:hidden'}`}>
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
        <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'tasks' ? 'sm:block' : 'sm:hidden'}`}>
          <TasksSection
            initialTasks={tasks}
            isOfficer={true}
            courses={courses}
            dbError={tasksError}
            triggerAddOpen={addTaskTrigger}
            onCloseAddTrigger={() => setAddTaskTrigger(false)}
            user={user}
          />
        </div>

        {/* Tab Pane 3: Study Hub */}
        <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'study' ? 'sm:block' : 'sm:hidden'}`}>
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
        <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'freedom' ? 'sm:block' : 'sm:hidden'}`}>
          <FreedomWall
            initialPosts={posts}
            isOfficer={true}
            dbError={postsError}
            triggerAddOpen={addPostTrigger}
            onCloseAddTrigger={() => setAddPostTrigger(false)}
            user={user}
          />
        </div>

        {/* Tab Pane 5: Officer Portal */}
        <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'portal' ? 'sm:block' : 'sm:hidden'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-slide-in">
            {/* Left Column: Stats, Export Reports Panel, Manage Weeks, and Activity */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
              <BalanceCard balance={netBalance} />

              {/* Financial Audit Reports & CSV Export Panel */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-card-foreground truncate">Financial Audit & CSV Exports</h3>
                  <span className="whitespace-nowrap shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
                    Officer Tool
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Export financial statements, audit logs, and student payment grids into CSV or PDF format.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <FinancialAuditReportModal
                    students={students}
                    payments={payments}
                    weeks={weeks}
                    expenses={expenses}
                    receipts={receipts}
                    fullWidth
                  />
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => downloadCSV(`payment_matrix_${Date.now()}.csv`, generatePaymentMatrixCSV(students, payments, weeks))}
                      className="min-h-[44px] px-2.5 py-2 text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center truncate"
                      title="Export Payment Grid CSV"
                    >
                      Payment Matrix
                    </button>
                    <button
                      onClick={() => downloadCSV(`student_payments_${Date.now()}.csv`, generatePaymentsCSV(students, payments, receipts))}
                      className="min-h-[44px] px-2.5 py-2 text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center truncate"
                      title="Export Payment History CSV"
                    >
                      Payment History
                    </button>
                    <button
                      onClick={() => downloadCSV(`expense_logs_${Date.now()}.csv`, generateExpensesCSV(expenses))}
                      className="min-h-[44px] px-2.5 py-2 text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-colors cursor-pointer flex items-center justify-center text-center truncate"
                      title="Export Expense Logs CSV"
                    >
                      Expense Logs
                    </button>
                  </div>
                </div>
              </div>

              <ManageWeeksPanel weeks={weeks} />
              <RecentActivity activities={logs} isModerator={isModerator} />
            </div>
            {/* Right Column: Receipts Approval Queue + Officer Student Checklist */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <OfficerReceiptApprovalQueue receipts={receipts} />
              <OfficerPaymentList students={students} initialPayments={payments} weeks={weeks} />
            </div>
          </div>
        </div>
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
