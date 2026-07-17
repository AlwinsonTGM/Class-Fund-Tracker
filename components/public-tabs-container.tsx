'use client'

import React, { useState, useEffect } from 'react'
import { BottomNav } from '@/components/bottom-nav'
import { BalanceCard } from '@/components/balance-card'
import { StudentPaymentList } from '@/components/student-payment-list'
import { RecentActivity } from '@/components/recent-activity'
import { TasksSection, Task } from '@/components/tasks-section'
import { FreedomWall, FreedomPost } from '@/components/freedom-wall'
import { InlineLogin } from '@/components/inline-login'
import { PatchNotesModal, PatchNotesButton } from '@/components/patch-notes-modal'
import { Home, ClipboardList, MessageSquare, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOutAction } from '@/app/login/actions'

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
    <div className="pb-28"> {/* Extra padding bottom to prevent nav overlap */}
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PatchNotesButton />
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
