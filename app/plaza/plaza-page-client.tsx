'use client'

import React, { useEffect } from 'react'
import { FreedomWallPlazaGame } from '@/components/freedom-wall-plaza-game'
import { FreedomPost } from '@/components/freedom-wall/types'
import type { User } from '@supabase/supabase-js'

interface PlazaPageClientProps {
  initialPosts: FreedomPost[]
  user: User | null
  isOfficer: boolean
  isDev?: boolean
}

export function PlazaPageClient({ initialPosts, user, isOfficer, isDev }: PlazaPageClientProps) {
  // Lock body scrolling while inside the dedicated Plaza route
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#17301c] select-none z-[9999]">
      <FreedomWallPlazaGame
        posts={initialPosts}
        isOfficer={isOfficer}
        isDev={isDev}
        user={user}
        isDedicatedPage={true}
      />
    </main>
  )
}
