'use client'

import React from 'react'
import { Wrench, Sparkles, Heart, RefreshCw, Lock } from 'lucide-react'

interface UnderReworkProps {
  onNavigateHome?: () => void
}

export function UnderRework({ onNavigateHome }: UnderReworkProps) {
  return (
    <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-slide-in">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 dark:bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/60 dark:border-border/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-center flex flex-col items-center gap-6">
        
        {/* Animated Icon Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 dark:bg-amber-500/30 animate-ping opacity-75" />
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/40 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Wrench className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-background border border-border rounded-full p-1.5 shadow-md">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold tracking-wide uppercase">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Under Rework & Maintenance</span>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Freedom Wall is Temporarily Restricted
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We have paused access to the Freedom Wall while it undergoes an exciting rework and maintenance upgrade.
          </p>
        </div>

        {/* Apology Callout Box */}
        <div className="w-full bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <Heart className="h-16 w-16 text-amber-500" />
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>Personal Note</span>
              </h4>
              <p className="text-sm italic text-foreground/90 font-medium leading-relaxed">
                &ldquo;I&apos;m sorry, I didn&apos;t mean to...&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-normal">
                Thank you for your patience and understanding while we work behind the scenes to rebuild a safer, cleaner, and better Freedom Wall experience for our class!
              </p>
            </div>
          </div>
        </div>

        {/* Rework Roadmap Checklist */}
        <div className="w-full border-t border-border/40 pt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left">
            What we&apos;re working on:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-muted-foreground">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/30">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Canvas & Sticky Notes Rework</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/30">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Enhanced Moderation & Safety</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/30">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Performance Optimization</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/30">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Refined UI Interactions</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
