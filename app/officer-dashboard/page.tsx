import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { OfficerPaymentList } from '@/components/officer-payment-list'
import { RecentActivity } from '@/components/recent-activity'
import { AddExpenseModal } from '@/components/add-expense-modal'
import { ManageWeeksPanel } from '@/components/manage-weeks-panel'
import { ThemeToggle } from '@/components/theme-toggle'
import { BalanceCard } from '@/components/balance-card'
import { signOutAction } from '@/app/login/actions'

export const dynamic = 'force-dynamic'


export default async function OfficerDashboardPage() {
  const supabase = await createClient()

  // 1. Enforce Authentication Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch Data (Students, Payments, Expenses, Weeks, Moderators, and Audit Logs)
  const { data: dbStudents, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .order('seat_number', { ascending: true })

  const { data: dbPayments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')

  const { data: dbExpenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')

  const { data: dbWeeks, error: weeksError } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: true })

  const { data: dbModerators, error: moderatorsError } = await supabase
    .from('moderators')
    .select('*')

  const { data: dbLogs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (studentsError) console.error('Error fetching students:', studentsError)
  if (paymentsError) console.error('Error fetching payments:', paymentsError)
  if (expensesError) console.error('Error fetching expenses:', expensesError)
  if (weeksError) console.error('Error fetching weeks:', weeksError)
  if (moderatorsError) console.error('Error fetching moderators:', moderatorsError)
  if (logsError) console.error('Error fetching audit logs:', logsError)

  const studentsList = dbStudents || []
  const paymentsList = dbPayments || []
  const expensesList = dbExpenses || []
  const weeksList = dbWeeks || []
  const moderatorsList = dbModerators || []
  const logsList = dbLogs || []

  // 3. Compute calculations
  const totalContributions = paymentsList.filter(p => p.status === 'paid').length * 5
  const totalExpenses = expensesList.reduce((sum, item) => sum + Number(item.amount), 0)
  const netBalance = totalContributions - totalExpenses

  // 4. Verify if current officer is a moderator
  const isModerator = moderatorsList.some((m) => m.email === user.email)

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12 anim-fade-slide-in">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Officer Management Portal</p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Officer Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Add Expense Button (Opens modal) */}
              <AddExpenseModal />

              <a
                href="/"
                className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border bg-card rounded-full px-3 py-1.5 press-spring"
              >
                ← Public Site
              </a>
              <form action={signOutAction} className="shrink-0">
                <button
                  type="submit"
                  className="text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-full px-3 py-1.5 cursor-pointer press-spring"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
          <p className="text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            Logged in as <strong className="text-foreground">{user.email}</strong>. Manage payments, expenses, and logs.
          </p>
        </header>

        {/* Treasury Stats (Dynamic net balance) */}
        <BalanceCard balance={netBalance} />

        {/* Interactive Checklist */}
        <OfficerPaymentList students={studentsList} initialPayments={paymentsList} weeks={weeksList} />

        {/* Manage Weeks Calendar Configuration Panel */}
        <ManageWeeksPanel weeks={weeksList} />

        {/* Unified Recent Activity (Audit logs-driven) */}
        <RecentActivity activities={logsList} isModerator={isModerator} />
      </div>
    </main>
  )
}
