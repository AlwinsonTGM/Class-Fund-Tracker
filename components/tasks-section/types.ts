export interface Course {
  id: number
  code: string
  name: string
  created_at?: string
}

export interface Task {
  id: number
  created_at?: string
  title: string
  description?: string
  course_id: number | null
  courses?: Course | null
  task_type: 'Assignment' | 'Project' | 'Quiz' | 'Exam' | 'Presentation' | 'Lab Activity' | 'Report'
  participation_type: 'Solo' | 'Group'
  group_size: 'Duo' | 'Trio' | 'Quad' | '5+' | 'Whole Section' | 'N/A'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  due_date: string
  background_image?: string | null
  is_private?: boolean
  created_by?: string
}

export interface UserType {
  id?: string
  email?: string
  name?: string
  role?: string
}
