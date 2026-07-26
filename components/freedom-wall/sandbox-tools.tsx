'use client'

import React from 'react'
import { ToolType, Position } from './types'

export interface SandboxToolsProps {
  activeTool: ToolType
  bombLocation: Position | null
  onToolPointerDown: (e: React.PointerEvent, tool: 'bomb' | 'magnet' | 'tornado') => void
  onToolPointerMove: (e: React.PointerEvent) => void
  onToolPointerUp: (e: React.PointerEvent) => void
  onToggleTool: (tool: 'magnet' | 'tornado') => void
}

export function SandboxTools({
  activeTool,
  bombLocation,
  onToolPointerDown,
  onToolPointerMove,
  onToolPointerUp,
  onToggleTool
}: SandboxToolsProps) {
  return (
    <div 
      onPointerDown={e => e.stopPropagation()} 
      onClick={e => e.stopPropagation()}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-xl dark:shadow-2xl z-20 backdrop-blur-md text-[11px] font-sans pointer-events-auto transition-all duration-300"
    >
      <span className="font-bold text-slate-500 dark:text-zinc-400 mr-1 hidden sm:inline">
        {activeTool === 'magnet' || activeTool === 'tornado'
          ? '✨ Click canvas to release:'
          : '🕹️ Sandbox tools:'}
      </span>
      
      {/* Bomb Button */}
      <button
        onPointerDown={e => {
          if (bombLocation !== null) return
          onToolPointerDown(e, 'bomb')
        }}
        onPointerMove={onToolPointerMove}
        onPointerUp={onToolPointerUp}
        disabled={bombLocation !== null}
        className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/40 p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-grab active:cursor-grabbing disabled:opacity-40 disabled:cursor-not-allowed font-semibold press-spring text-[10px] select-none touch-action-none"
        title="Drag bomb on board to blow up notes"
      >
        <span>💣</span> <span>Bomb</span>
      </button>

      {/* Magnet Toggle Button */}
      <button
        onClick={() => onToggleTool('magnet')}
        className={`flex items-center justify-center gap-1.5 p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all font-semibold press-spring text-[10px] select-none border cursor-pointer ${
          activeTool === 'magnet'
            ? 'ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-400'
            : 'bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40'
        }`}
        title="Click to toggle Magnet follow mode"
      >
        <span>🧲</span> <span>Magnet</span>
      </button>

      {/* Tornado Toggle Button */}
      <button
        onClick={() => onToggleTool('tornado')}
        className={`flex items-center justify-center gap-1.5 p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all font-semibold press-spring text-[10px] select-none border cursor-pointer ${
          activeTool === 'tornado'
            ? 'ring-2 ring-cyan-500 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-400'
            : 'bg-cyan-50 hover:bg-cyan-100/80 dark:bg-cyan-950/20 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/40'
        }`}
        title="Click to toggle Tornado follow mode"
      >
        <span>🌪️</span> <span>Tornado</span>
      </button>
    </div>
  )
}
