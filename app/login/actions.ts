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

