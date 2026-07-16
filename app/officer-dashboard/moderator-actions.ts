'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function verifyModeratorStatus() {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: You must be logged in.')
  }

  // 2. Check if email is in moderators table
  const { data: moderator, error: modError } = await supabase
    .from('moderators')
    .select('*')
    .eq('email', user.email)
    .single()

  if (modError || !moderator) {
    throw new Error('Access Denied: You do not have moderator privileges.')
  }

  return { supabase, user }
}

export async function deleteAuditLogAction(logId: number) {
  try {
    const { supabase } = await verifyModeratorStatus()

    // 1. Fetch the audit log details before deleting it
    const { data: logItem, error: fetchError } = await supabase
      .from('audit_logs')
      .select('action_description')
      .eq('id', logId)
      .single()

    if (fetchError || !logItem) {
      throw new Error('Activity log entry not found.')
    }

    const desc = logItem.action_description

    // 2. Parse and reverse the action based on the log description
    
    // CASE A: Expense addition log
    // Format: Added expense: "description" for ₱amount (Spent by: officerName).
    const expenseRegex = /^Added expense: "([\s\S]+)" for ₱([\d.]+)\s*\(Spent by:\s*([\s\S]+)\)\.$/
    const expenseMatch = desc.match(expenseRegex)

    if (expenseMatch) {
      const expDesc = expenseMatch[1]
      const expAmount = parseFloat(expenseMatch[2])
      const expOfficer = expenseMatch[3]

      // Find the most recent matching expense record
      const { data: matchingExpenses } = await supabase
        .from('expenses')
        .select('id')
        .eq('description', expDesc)
        .eq('amount', expAmount)
        .eq('recorded_by', expOfficer)
        .order('id', { ascending: false })
        .limit(1)

      if (matchingExpenses && matchingExpenses.length > 0) {
        // Delete the matching expense
        const { error: delExpError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', matchingExpenses[0].id)
        if (delExpError) console.error('Failed to auto-delete associated expense:', delExpError.message)
      }
    }

    // CASE B: Payment marked as PAID log
    // Format: Marked student "Name" (ID: id) as paid for Week Y.
    const paymentPaidRegex = /^Marked student "([\s\S]+)" \(ID: (\d+)\) as paid for Week (\d+)\.$/
    const paymentPaidMatch = desc.match(paymentPaidRegex)

    if (paymentPaidMatch) {
      const studentId = parseInt(paymentPaidMatch[2])
      const weekNumber = parseInt(paymentPaidMatch[3])

      // Delete the paid payment entry to mark them as unpaid
      const { error: delPayError } = await supabase
        .from('payments')
        .delete()
        .eq('student_id', studentId)
        .eq('week_number', weekNumber)
      if (delPayError) console.error('Failed to auto-delete associated payment:', delPayError.message)
    }

    // CASE C: Payment marked as UNPAID log
    // Format: Unmarked student "Name" (ID: id) as paid for Week Y.
    const paymentUnpaidRegex = /^Unmarked student "([\s\S]+)" \(ID: (\d+)\) as paid for Week (\d+)\.$/
    const paymentUnpaidMatch = desc.match(paymentUnpaidRegex)

    if (paymentUnpaidMatch) {
      const studentId = parseInt(paymentUnpaidMatch[2])
      const weekNumber = parseInt(paymentUnpaidMatch[3])

      // Reinsert the payment as paid to reverse the unpaid action
      const { error: insPayError } = await supabase
        .from('payments')
        .insert({
          student_id: studentId,
          week_number: weekNumber,
          status: 'paid'
        })
      if (insPayError) console.error('Failed to auto-revert student payment to paid:', insPayError.message)
    }

    // 3. Delete the activity log itself
    const { error: deleteError } = await supabase
      .from('audit_logs')
      .delete()
      .eq('id', logId)

    if (deleteError) {
      throw deleteError
    }

    // 4. Force cache revalidation for all routes
    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error deleting audit log:', err)
    return { success: false, error: err.message || 'Failed to delete activity log.' }
  }
}

export async function updateAuditLogAction(logId: number, newDescription: string) {
  try {
    const { supabase } = await verifyModeratorStatus()

    if (!newDescription || !newDescription.trim()) {
      throw new Error('Description cannot be empty.')
    }

    const { error: updateError } = await supabase
      .from('audit_logs')
      .update({ action_description: newDescription.trim() })
      .eq('id', logId)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/')
    revalidatePath('/officer-dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Error updating audit log:', err)
    return { success: false, error: err.message || 'Failed to update activity log.' }
  }
}
