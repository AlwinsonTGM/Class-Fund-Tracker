export interface Task {
  id: number
  title: string
  due_date: string
  task_type: string
  is_private?: boolean
}

export interface StudyMaterial {
  id: number
  created_at: string
  title: string
  description?: string
  link: string
  category: string
  study_type: string
  course_id: number | null
  week_number?: number | null
  lesson_name?: string | null
  task_name?: string | null
  submitted_by?: string
  approved: boolean
}

export interface ClassDocument {
  id: string
  created_at: string
  title: string
  description?: string
  file_url?: string
  file_type?: string
  uploaded_by?: string
}

export interface Course {
  id: number
  code: string
  name: string
  created_at?: string
}

export interface Week {
  week_number: number
  [key: string]: unknown
}

export interface UserType {
  id?: string
  email?: string
  name?: string
  role?: string
}
