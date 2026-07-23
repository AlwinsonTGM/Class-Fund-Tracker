'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Check if officer or moderator to redirect appropriately
  const { data: moderator } = await supabase
    .from('moderators')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  let isOfficer = false
  if (!moderator) {
    try {
      const { data: officer, error: offError } = await supabase
        .from('officers')
        .select('email')
        .eq('email', email)
        .maybeSingle()
      if (!offError && officer) {
        isOfficer = true
      }
    } catch (err) {
      console.warn('Officers table query failed inside loginAction:', err)
    }
  }

  if (moderator || isOfficer) {
    redirect('/officer-dashboard')
  }

  redirect('/')
}

export async function signInWithGoogleAction() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error) {
    console.error('Google OAuth sign-in error:', error)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.url) {
    redirect(data.url)
  }

  redirect('/login?error=Google OAuth URL not generated')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signUpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  if (!email.endsWith('@kld.edu.ph')) {
    return { success: false, error: 'Only @kld.edu.ph email addresses are allowed.' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/auth/callback`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Registration successful! Please check your email to verify your account.' }
}

export async function sendResetLinkAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: 'Email is required.' }
  }

  if (!email.endsWith('@kld.edu.ph')) {
    return { success: false, error: 'Only @kld.edu.ph email addresses are allowed.' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/auth/callback?next=/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password reset link sent! Please check your email inbox.' }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { success: false, error: 'Both fields are required.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password updated successfully!' }
}

