'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function togglePaymentStatus(
  studentId: number,
  weekNumber: number,
  paid: boolean,
  studentName: string
) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user as an officer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: You must be logged in as an officer to perform this action.' }
    }

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
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: You must be logged in as an officer to add an expense.' }
    }

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
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: You must be logged in as an officer.' }
    }

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
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: You must be logged in as an officer.' }
    }

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



