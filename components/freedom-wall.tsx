'use client'

import React, { useState, useEffect } from 'react'
import { FreedomPost, SongPreview } from './freedom-wall/types'
import { FreedomWallPlazaGame } from './freedom-wall-plaza-game'
import type { User } from '@supabase/supabase-js'

export type { FreedomPost, SongPreview }

interface FreedomWallProps {
  initialPosts: FreedomPost[]
  isOfficer: boolean
  dbError?: boolean
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
  user?: User | null
}

export function FreedomWall({
  initialPosts,
  isOfficer,
  dbError = false,
  triggerAddOpen = false,
  onCloseAddTrigger,
  user
}: FreedomWallProps) {
  const [posts, setPosts] = useState<FreedomPost[]>(initialPosts)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  return (
    <div className="flex flex-col gap-4">
      <FreedomWallPlazaGame
        posts={posts}
        isOfficer={isOfficer}
        user={user || null}
        triggerAddOpen={triggerAddOpen}
        onCloseAddTrigger={onCloseAddTrigger}
      />
    </div>
  )
}
