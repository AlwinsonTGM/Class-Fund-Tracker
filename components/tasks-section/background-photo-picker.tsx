'use client'

import React from 'react'
import { Check, Plus } from 'lucide-react'
import { PRESELECTED_BG_PHOTOS } from './constants'

export interface BackgroundPhotoPickerProps {
  backgroundImage: string | null
  setBackgroundImage: (val: string | null) => void
}

export function BackgroundPhotoPicker({
  backgroundImage,
  setBackgroundImage
}: BackgroundPhotoPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Background Photo</span>
      <div className="flex flex-wrap gap-2 items-center">
        {/* None Choice */}
        <button
          type="button"
          onClick={() => setBackgroundImage(null)}
          className={`size-11 min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer press-spring ${
            backgroundImage === null
              ? 'border-foreground bg-foreground text-background dark:bg-white dark:text-black'
              : 'border-border bg-background hover:bg-muted text-muted-foreground'
          }`}
        >
          None
        </button>

        {/* Pre-selected Images Choices */}
        {PRESELECTED_BG_PHOTOS.map(img => {
          const isSelected = backgroundImage === img.path
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setBackgroundImage(img.path)}
              className={`relative size-11 min-h-[44px] min-w-[44px] rounded-xl overflow-hidden border transition-all cursor-pointer press-spring ${
                isSelected ? 'border-primary ring-2 ring-primary/25 scale-105' : 'border-border hover:opacity-80'
              }`}
              title={img.label}
            >
              <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground stroke-[3]" />
                </div>
              )}
            </button>
          )
        })}

        {/* Custom File Upload Input */}
        <label className="relative size-11 min-h-[44px] min-w-[44px] rounded-xl border border-dashed border-border bg-background hover:bg-muted cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all select-none">
          <Plus className="h-3.5 w-3.5" />
          <span className="text-[8px] font-bold uppercase mt-0.5">Custom</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (file.size > 1024 * 1024) {
                  alert('Custom image size must be under 1MB.')
                  return
                }
                const reader = new FileReader()
                reader.onload = (event) => {
                  if (event.target?.result) {
                    setBackgroundImage(event.target.result as string)
                  }
                }
                reader.readAsDataURL(file)
              }
            }}
          />
        </label>
      </div>

      {/* Indicator for custom upload */}
      {backgroundImage && !PRESELECTED_BG_PHOTOS.some(img => img.path === backgroundImage) && (
        <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
          <Check className="h-3 w-3" /> Custom image loaded (max 1MB).
        </p>
      )}
    </div>
  )
}
