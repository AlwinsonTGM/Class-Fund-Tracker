'use client'

import React from 'react'
import { RemotePlayerState } from '@/lib/useSupabaseMultiplayer'
import { AVATARS, getAvatarById } from '@/config/avatars'
import { OBJECT_Z_OFFSET } from '@/lib/layerZ'
import { Code2, Crown, ShieldCheck, User } from 'lucide-react'

interface RemotePlayerEntityProps {
  player: RemotePlayerState
}

export const RemotePlayerEntity: React.FC<RemotePlayerEntityProps> = ({ player }) => {
  const currentAv = getAvatarById(player.avatar)

  const now = Date.now()
  const isBubShow = !!(player.bubText && player.bubUntil && now < player.bubUntil)
  const isEmoteShow = !!(player.bubEmote && player.bubEmoteUntil && now < player.bubEmoteUntil)

  // Track position to disable transition on large distance jumps (teleports/spawns)
  const prevPosRef = React.useRef({ x: player.x, y: player.y })
  const [isTeleporting, setIsTeleporting] = React.useState(true)

  // Auto-stop walk animation if no position updates arrive for 250ms
  const [isWalking, setIsWalking] = React.useState(!!player.walk)
  const lastMoveTsRef = React.useRef<number>(Date.now())

  React.useEffect(() => {
    const dist = Math.hypot(player.x - prevPosRef.current.x, player.y - prevPosRef.current.y)
    prevPosRef.current = { x: player.x, y: player.y }
    lastMoveTsRef.current = Date.now()

    if (dist > 120) {
      setIsTeleporting(true)
      const t = setTimeout(() => setIsTeleporting(false), 50)
      return () => clearTimeout(t)
    } else {
      setIsTeleporting(false)
    }
  }, [player.x, player.y])

  React.useEffect(() => {
    setIsWalking(!!player.walk)
    if (player.walk) {
      const timer = setTimeout(() => {
        if (Date.now() - lastMoveTsRef.current >= 240) {
          setIsWalking(false)
        }
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [player.x, player.y, player.walk])

  const roleBadge = () => {
    if (player.role === 'dev' || (player as any).role === 'admin') {
      return (
        <span className="bg-purple-600 text-white text-[9px] px-1 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
          <Code2 className="w-2.5 h-2.5 text-purple-200" /> DEV
        </span>
      )
    }
    if (player.role === 'officer') {
      return (
        <span className="bg-amber-500 text-black text-[9px] px-1 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
          <Crown className="w-2.5 h-2.5 fill-black" /> OFFICER
        </span>
      )
    }
    if (player.role === 'student') {
      return (
        <span className="bg-emerald-600 text-white text-[9px] px-1 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-sm">
          <ShieldCheck className="w-2.5 h-2.5" /> STUDENT
        </span>
      )
    }
    return (
      <span className="bg-slate-600 text-slate-200 text-[9px] px-1 py-0.5 rounded font-medium flex items-center gap-0.5">
        <User className="w-2.5 h-2.5" /> GUEST
      </span>
    )
  }

  return (
    <div
      className="ent"
      style={{
        transform: `translate3d(${player.x}px, ${player.y}px, 0)`,
        transition: isTeleporting ? 'none' : 'transform 70ms linear',
        willChange: 'transform',
        zIndex: OBJECT_Z_OFFSET + Math.round(player.y)
      }}
    >
      <div className="sh" />
      {currentAv.isAnimated ? (
        <div
          className={`${currentAv.isPipoya32 ? 'spr-pipoya-3x4' : 'spr-animated'} ${player.facing || 'down'}${isWalking ? ' moving' : ''}`}
          style={{
            backgroundImage: `url('${currentAv.img}')`,
            filter: player.hue ? `hue-rotate(${player.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))` : 'drop-shadow(0 3px 1px rgba(25,15,5,0.28))'
          }}
        />
      ) : (
        <img
          src={currentAv.img}
          alt={player.nickname}
          className={`spr ${isWalking ? 'walk' : ''}`}
          style={{
            transform: player.dir < 0 ? 'scaleX(-1)' : 'none',
            filter: player.hue ? `hue-rotate(${player.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))` : 'drop-shadow(0 3px 1px rgba(25,15,5,0.28))'
          }}
        />
      )}

      {/* Role Badge and Player Tag */}
      <div
        className="tag font-pixel font-bold flex items-center gap-1 shadow-md"
        style={{
          borderColor: player.role === 'dev' || (player as any).role === 'admin' ? '#7e22ce' : player.role === 'officer' ? '#d97706' : player.role === 'student' ? '#059669' : '#4b5563',
          backgroundColor: player.role === 'dev' || (player as any).role === 'admin' ? '#f3e8ff' : player.role === 'officer' ? '#fef3c7' : player.role === 'student' ? '#d1fae5' : '#f3f4f6'
        }}
      >
        {roleBadge()}
        <span className="text-[#3a2a17] truncate max-w-[100px]">{player.nickname}</span>
      </div>

      {/* Speech Bubble */}
      <div className={`bub font-nunito ${isBubShow ? 'show' : ''}`}>
        {player.bubText}
      </div>

      {/* Emote Bubble */}
      <div
        className={`emote-bub ${isEmoteShow ? 'show' : ''}`}
        style={{ backgroundImage: player.bubEmote ? `url(${player.bubEmote})` : undefined }}
      />
    </div>
  )
}
