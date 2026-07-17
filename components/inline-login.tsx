'use client'

import React, { useState, startTransition } from 'react'
import { loginAction, signInWithGoogleAction } from '@/app/login/actions'

interface InlineLoginProps {
  onSuccess?: () => void
}

export function InlineLogin({ onSuccess }: InlineLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isGooglePending, setIsGooglePending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setError(null)
    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const result = await loginAction(null, formData)
      if (result && !result.success) {
        setError(result.error || 'Failed to sign in. Please check your credentials.')
        setIsPending(false)
      } else {
        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setIsPending(false)
    }
  }

  const handleGoogleLogin = () => {
    setError(null)
    setIsGooglePending(true)
    startTransition(async () => {
      try {
        await signInWithGoogleAction()
      } catch (err: any) {
        setError(err.message || 'Failed to initialize Google login.')
        setIsGooglePending(false)
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-md flex flex-col gap-6 anim-stagger-in">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Officer Portal</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Please sign in to access officer management tools.</p>
      </div>

      <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-5 liquid-glass shadow-lg">
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive leading-relaxed">
            {error === 'Unauthorized'
              ? 'Access Denied: This account is not pre-registered as an officer.'
              : error}
          </div>
        )}

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending || isGooglePending}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background hover:bg-muted py-2.5 px-4 text-xs font-bold text-foreground cursor-pointer disabled:opacity-50 press-spring"
        >
          {isGooglePending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.06,-1.2 -0.17,-1.72z" fill="#4285F4" />
                <path d="M12,20.7c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.33,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.72H2.9v2.58c1.5,2.98 4.6,5.04 8.1,5.04z" fill="#34A853" />
                <path d="M6.96,13.18a5.1,5.1 0 0 1 0,-3.27V7.33H2.9a8.99,8.99 0 0 0 0,8.43l4.06,-2.58z" fill="#FBBC05" />
                <path d="M12,6.9c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.47,4.22 14.43,3.3 12,3.3c-3.5,0 -6.6,2.06 -8.1,5.04l4.06,2.58c0.71,-2.14 2.7,-3.72 5.04,-3.72z" fill="#EA4335" />
              </g>
            </svg>
          )}
          Sign In with Google
        </button>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-card px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            or continue with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isPending || isGooglePending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={isPending || isGooglePending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground hover:bg-[#383838] py-2.5 px-4 text-xs font-bold text-background cursor-pointer disabled:opacity-50 press-spring"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : null}
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
