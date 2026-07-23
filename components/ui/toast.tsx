'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { playSuccessSound, playErrorSound } from '@/lib/sound'

export type ToastType = 'success' | 'error'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string, duration?: number) => void
    error: (message: string, title?: string, duration?: number) => void
  }
  showToast: (options: { type: ToastType; message: string; title?: string; duration?: number }) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type, message, title, duration = 4000 }: { type: ToastType; message: string; title?: string; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Trigger synthesized audio cue based on toast state
      if (type === 'success') {
        playSuccessSound()
      } else {
        playErrorSound()
      }

      setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]) // Keep max 5 queued toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const toast = React.useMemo(
    () => ({
      success: (message: string, title?: string, duration?: number) =>
        showToast({ type: 'success', message, title, duration }),
      error: (message: string, title?: string, duration?: number) =>
        showToast({ type: 'error', message, title, duration })
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ toast, showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none md:bottom-6 md:right-6 md:left-auto md:w-full md:max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto relative flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-card/95 text-card-foreground border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/5'
                : 'bg-card/95 text-card-foreground border-rose-500/30 dark:border-rose-500/40 shadow-rose-500/5'
            }`}
          >
            {/* Left Accent Bar */}
            <div
              className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                t.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />

            {/* Icon */}
            <div className="shrink-0 pt-0.5 ml-1">
              {t.type === 'success' ? (
                <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4.5" />
                </div>
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="size-4.5" />
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pr-2">
              {t.title && (
                <h4
                  className={`text-sm font-semibold leading-snug ${
                    t.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {t.title}
                </h4>
              )}
              <p className="text-xs font-medium text-foreground/90 leading-relaxed break-words">{t.message}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-muted-foreground/60 hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
