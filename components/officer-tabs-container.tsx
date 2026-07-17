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

interface OfficerTabsContainerProps {
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
  isModerator: boolean
  user: any
  signOutElement: React.ReactNode
  themeToggleElement: React.ReactNode
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
  tasksError = false,
  postsError = false,
  isModerator,
  user,
  signOutElement,
  themeToggleElement
}: OfficerTabsContainerProps) {
  // Start on the management portal view by default
  const [activeTab, setActiveTab] = useState('portal')
  const [addTaskTrigger, setAddTaskTrigger] = useState(false)
  const [addPostTrigger, setAddPostTrigger] = useState(false)
  
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

  return (
    <div className="pb-28"> {/* Extra padding bottom to prevent nav overlap */}

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

          <div className="flex items-center gap-2">
            {themeToggleElement}
            <PatchNotesButton />

            {/* Render the AddExpenseModal so we can target it via click delegation */}
            <div ref={el => {
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

            {signOutElement}
          </div>
        </div>
        <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
          Logged in as <strong className="text-foreground">{user.email}</strong>. Manage payments, expenses, tasks, and posts.
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

        {activeTab === 'portal' && (
          <div className="flex flex-col gap-6">
            <BalanceCard balance={netBalance} />
            <OfficerPaymentList students={students} initialPayments={payments} weeks={weeks} />
            <ManageWeeksPanel weeks={weeks} />
            <RecentActivity activities={logs} isModerator={isModerator} />
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
          />
        )}

        {activeTab === 'freedom' && (
          <FreedomWall
            initialPosts={posts}
            isOfficer={true}
            dbError={postsError}
            triggerAddOpen={addPostTrigger}
            onCloseAddTrigger={() => setAddPostTrigger(false)}
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
