import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Log request parameters for debugging
  console.log('--- Auth Callback Triggered ---')
  console.log('Callback Request URL:', request.url)
  console.log('Query Parameters:', Object.fromEntries(searchParams.entries()))

  const code = searchParams.get('code')
  const authError = searchParams.get('error')
  const authErrorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  if (authError || authErrorDescription) {
    console.error('OAuth Callback Error:', authError, '-', authErrorDescription)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authErrorDescription || authError || 'OAuth error')}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!userError && user) {
        const lastSignIn = new Date(user.last_sign_in_at || '').getTime()
        const createdAt = new Date(user.created_at || '').getTime()
        const diffSeconds = Math.abs(lastSignIn - createdAt) / 1000

        console.log(`User Authenticated: ${user.email}`)
        console.log(`lastSignIn: ${user.last_sign_in_at}, createdAt: ${user.created_at}, diff: ${diffSeconds}s`)

        if (diffSeconds < 15) {
          console.warn(`Unauthorized login attempt (not pre-registered): ${user.email}`)
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=Unauthorized`)
        }
      }

      console.log('Authentication successful. Redirecting to:', next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth code exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user (missing code)`)
}

