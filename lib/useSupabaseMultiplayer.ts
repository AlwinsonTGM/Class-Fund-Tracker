import { useEffect, useRef, useState, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface RemotePlayerState {
  playerId: string
  nickname: string
  role: 'dev' | 'officer' | 'student' | 'guest'
  avatar: string
  hue: number
  x: number
  y: number
  dir: number
  facing: string
  walk: boolean
  bubText?: string
  bubUntil?: number
  bubEmote?: string
  bubEmoteUntil?: number
}

export interface ChatMessage {
  id: string
  author: string
  role: 'dev' | 'officer' | 'student' | 'guest'
  color: string
  text: string
  timestamp: number
}

interface UseMultiplayerProps {
  localPlayerId: string
  nickname: string
  role: 'dev' | 'officer' | 'student' | 'guest'
  avatar: string
  hue: number
  posRef: React.MutableRefObject<{
    x: number
    y: number
    dir: number
    facing: string
    walk: boolean
    bubText: string
    bubUntil: number
    bubEmote: string
    bubEmoteUntil: number
  }>
}

export function useSupabaseMultiplayer({
  localPlayerId,
  nickname,
  role,
  avatar,
  hue,
  posRef
}: UseMultiplayerProps) {
  const [remotePlayers, setRemotePlayers] = useState<Record<string, RemotePlayerState>>({})
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastBroadcastRef = useRef<number>(0)

  const isSubscribedRef = useRef<boolean>(false)

  // 1. Setup Supabase Channel (Presence & Broadcast)
  useEffect(() => {
    if (!localPlayerId) return

    isSubscribedRef.current = false

    const channel = supabase.channel('freedom-wall-plaza', {
      config: {
        presence: {
          key: localPlayerId
        }
      }
    })

    // Track Presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<RemotePlayerState>()
        const updatedRemotes: Record<string, RemotePlayerState> = {}

        Object.keys(state).forEach((key) => {
          if (key !== localPlayerId && state[key]?.[0]) {
            updatedRemotes[key] = state[key][0] as RemotePlayerState
          }
        })

        setRemotePlayers(updatedRemotes)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== localPlayerId && newPresences[0]) {
          setRemotePlayers((prev) => ({
            ...prev,
            [key]: newPresences[0] as unknown as RemotePlayerState
          }))
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setRemotePlayers((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      })

    // Track Broadcast Movement & Action Events
    channel
      .on('broadcast', { event: 'player-move' }, ({ payload }) => {
        if (payload?.playerId && payload.playerId !== localPlayerId) {
          setRemotePlayers((prev) => {
            const existing = prev[payload.playerId]
            if (!existing) return prev
            return {
              ...prev,
              [payload.playerId]: {
                ...existing,
                x: payload.x,
                y: payload.y,
                dir: payload.dir,
                facing: payload.facing,
                walk: payload.walk
              }
            }
          })
        }
      })
      .on('broadcast', { event: 'player-chat' }, ({ payload }) => {
        if (payload?.text) {
          const msg: ChatMessage = {
            id: Math.random().toString(36).substring(2),
            author: payload.author || 'Anonymous',
            role: payload.role || 'guest',
            color: payload.role === 'dev' ? '#c084fc' : payload.role === 'officer' ? '#f59e0b' : payload.role === 'student' ? '#10b981' : '#6b7280',
            text: payload.text,
            timestamp: Date.now()
          }

          setChatMessages((prev) => [...prev.slice(-49), msg])

          // Update speech bubble if payload belongs to a remote player
          if (payload.playerId && payload.playerId !== localPlayerId) {
            setRemotePlayers((prev) => {
              const existing = prev[payload.playerId]
              if (!existing) return prev
              return {
                ...prev,
                [payload.playerId]: {
                  ...existing,
                  bubText: payload.text,
                  bubUntil: Date.now() + 5000
                }
              }
            })
          }
        }
      })
      .on('broadcast', { event: 'player-emote' }, ({ payload }) => {
        if (payload?.playerId && payload.playerId !== localPlayerId && payload.imagePath) {
          setRemotePlayers((prev) => {
            const existing = prev[payload.playerId]
            if (!existing) return prev
            return {
              ...prev,
              [payload.playerId]: {
                ...existing,
                bubEmote: payload.imagePath,
                bubEmoteUntil: Date.now() + (payload.ms || 3500)
              }
            }
          })
        }
      })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true
        // Track local player in Presence
        await channel.track({
          playerId: localPlayerId,
          nickname,
          role,
          avatar,
          hue,
          x: posRef.current.x,
          y: posRef.current.y,
          dir: posRef.current.dir,
          facing: posRef.current.facing,
          walk: posRef.current.walk
        })
      }
    })

    channelRef.current = channel

    return () => {
      isSubscribedRef.current = false
      channel.unsubscribe()
    }
  }, [localPlayerId, nickname, role, avatar, hue])

  // 2. Throttled Position Broadcast (called from 60fps loop)
  const broadcastPosition = useCallback(() => {
    const now = Date.now()
    if (now - lastBroadcastRef.current < 45) return // ~22 updates/sec
    lastBroadcastRef.current = now

    if (channelRef.current && isSubscribedRef.current && localPlayerId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'player-move',
        payload: {
          playerId: localPlayerId,
          x: posRef.current.x,
          y: posRef.current.y,
          dir: posRef.current.dir,
          facing: posRef.current.facing,
          walk: posRef.current.walk
        }
      })
    }
  }, [localPlayerId, posRef])

  // 3. Send Chat Message
  const sendChat = useCallback((text: string) => {
    if (!text.trim() || !channelRef.current || !isSubscribedRef.current) return

    const trimmed = text.trim()
    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      author: nickname,
      role,
      color: role === 'dev' ? '#c084fc' : role === 'officer' ? '#f59e0b' : role === 'student' ? '#10b981' : '#6b7280',
      text: trimmed,
      timestamp: Date.now()
    }

    setChatMessages((prev) => [...prev.slice(-49), msg])

    // Broadcast to room
    channelRef.current.send({
      type: 'broadcast',
      event: 'player-chat',
      payload: {
        playerId: localPlayerId,
        author: nickname,
        role,
        text: trimmed
      }
    })
  }, [localPlayerId, nickname, role])

  // 4. Send Emote
  const sendEmote = useCallback((imagePath: string, ms = 3500) => {
    if (!channelRef.current || !isSubscribedRef.current) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'player-emote',
      payload: {
        playerId: localPlayerId,
        imagePath,
        ms
      }
    })
  }, [localPlayerId])

  return {
    remotePlayers,
    chatMessages,
    broadcastPosition,
    sendChat,
    sendEmote
  }
}
