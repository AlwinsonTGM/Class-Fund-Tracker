import React from 'react'
import { UniCardState } from '../multiverse-types'

interface MultiverseUniverseCardProps {
  card: UniCardState
}

export function MultiverseUniverseCard({ card }: MultiverseUniverseCardProps) {
  if (!card.show) return null

  return (
    <div className="absolute left-0 right-0 top-[33%] px-6 text-center z-[7] pointer-events-none animate-card">
      <div className="text-[10px] tracking-[4px] text-[#d9a441] font-bold font-['Space_Grotesk'] uppercase inline-flex items-center gap-2">
        <span>UNIVERSE #{card.num}</span>
        {card.isFusion && (
          <span className="text-[10px] uppercase font-bold text-rose-400 border-l border-slate-700 pl-2">
            🔥 FUSION
          </span>
        )}
        {card.rarity === 'cursed' && !card.isFusion && (
          <span className="text-[10px] uppercase font-bold text-purple-400 border-l border-slate-700 pl-2">
            💀 CURSED
          </span>
        )}
      </div>

      <div className="font-['Special_Elite'] text-[27px] text-[#e9f0f7] my-[8px] mb-[5px] tracking-[1px] drop-shadow-lg">
        {card.name}
      </div>

      <div className="font-['Space_Grotesk'] text-[12px] text-[#96b6d6] italic drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] max-w-sm mx-auto">
        {card.sub}
      </div>
    </div>
  )
}
