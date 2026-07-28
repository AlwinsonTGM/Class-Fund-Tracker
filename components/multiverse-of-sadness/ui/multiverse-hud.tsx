import React from 'react'
import { UNIVERSE_CONFIGS } from '../multiverse-config'

interface MultiverseHUDProps {
  score: number
  best: number
  uniIndex: number
  runUnis: number
  tearsCount?: number
}

export function MultiverseHUD({ score, best, uniIndex, runUnis, tearsCount = 0 }: MultiverseHUDProps) {
  const activeUni = UNIVERSE_CONFIGS[uniIndex] || UNIVERSE_CONFIGS[0]

  return (
    <>
      {/* In-Game HUD Header */}
      <div
        className={`absolute top-3 left-3.5 right-3.5 flex justify-between items-start z-[6] pointer-events-none transition-all duration-900 ease-[cubic-bezier(0.65,0,0.3,1)] ${
          activeUni?.drama ? '!top-[56px]' : ''
        }`}
      >
        <div>
          <span className="block font-['Space_Grotesk'] text-[9px] tracking-[2.5px] uppercase text-[#7f93a8] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            emotional damage
          </span>
          <span className="font-['Space_Grotesk'] text-[34px] font-bold text-[#e9f0f7] leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {score}
          </span>
          <span className="block font-['Space_Grotesk'] text-[10px] text-[#96b6d6] mt-1 tracking-[1.2px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            tears ×{tearsCount}
          </span>
        </div>

        <div className="text-right">
          <span className="block font-['Space_Grotesk'] text-[9px] tracking-[2.5px] uppercase text-[#7f93a8] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            current universe
          </span>
          <span className="block font-['Special_Elite'] text-[12px] text-[#d9a441] mt-1 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            #{activeUni?.num} · {activeUni?.name}
          </span>
        </div>
      </div>

      {/* Cinematic Letterbox Bars for Drama Universe */}
      <div
        className={`absolute left-0 right-0 top-0 bg-[#04070c] z-[5] transition-[height] duration-1000 ease-[cubic-bezier(0.65,0,0.3,1)] ${
          activeUni?.drama ? 'h-[44px]' : 'h-0'
        }`}
      />
      <div
        className={`absolute left-0 right-0 bottom-0 bg-[#04070c] z-[5] transition-[height] duration-1000 ease-[cubic-bezier(0.65,0,0.3,1)] ${
          activeUni?.drama ? 'h-[44px]' : 'h-0'
        }`}
      />
    </>
  )
}
