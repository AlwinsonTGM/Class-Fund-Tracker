import { createClient } from '@/lib/supabase-server'
import { PublicTabsContainer } from '@/components/public-tabs-container'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const supabase = await createClient()

  // 1. Get active session user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch data (Students, Payments, Expenses, Weeks, Audit Logs, Tasks, Freedom Posts)
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

  const { data: dbMaterials, error: materialsError } = await supabase
    .from('study_materials')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch both approved and pending materials for display
  const { data: dbClassDocs, error: classDocsError } = await supabase
    .from('class_documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (studentsError) console.error('Error fetching students:', studentsError.message)
  if (paymentsError) console.error('Error fetching payments:', paymentsError.message)
  if (expensesError) console.error('Error fetching expenses:', expensesError.message)
  if (weeksError) console.error('Error fetching weeks:', weeksError.message)
  if (logsError) console.error('Error fetching audit logs:', logsError.message)
  if (tasksError) console.error('Error fetching tasks:', tasksError.message)
  if (postsError) console.error('Error fetching freedom posts:', postsError.message)
  if (coursesError) console.error('Error fetching courses:', coursesError.message)
  if (materialsError) console.error('Error fetching study materials:', materialsError.message)
  if (classDocsError) console.error('Error fetching class documents:', classDocsError.message)

  const studentsList = dbStudents || []
  const paymentsList = dbPayments || []
  const expensesList = dbExpenses || []
  const weeksList = dbWeeks || []
  const logsList = dbLogs || []
  const postsList = dbPosts || []
  const coursesList = dbCourses || []
  const materialsList = dbMaterials || []
  const classDocsList = dbClassDocs || []

  // Perform in-memory join to bypass Supabase's relation schema cache delay
  const tasksList = (dbTasks || []).map(task => ({
    ...task,
    courses: coursesList.find(c => c.id === task.course_id) || null
  })) as any[]

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12 anim-fade-slide-in">
      <div className="mx-auto flex w-full max-w-3xl lg:max-w-6xl flex-col gap-6">
        <PublicTabsContainer
          students={studentsList}
          payments={paymentsList}
          weeks={weeksList}
          expenses={expensesList}
          logs={logsList}
          tasks={tasksList}
          posts={postsList}
          courses={coursesList}
          materials={materialsList}
          classDocs={classDocsList}
          tasksError={!!tasksError}
          postsError={!!postsError}
          materialsError={!!materialsError}
          user={user}
        />
      </div>
    </main>
  )
}