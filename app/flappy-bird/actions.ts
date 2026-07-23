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
 * Also cleans up duplicate records for the same player.
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
    const trimmedName = (playerName || '').trim() || (user?.email ? user.email.split('@')[0] : 'Guest')

    // Check for existing score entry for this player and mode
    let existingQuery = supabase
      .from('flappy_bird_scores')
      .select('id, score, player_name')
      .eq('mode', gameMode)

    if (user) {
      existingQuery = existingQuery.eq('user_id', user.id)
    } else {
      existingQuery = existingQuery.ilike('player_name', trimmedName)
    }

    const { data: existingRecords } = await existingQuery

    if (existingRecords && existingRecords.length > 0) {
      const bestRecord = existingRecords.reduce((prev, curr) => curr.score > prev.score ? curr : prev, existingRecords[0])
      
      if (score > bestRecord.score) {
        // Update the existing high score record with higher score
        const { error: updateErr } = await supabase
          .from('flappy_bird_scores')
          .update({
            player_name: trimmedName,
            score: score,
            created_at: new Date().toISOString()
          })
          .eq('id', bestRecord.id)

        if (updateErr) {
          console.warn('Supabase update warning, falling back to insert:', updateErr.message)
          await supabase.from('flappy_bird_scores').insert({
            player_name: trimmedName,
            score: score,
            mode: gameMode,
            is_guest: user ? false : isGuest,
            user_id: user ? user.id : null
          })
        }
      } else {
        // Keep higher score, but update player handle if changed
        if (bestRecord.player_name !== trimmedName) {
          await supabase
            .from('flappy_bird_scores')
            .update({ player_name: trimmedName })
            .eq('id', bestRecord.id)
        }
      }

      // Remove any duplicate records for this player & mode to keep DB clean
      const extraIds = existingRecords.filter(r => r.id !== bestRecord.id).map(r => r.id)
      if (extraIds.length > 0) {
        await supabase.from('flappy_bird_scores').delete().in('id', extraIds)
      }
    } else {
      // Insert new score entry
      const { error: insertErr } = await supabase
        .from('flappy_bird_scores')
        .insert({
          player_name: trimmedName,
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

/**
 * Get the latest player_name for the active authenticated user from DB or auth metadata.
 */
export async function getFlappyPlayerNameAction(): Promise<{
  success: boolean
  playerName: string | null
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, playerName: null }
    }

    // 1. Check user metadata first
    const metaName = user.user_metadata?.player_name || user.user_metadata?.custom_username
    if (metaName && typeof metaName === 'string' && metaName.trim()) {
      return { success: true, playerName: metaName.trim() }
    }

    // 2. Query flappy_bird_scores table for user's latest player_name
    const { data: scoreRecords } = await supabase
      .from('flappy_bird_scores')
      .select('player_name')
      .eq('user_id', user.id)
      .limit(1)

    if (scoreRecords && scoreRecords.length > 0 && scoreRecords[0].player_name) {
      return { success: true, playerName: scoreRecords[0].player_name }
    }

    // Fallback to email prefix
    const emailPrefix = user.email ? user.email.split('@')[0] : null
    return { success: true, playerName: emailPrefix }
  } catch (err) {
    return { success: false, playerName: null }
  }
}

/**
 * Update player_name across all existing flappy_bird_scores records for the active user or matching guest name.
 * Checks for duplicate usernames on the leaderboard first.
 */
export async function updateFlappyPlayerNameAction(
  oldName: string,
  newName: string
): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const trimmedNew = (newName || '').trim()
    const trimmedOld = (oldName || '').trim()

    if (!trimmedNew) {
      return {
        success: false,
        message: 'Username cannot be empty.'
      }
    }

    if (trimmedNew.length < 2) {
      return {
        success: false,
        message: 'Username must be at least 2 characters long.'
      }
    }

    if (trimmedNew.length > 20) {
      return {
        success: false,
        message: 'Username cannot exceed 20 characters.'
      }
    }

    // 1. Check for duplicate username in leaderboard (case-insensitive)
    const { data: existingScores, error: checkError } = await supabase
      .from('flappy_bird_scores')
      .select('id, player_name, user_id')
      .ilike('player_name', trimmedNew)

    if (checkError) {
      console.warn('Error checking existing username:', checkError.message)
    }

    if (existingScores && existingScores.length > 0) {
      if (user) {
        // For authenticated user: Check if any existing entry belongs to a DIFFERENT user or a guest
        const isDuplicate = existingScores.some(
          (entry) => !entry.user_id || entry.user_id !== user.id
        )
        if (isDuplicate) {
          return {
            success: false,
            message: `The username "${trimmedNew}" is already taken by another player on the leaderboard. Please choose a different name.`
          }
        }
      } else {
        // For guest user: Check if any entry exists with matching name
        const isDuplicate = existingScores.some(
          (entry) => entry.player_name.toLowerCase() === trimmedNew.toLowerCase() &&
                     entry.player_name.toLowerCase() !== trimmedOld.toLowerCase()
        )
        if (isDuplicate) {
          return {
            success: false,
            message: `The username "${trimmedNew}" is already taken by another player on the leaderboard. Please choose a different name.`
          }
        }
      }
    }

    // 2. Perform the update
    if (user) {
      // Update by authenticated user ID
      const { error: updateErr } = await supabase
        .from('flappy_bird_scores')
        .update({ player_name: trimmedNew })
        .eq('user_id', user.id)

      if (updateErr) {
        console.warn('Failed to update authenticated user flappy name:', updateErr.message)
      }

      // Sync user_metadata in Supabase Auth so name persists across sessions/devices
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { player_name: trimmedNew, custom_username: trimmedNew }
      })
      if (metaErr) {
        console.warn('Failed to update user metadata:', metaErr.message)
      }
    } else if (trimmedOld) {
      // Update guest matching old handle
      const { error: guestErr } = await supabase
        .from('flappy_bird_scores')
        .update({ player_name: trimmedNew })
        .ilike('player_name', trimmedOld)

      if (guestErr) {
        console.warn('Failed to update guest flappy name:', guestErr.message)
      }
    }

    return {
      success: true,
      message: 'Username successfully updated!'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error updating player name.'
    }
  }
}

/**
 * Clear/reset all entries in flappy_bird_scores table.
 */
export async function clearFlappyLeaderboardAction(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('flappy_bird_scores')
      .delete()
      .gte('score', 0)

    if (error) {
      console.warn('Failed to clear flappy_bird_scores table:', error.message)
      return {
        success: false,
        message: error.message
      }
    }

    return {
      success: true,
      message: 'Leaderboard cleared successfully.'
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Server error clearing leaderboard.'
    }
  }
}



