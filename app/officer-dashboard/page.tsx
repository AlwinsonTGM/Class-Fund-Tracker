import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOutAction } from '@/app/login/actions'
import { OfficerTabsContainer } from '@/components/officer-tabs-container'

export const dynamic = 'force-dynamic'

export default async function OfficerDashboardPage() {
  const supabase = await createClient()

  // 1. Enforce Authentication Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch Data (Students, Payments, Expenses, Weeks, Moderators, Audit Logs, Tasks, Freedom Posts)
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

  const { data: dbTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: dbPosts, error: postsError } = await supabase
    .from('freedom_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: dbCourses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .order('code', { ascending: true })

  if (studentsError) console.error('Error fetching students:', studentsError.message)
  if (paymentsError) console.error('Error fetching payments:', paymentsError.message)
  if (expensesError) console.error('Error fetching expenses:', expensesError.message)
  if (weeksError) console.error('Error fetching weeks:', weeksError.message)
  if (moderatorsError) console.error('Error fetching moderators:', moderatorsError.message)
  if (logsError) console.error('Error fetching audit logs:', logsError.message)
  if (tasksError) console.error('Error fetching tasks:', tasksError.message)
  if (postsError) console.error('Error fetching freedom posts:', postsError.message)
  if (coursesError) console.error('Error fetching courses:', coursesError.message)

  const studentsList = dbStudents || []
  const paymentsList = dbPayments || []
  const expensesList = dbExpenses || []
  const weeksList = dbWeeks || []
  const moderatorsList = dbModerators || []
  const logsList = dbLogs || []
  const postsList = dbPosts || []
  const coursesList = dbCourses || []

  // Perform in-memory join to bypass Supabase's relation schema cache delay
  const tasksList = (dbTasks || []).map(task => ({
    ...task,
    courses: coursesList.find(c => c.id === task.course_id) || null
  })) as any[]

  // 3. Verify if current officer is a moderator
  const isModerator = moderatorsList.some((m) => m.email === user.email)

  const signOutElement = (
    <form action={signOutAction} className="shrink-0">
      <button
        type="submit"
        className="text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-full px-3 py-1.5 cursor-pointer press-spring"
      >
        Sign Out
      </button>
    </form>
  )

  const themeToggleElement = <ThemeToggle />

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12 anim-fade-slide-in">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <OfficerTabsContainer
          students={studentsList}
          payments={paymentsList}
          weeks={weeksList}
          expenses={expensesList}
          logs={logsList}
          tasks={tasksList}
          posts={postsList}
          courses={coursesList}
          tasksError={!!tasksError}
          isModerator={isModerator}
          user={user}
          signOutElement={signOutElement}
          themeToggleElement={themeToggleElement}
        />
      </div>
    </main>
  )
}
