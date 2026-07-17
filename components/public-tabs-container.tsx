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

interface PublicTabsContainerProps {
  students: any[]
  payments: any[]
  weeks: any[]
  expenses: any[]
  logs: any[]
  tasks: Task[]
  posts: FreedomPost[]
  courses: any[]
  tasksError?: boolean
  postsError?: boolean
  user: any
  signOutElement: React.ReactNode
  loginElement: React.ReactNode
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
  user,
  signOutElement,
  loginElement
}: PublicTabsContainerProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [addPostTrigger, setAddPostTrigger] = useState(false)

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
            <PatchNotesButton />
            {user ? signOutElement : loginElement}
          </div>
        </div>
        <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
          A simple overview of our class contributions and activities.
        </p>
      </header>

      {/* Conditional Rendering Based on Active Tab */}
      <div className="anim-fade-slide-in">
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6">
            <BalanceCard balance={netBalance} />
            <StudentPaymentList students={students} payments={payments} weeks={weeks} />
            <RecentActivity activities={logs} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksSection initialTasks={tasks} isOfficer={false} courses={courses} dbError={tasksError} />
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
