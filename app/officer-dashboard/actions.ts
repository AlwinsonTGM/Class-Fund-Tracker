'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function verifyOfficerStatus() {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: You must be logged in as an officer.')
  }

  // 2. Verify whitelist membership in moderators table
  const { data: moderator } = await supabase
    .from('moderators')
    .select('email')
    .eq('email', user.email)
    .single()

  let isOfficer = false
  try {
    const { data: officer, error: offError } = await supabase
      .from('officers')
      .select('email')
      .eq('email', user.email)
      .single()
    if (!offError && officer) {
      isOfficer = true
    }
  } catch (err) {
    console.warn('Officers table query failed inside verifyOfficerStatus:', err)
  }

  if (!moderator && !isOfficer) {
    throw new Error('Access Denied: You do not have officer privileges.')
  }

  return { supabase, user }
}

export async function togglePaymentStatus(
  studentId: number,
  weekNumber: number,
  paid: boolean,
  studentName: string
) {
  try {
    // 1. Authenticate and verify officer whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `${paid ? 'Marked' : 'Unmarked'} student "${studentName}" (ID: ${studentId}) as paid for Week ${weekNumber}.`

    // 2. Execute transaction via RPC function (combining payment update + audit log)
    const { error: rpcError } = await supabase.rpc('toggle_payment_status', {
      p_student_id: studentId,
      p_week_number: weekNumber,
      p_paid: paid,
      p_officer_email: officerEmail,
      p_action_description: actionDescription
    })

    // 3. Resilient Fallback: If RPC fails or is missing, run sequentially
    if (rpcError) {
      console.warn('RPC toggle_payment_status failed. Falling back to sequential execution:', rpcError.message)

      // Step A: Update payments table
      // Delete any duplicates first to enforce integrity
      await supabase
        .from('payments')
        .delete()
        .eq('student_id', studentId)
        .eq('week_number', weekNumber)

      if (paid) {
        const { error: payInsertError } = await supabase
          .from('payments')
          .insert({
            student_id: studentId,
            week_number: weekNumber,
            status: 'paid'
          })
        if (payInsertError) throw payInsertError
      }

      // Step B: Write to audit_logs
      const { error: auditInsertError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: officerEmail,
          action_description: actionDescription
        })
      if (auditInsertError) {
        console.error('Failed to create audit log in sequential fallback:', auditInsertError.message)
      }
    }

    // 4. Revalidate pages to flush caches
    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error toggling payment status:', err)
    return { success: false, error: err.message || 'Failed to toggle payment status.' }
  }
}

export async function addExpenseAction(
  description: string,
  amount: number,
  officerName: string
) {
  try {
    // 1. Authenticate and verify officer whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Added expense: "${description}" for ₱${amount.toFixed(2)} (Spent by: ${officerName}).`

    // 2. Call Supabase RPC transaction
    const { error: rpcError } = await supabase.rpc('add_expense_transaction', {
      p_description: description,
      p_amount: amount,
      p_officer_name: officerName,
      p_officer_email: officerEmail,
      p_action_description: actionDescription
    })

    // 3. Fallback: Sequential database insertion
    if (rpcError) {
      console.warn('RPC add_expense_transaction failed. Falling back to sequential execution:', rpcError.message)
      
      // Step A: Insert into expenses table
      const { error: expError } = await supabase
        .from('expenses')
        .insert({
          description,
          amount,
          recorded_by: officerName
        })
      if (expError) throw expError

      // Step B: Insert into audit_logs table
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: officerEmail,
          action_description: actionDescription
        })
      if (logError) throw logError
    }

    // 4. Revalidate pages
    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error adding expense:', err)
    return { success: false, error: err.message || 'Failed to record expense.' }
  }
}

export async function upsertWeekAction(weekNumber: number, dateRange: string, status: string = 'active') {
  try {
    // Authenticate and verify officer whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Upserted Week ${weekNumber} (Range: "${dateRange}", Status: "${status}").`

    // Update or insert week
    const { error: weekError } = await supabase
      .from('weeks')
      .upsert(
        { week_number: weekNumber, date_range: dateRange, status },
        { onConflict: 'week_number' }
      )
    if (weekError) {
      console.error('Error upserting week:', weekError.message)
      return { success: false, error: `Database error: ${weekError.message}` }
    }

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) {
      console.error('Failed to log upsert week audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error upserting week:', err)
    return { success: false, error: err.message || 'Failed to save week.' }
  }
}

export async function deleteWeekAction(weekNumber: number) {
  try {
    // Authenticate and verify officer whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Deleted Week ${weekNumber} from calendar configuration.`

    // Delete week
    const { error: weekError } = await supabase
      .from('weeks')
      .delete()
      .eq('week_number', weekNumber)
    if (weekError) {
      console.error('Error deleting week:', weekError.message)
      return { success: false, error: `Database error: ${weekError.message}` }
    }

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) {
      console.error('Failed to log delete week audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error deleting week:', err)
    return { success: false, error: err.message || 'Failed to delete week.' }
  }
}

export async function fetchAuditLogsAction(offset: number, limit: number = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching logs:', error.message)
    throw new Error(`Failed to fetch logs: ${error.message}`)
  }
  return data || []
}

// ─── Tasks Server Actions ───

export interface AddTaskInput {
  title: string
  description?: string
  course_id: number | null
  task_type: string
  participation_type: string
  group_size?: string
  priority?: string
  status?: string
  due_date: string
  background_image?: string
  is_private?: boolean
}

export async function addTaskAction(input: AddTaskInput) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized: You must be logged in.')
    }

    const email = user.email || 'unknown_user'

    // If it's a public task, verify officer status
    if (!input.is_private) {
      await verifyOfficerStatus()
    }

    const actionDescription = `Added task: "${input.title}" (Type: ${input.task_type}, Priority: ${input.priority || 'Medium'}).`

    // Insert into tasks
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        description: input.description || null,
        course_id: input.course_id,
        task_type: input.task_type,
        participation_type: input.participation_type,
        group_size: input.group_size || 'N/A',
        priority: input.priority || 'Medium',
        status: input.status || 'Pending',
        due_date: input.due_date,
        background_image: input.background_image || null,
        is_private: input.is_private || false,
        created_by: email
      })
      .select('*')
      .single()
    if (taskError) throw taskError

    // Insert audit log only for public tasks
    if (!input.is_private) {
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: email,
          action_description: actionDescription
        })
      if (logError) console.error('Failed to log task audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true, task: newTask }
  } catch (err: any) {
    console.error('Error adding task:', err)
    return { success: false, error: err.message || 'Failed to add task.' }
  }
}

export interface EditTaskInput {
  id: number
  title: string
  description?: string
  course_id: number | null
  task_type: string
  participation_type: string
  group_size?: string
  priority?: string
  due_date: string
  background_image?: string | null
  is_private?: boolean
}

export async function editTaskAction(input: EditTaskInput) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized: You must be logged in.')
    }

    const email = user.email || 'unknown_user'

    // Fetch existing task to check ownership
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('is_private, created_by')
      .eq('id', input.id)
      .single()
    if (fetchError || !existingTask) {
      throw new Error(fetchError?.message || 'Task not found.')
    }

    const isPrivate = existingTask.is_private
    const creator = existingTask.created_by

    if (isPrivate) {
      if (creator !== email) {
        throw new Error('Access Denied: You can only edit your own personal tasks.')
      }
    } else {
      await verifyOfficerStatus()
    }

    const actionDescription = `Edited task: "${input.title}" (Type: ${input.task_type}, Priority: ${input.priority || 'Medium'}).`

    // Update task in database
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        title: input.title,
        description: input.description || null,
        course_id: input.course_id,
        task_type: input.task_type,
        participation_type: input.participation_type,
        group_size: input.group_size || 'N/A',
        priority: input.priority || 'Medium',
        due_date: input.due_date,
        background_image: input.background_image || null,
        is_private: input.is_private ?? isPrivate,
        created_by: creator || email
      })
      .eq('id', input.id)
    if (taskError) throw taskError

    // Insert audit log only for public tasks
    if (!isPrivate) {
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: email,
          action_description: actionDescription
        })
      if (logError) console.error('Failed to log task edit audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error editing task:', err)
    return { success: false, error: err.message || 'Failed to edit task.' }
  }
}


export async function toggleTaskAction(id: number, status: string, title: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized: You must be logged in.')
    }

    const email = user.email || 'unknown_user'

    // Fetch existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('is_private, created_by')
      .eq('id', id)
      .single()
    if (fetchError || !existingTask) {
      throw new Error(fetchError?.message || 'Task not found.')
    }

    const isPrivate = existingTask.is_private
    const creator = existingTask.created_by

    if (isPrivate) {
      if (creator !== email) {
        throw new Error('Access Denied: You can only update your own personal tasks.')
      }
    } else {
      await verifyOfficerStatus()
    }

    const actionDescription = `Marked task "${title}" as ${status}.`

    // Update task status
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
    if (taskError) throw taskError

    // Insert audit log only for public tasks
    if (!isPrivate) {
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: email,
          action_description: actionDescription
        })
      if (logError) console.error('Failed to log task toggle audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error toggling task:', err)
    return { success: false, error: err.message || 'Failed to toggle task.' }
  }
}

export async function deleteTaskAction(id: number, title: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized: You must be logged in.')
    }

    const email = user.email || 'unknown_user'

    // Fetch existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('is_private, created_by')
      .eq('id', id)
      .single()
    if (fetchError || !existingTask) {
      throw new Error(fetchError?.message || 'Task not found.')
    }

    const isPrivate = existingTask.is_private
    const creator = existingTask.created_by

    if (isPrivate) {
      if (creator !== email) {
        throw new Error('Access Denied: You can only delete your own personal tasks.')
      }
    } else {
      await verifyOfficerStatus()
    }

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Deleted task: "${title}".`

    // Delete task
    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    if (taskError) throw taskError

    // Insert audit log only for public tasks
    if (!isPrivate) {
      const { error: logError } = await supabase
        .from('audit_logs')
        .insert({
          officer_email: officerEmail,
          action_description: actionDescription
        })
      if (logError) console.error('Failed to log task deletion audit log:', logError.message)
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting task:', err)
    return { success: false, error: err.message || 'Failed to delete task.' }
  }
}

// ─── Freedom Wall Server Actions ───

export interface AddPostInput {
  content: string
  author_name: string
  color: string
  song_data?: {
    title: string
    artist: string
    artworkUrl: string
    previewUrl: string
  } | null
}

export async function addPostAction(input: AddPostInput) {
  try {
    const supabase = await createClient()

    // Public action, no auth check needed
    const { error: postError } = await supabase
      .from('freedom_posts')
      .insert({
        content: input.content,
        author_name: input.author_name.trim() || 'Anonymous',
        color: input.color || 'yellow',
        song_data: input.song_data || null
      })
    if (postError) throw postError

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding post to freedom wall:', err)
    return { success: false, error: err.message || 'Failed to post on the Freedom Wall.' }
  }
}

export async function deletePostAction(id: number) {
  try {
    // 1. Authenticate and verify officer whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Deleted post ID ${id} from Freedom Wall.`

    // 2. Delete post
    const { error: postError } = await supabase
      .from('freedom_posts')
      .delete()
      .eq('id', id)
    if (postError) throw postError

    // 3. Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) console.error('Failed to log post deletion audit log:', logError.message)

    revalidatePath('/')
    revalidatePath('/officer-dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting post:', err)
    return { success: false, error: err.message || 'Failed to delete post.' }
  }
}

// ─── Study Materials Server Actions ───

export interface AddStudyMaterialInput {
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
}

export async function addStudyMaterialAction(input: AddStudyMaterialInput) {
  try {
    const supabase = await createClient()

    // Public action, anyone can submit. We force approved to false.
    const { error: insertError } = await supabase
      .from('study_materials')
      .insert({
        title: input.title,
        description: input.description || null,
        link: input.link,
        category: input.category,
        study_type: input.study_type,
        course_id: input.course_id,
        week_number: input.week_number || null,
        lesson_name: input.lesson_name || null,
        task_name: input.task_name || null,
        submitted_by: input.submitted_by?.trim() || 'Anonymous',
        approved: false // always require moderator approval
      })

    if (insertError) throw insertError

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding study material:', err)
    return { success: false, error: err.message || 'Failed to submit study material.' }
  }
}

export async function approveStudyMaterialAction(id: number) {
  try {
    // Authenticate and verify officer/moderator whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Approved study material ID ${id}.`

    // Update approved state to true
    const { error: updateError } = await supabase
      .from('study_materials')
      .update({ approved: true })
      .eq('id', id)

    if (updateError) throw updateError

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) console.error('Failed to log study material approval:', logError.message)

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error approving study material:', err)
    return { success: false, error: err.message || 'Failed to approve study material.' }
  }
}

export async function deleteStudyMaterialAction(id: number) {
  try {
    // Authenticate and verify officer/moderator whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Deleted study material ID ${id}.`

    // Delete item
    const { error: deleteError } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) console.error('Failed to log study material deletion:', logError.message)

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting study material:', err)
    return { success: false, error: err.message || 'Failed to delete study material.' }
  }
}

// ─── Class Documents Server Actions ───

export interface AddClassDocumentInput {
  title: string
  description?: string
  file_url?: string
  file_type?: string
}

export async function addClassDocumentAction(input: AddClassDocumentInput) {
  try {
    // Authenticate and verify officer/moderator whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Added class document "${input.title}".`

    const { error: insertError } = await supabase
      .from('class_documents')
      .insert({
        title: input.title,
        description: input.description || null,
        file_url: input.file_url || null,
        file_type: input.file_type || null,
        uploaded_by: user.id
      })

    if (insertError) throw insertError

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) console.error('Failed to log class document addition:', logError.message)

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error adding class document:', err)
    return { success: false, error: err.message || 'Failed to add class document.' }
  }
}

export async function deleteClassDocumentAction(id: string) {
  try {
    // Authenticate and verify officer/moderator whitelist
    const { supabase, user } = await verifyOfficerStatus()

    const officerEmail = user.email || 'unknown_officer'
    const actionDescription = `Deleted class document ID ${id}.`

    const { error: deleteError } = await supabase
      .from('class_documents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        officer_email: officerEmail,
        action_description: actionDescription
      })
    if (logError) console.error('Failed to log class document deletion:', logError.message)

    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting class document:', err)
    return { success: false, error: err.message || 'Failed to delete class document.' }
  }
}




