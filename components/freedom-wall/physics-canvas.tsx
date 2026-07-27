'use client'

import React from 'react'
import { FreedomPost, UserType, ToolType, Position } from './types'
import { FreedomPostCard } from './freedom-post-card'

export interface PhysicsCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>
  cardRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>
  activePosts: FreedomPost[]
  isOfficer: boolean
  user?: UserType | null
  activeBackground: string
  backgroundGifs: Record<string, string>
  shakeCanvas: boolean
  activeDragId: number | null
  activeTool: ToolType
  isDraggingTool: boolean
  positions: Record<number, Position>
  highestZIndexes: Record<number, number>
  toolPos: Position | null
  bombLocation: Position | null
  bombCountdown: number | null
  showExplosion: boolean
  onCanvasPointerMove: (e: React.PointerEvent) => void
  onCanvasClick: (e: React.MouseEvent) => void
  onPointerDown: (e: React.PointerEvent, postId: number) => void
  onPointerMove: (e: React.PointerEvent, postId: number) => void
  onPointerUp: (e: React.PointerEvent, postId: number) => void
  onDeletePost: (id: number) => void
  children?: React.ReactNode
}

export function PhysicsCanvas({
  canvasRef,
  cardRefs,
  activePosts,
  isOfficer,
  user,
  activeBackground,
  backgroundGifs,
  shakeCanvas,
  activeDragId,
  activeTool,
  isDraggingTool,
  positions,
  highestZIndexes,
  toolPos,
  bombLocation,
  bombCountdown,
  showExplosion,
  onCanvasPointerMove,
  onCanvasClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDeletePost,
  children
}: PhysicsCanvasProps) {
  return (
    <div
      ref={canvasRef}
      onPointerMove={onCanvasPointerMove}
      onClick={onCanvasClick}
      className={`relative w-full h-[420px] sm:h-[650px] bg-sky-200 dark:bg-slate-950 rounded-3xl overflow-hidden border border-border/60 shadow-inner select-none cursor-grab active:cursor-grabbing bg-cover bg-center transition-colors duration-500 bg-[url('/sky/daytime.png')] dark:bg-[url('/sky/nighttime.png')] ${
        shakeCanvas ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''
      } ${
        (activeDragId !== null || activeTool !== null || isDraggingTool) ? 'touch-none' : ''
      }`}
      style={
        activeBackground !== 'sky'
          ? {
              backgroundImage: `url(${backgroundGifs[activeBackground]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
          : {}
      }
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-3px, -1px); }
          20%, 40%, 60%, 80% { transform: translate(3px, 1px); }
        }
        @keyframes explosion {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; filter: brightness(1.5); }
          50% { opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
      `}} />

      {activePosts.map((post, idx) => {
        const pos = positions[post.id] || { x: 30, y: 30 }
        const isDragging = activeDragId === post.id
        const angle = (post.id % 13) - 6
        const zIndex = highestZIndexes[post.id] || 2

        return (
          <div
            key={post.id}
            ref={el => { cardRefs.current[post.id] = el }}
            onPointerDown={e => {
              e.stopPropagation()
              onPointerDown(e, post.id)
            }}
            onPointerMove={e => onPointerMove(e, post.id)}
            onPointerUp={e => onPointerUp(e, post.id)}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              zIndex: zIndex,
              transform: isDragging
                ? 'scale(1.08) rotate(0deg)'
                : `rotate(${angle}deg)`,
              transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              animationDelay: `${idx * 85}ms`,
              willChange: isDragging ? 'left, top, transform' : 'auto',
              touchAction: 'none'
            }}
            className="w-32 sm:w-40 min-h-[110px] sm:min-h-[130px] flex flex-col p-0.5 group cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-300 anim-note-spawn"
          >
            <FreedomPostCard
              post={post}
              isOfficer={isOfficer}
              user={user}
              onDelete={onDeletePost}
              mode="scatter"
            />
          </div>
        )
      })}

      {/* Floating drag/follow preview tool */}
      {activeTool && toolPos && (
        <div
          style={{
            position: 'absolute',
            left: `${toolPos.x}%`,
            top: `${toolPos.y}%`,
            transform: 'translate(-50%, -50%) scale(1.4)',
            zIndex: 500,
            pointerEvents: 'none'
          }}
          className="text-4xl select-none pointer-events-none"
        >
          {activeTool === 'bomb' ? '💣' : activeTool === 'magnet' ? '🧲' : '🌪️'}
        </div>
      )}

      {/* Dropped bomb countdown display */}
      {bombLocation && bombCountdown !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${bombLocation.x}%`,
            top: `${bombLocation.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 400
          }}
          className="flex flex-col items-center justify-center pointer-events-none select-none"
        >
          <div className="text-4xl animate-bounce">💣</div>
          <div className="bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow border border-white/20 animate-pulse mt-1">
            {bombCountdown}s
          </div>
        </div>
      )}

      {/* Explosion ring visual overlay */}
      {showExplosion && bombLocation && (
        <div
          style={{
            position: 'absolute',
            left: `${bombLocation.x}%`,
            top: `${bombLocation.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 450
          }}
          className="w-44 h-44 rounded-full bg-radial from-amber-500/80 via-orange-500/40 to-transparent animate-[explosion_0.6s_ease-out_forwards] pointer-events-none"
        />
      )}

      {children}
    </div>
  )
}
