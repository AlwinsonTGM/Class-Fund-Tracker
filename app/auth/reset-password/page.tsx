'use client'

import React, { useState } from 'react'
import { updatePasswordAction } from '@/app/login/actions'
import { KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)

      const result = await updatePasswordAction(null, formData)

      if (result && !result.success) {
        setError(result.error || 'Failed to reset password.')
        setIsPending(false)
      } else {
        setSuccess('Your password has been reset successfully! Redirecting you to the home page...')
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setIsPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 sm:py-12 anim-fade-slide-in">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-xs text-muted-foreground mt-1">Please enter your new password below.</p>
        </div>

        <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-5 bg-card/60 border border-border/80 shadow-xl backdrop-blur-md">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive leading-relaxed">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isPending || !!success}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/50 pl-4 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isPending || !!success}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !!success}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground hover:bg-[#383838] dark:bg-white dark:hover:bg-zinc-200 py-2.5 px-4 text-xs font-bold text-background dark:text-black cursor-pointer disabled:opacity-50 press-spring"
            >
              {isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background dark:border-black border-t-transparent" />
              ) : null}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
