'use server'

import { createClient } from '@/lib/supabase-server'

export interface LeaderboardEntry {
  id?: string
  player_name: string
  score: number
  mode?: 'classic' | 'zen'
  is_guest: boolean
  user_id?: string | null
  created_at: string
}

/**
 * Fetch top 15 Flappy Bird scores from Supabase database for a specific game mode ('classic' | 'zen').
 */
export async function getFlappyLeaderboardAction(
  gameMode: 'classic' | 'zen' = 'classic'
): Promise<{
  success: boolean
  mode: 'online' | 'offline'
  data: LeaderboardEntry[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Query top entries ordered by score
    let query = supabase
      .from('flappy_bird_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(100)

    if (gameMode) {
      query = query.eq('mode', gameMode)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Supabase leaderboard fetch warning:', error.message)
      return {
        success: false,
        mode: 'offline',
        data: [],
        error: error.message
      }
    }

    // Deduplicate entries by unique player (keeping single highest score per player)
    const uniqueEntriesMap = new Map<string, LeaderboardEntry>()
    for (const entry of (data || [])) {
      const key = entry.user_id ? `user_${entry.user_id}` : `guest_${(entry.player_name || '').trim().toLowerCase()}`
      if (!uniqueEntriesMap.has(key)) {
        uniqueEntriesMap.set(key, entry)
      } else {
        const existing = uniqueEntriesMap.get(key)!
        if (entry.score > existing.score) {
          uniqueEntriesMap.set(key, entry)
        }
      }
    }

    const deduplicatedData = Array.from(uniqueEntriesMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)

    return {
      success: true,
      mode: 'online',
      data: deduplicatedData
    }
  } catch (err: any) {
    return {
      success: false,
      mode: 'offline',
      data: [],
      error: err?.message || 'Server error'
    }
  }
}

/**
 * Submit high score to Supabase database with game mode.
 * Overwrites / updates previous high score if new score is higher.
 */
export async function submitFlappyScoreAction(
  playerName: string,
  score: number,
  isGuest: boolean = true,
  gameMode: 'classic' | 'zen' = 'classic'
): Promise<{
  success: boolean
  mode: 'online' | 'offline'
  message: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nameToStore = playerName || (user?.email ? user.email.split('@')[0] : 'Guest')

    // Check for existing score entry for this player and mode
    let existingQuery = supabase
      .from('flappy_bird_scores')
      .select('id, score')
      .eq('mode', gameMode)

    if (user) {
      existingQuery = existingQuery.eq('user_id', user.id)
    } else {
      existingQuery = existingQuery.ilike('player_name', nameToStore)
    }

    const { data: existingRecords } = await existingQuery

    if (existingRecords && existingRecords.length > 0) {
      const bestRecord = existingRecords.reduce((prev, curr) => curr.score > prev.score ? curr : prev, existingRecords[0])
      
      if (score > bestRecord.score) {
        // Attempt to update the existing high score record
        const { error: updateErr } = await supabase
          .from('flappy_bird_scores')
          .update({
            player_name: nameToStore,
            score: score,
            created_at: new Date().toISOString()
          })
          .eq('id', bestRecord.id)

        if (updateErr) {
          // Fallback to insert if update is blocked by RLS
          await supabase.from('flappy_bird_scores').insert({
            player_name: nameToStore,
            score: score,
            mode: gameMode,
            is_guest: user ? false : isGuest,
            user_id: user ? user.id : null
          })
        }
      }
    } else {
      // Insert new score entry
      const { error: insertErr } = await supabase
        .from('flappy_bird_scores')
        .insert({
          player_name: nameToStore,
          score: score,
          mode: gameMode,
          is_guest: user ? false : isGuest,
          user_id: user ? user.id : null
        })

      if (insertErr) {
        console.warn('Supabase score insert warning:', insertErr.message)
        return {
          success: false,
          mode: 'offline',
          message: 'Saved to local storage fallback.'
        }
      }
    }

    return {
      success: true,
      mode: 'online',
      message: 'High score saved to global leaderboard!'
    }
  } catch (err: any) {
    return {
      success: false,
      mode: 'offline',
      message: 'Saved to local storage fallback.'
    }
  }
}

