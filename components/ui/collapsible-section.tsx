'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  badgeText?: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  headerExtra?: React.ReactNode
}

export function CollapsibleSection({
  title,
  subtitle,
  badgeText,
  defaultOpen = true,
  children,
  className = '',
  headerExtra
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all ${className}`}>
      <div className="w-full flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-card hover:bg-muted/30 min-h-[44px]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between min-h-[44px] cursor-pointer text-left transition-colors pr-2"
          aria-expanded={isOpen}
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
              {badgeText && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground shrink-0">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>
        {headerExtra && <div className="shrink-0 pl-2">{headerExtra}</div>}
      </div>

      {isOpen && (
        <div className="border-t border-border p-4 sm:p-6 anim-fade-slide-in">
          {children}
        </div>
      )}
    </div>
  )
}
