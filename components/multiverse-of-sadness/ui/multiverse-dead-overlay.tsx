import React from 'react'
import { BookOpen, RotateCcw } from 'lucide-react'

interface MultiverseDeadOverlayProps {
  score: number
  best: number
  epitaph: string
  onRestart: (e: React.MouseEvent) => void
  onOpenDex: () => void
  unlockedCount: number
  runsCount?: number
  tearsCount?: number
  runUnis?: number
  flapsCount?: number
}

export function MultiverseDeadOverlay({
  score,
  best,
  epitaph,
  onRestart,
  onOpenDex,
  unlockedCount,
  runsCount = 1,
  tearsCount = 0,
  runUnis = 0,
  flapsCount = 0
}: MultiverseDeadOverlayProps) {
  return (
    <div className="absolute inset-0 z-[8] flex flex-col items-center justify-center gap-[13px] text-center bg-[#04070c]/[0.68] p-[24px] transition-all duration-500 font-['Space_Grotesk']">
      <div className="font-['Space_Grotesk'] text-[10px] tracking-[3px] uppercase text-[#7f93a8]">
        run #{runsCount} concluded
      </div>
      
      <p className="font-['Special_Elite'] text-[19px] text-[#e9f0f7] max-w-[330px] leading-[1.5] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
        {epitaph}
      </p>

      <div className="flex gap-[9px] my-[4px] justify-center flex-wrap">
        <div className="bg-[rgba(14,22,34,0.85)] border border-[#22344a] p-[10px_13px] min-w-[74px] rounded-[5px] text-center transition-all duration-300 hover:border-[#3a5474] hover:-translate-y-[2px]">
          <b className="block text-[22px] font-bold text-[#d9a441] leading-none">{score}</b>
          <span className="text-[8.5px] tracking-[1.4px] uppercase text-[#7f93a8] block mt-[3px] leading-[1.6]">
            emotional<br />damage
          </span>
        </div>
        <div className="bg-[rgba(14,22,34,0.85)] border border-[#22344a] p-[10px_13px] min-w-[74px] rounded-[5px] text-center transition-all duration-300 hover:border-[#3a5474] hover:-translate-y-[2px]">
          <b className="block text-[22px] font-bold text-[#d9a441] leading-none">{tearsCount}</b>
          <span className="text-[8.5px] tracking-[1.4px] uppercase text-[#7f93a8] block mt-[3px] leading-[1.6]">
            tears<br />shed
          </span>
        </div>
        <div className="bg-[rgba(14,22,34,0.85)] border border-[#22344a] p-[10px_13px] min-w-[74px] rounded-[5px] text-center transition-all duration-300 hover:border-[#3a5474] hover:-translate-y-[2px]">
          <b className="block text-[22px] font-bold text-[#d9a441] leading-none">{runUnis}</b>
          <span className="text-[8.5px] tracking-[1.4px] uppercase text-[#7f93a8] block mt-[3px] leading-[1.6]">
            universes<br />felt
          </span>
        </div>
        <div className="bg-[rgba(14,22,34,0.85)] border border-[#22344a] p-[10px_13px] min-w-[74px] rounded-[5px] text-center transition-all duration-300 hover:border-[#3a5474] hover:-translate-y-[2px]">
          <b className="block text-[22px] font-bold text-[#d9a441] leading-none">{best}</b>
          <span className="text-[8.5px] tracking-[1.4px] uppercase text-[#7f93a8] block mt-[3px] leading-[1.6]">
            best<br />damage
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 w-full items-center mt-[4px]">
        <button
          id="again"
          onClick={onRestart}
          className="font-['Space_Grotesk'] font-bold text-[12px] tracking-[3px] uppercase text-[#d9a441] bg-transparent border border-[rgba(217,164,65,0.55)] px-[30px] py-[12px] rounded-[4px] cursor-pointer transition-all duration-250 hover:bg-[#d9a441] hover:text-[#141008] hover:-translate-y-[2px] hover:shadow-[0_8px_26px_rgba(217,164,65,0.28)] active:translate-y-0 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> feel again
        </button>

        <button
          onClick={onOpenDex}
          className="font-['Space_Grotesk'] border border-[#22344a] px-[16px] py-[6px] text-[10.5px] font-medium tracking-[1.8px] uppercase text-[#7f93a8] rounded-[3px] transition-all duration-300 hover:border-[#3a5474] hover:text-[#c9d6e2] cursor-pointer flex items-center justify-center gap-2"
        >
          <BookOpen className="w-3.5 h-3.5" /> View Dex ({unlockedCount}/40)
        </button>
      </div>

      <p className="text-[10.5px] text-[#7f93a8] tracking-[0.5px] max-w-[300px] leading-[1.6] font-['Space_Grotesk']">
        the void has noted your flap count: <span>{flapsCount}</span>
      </p>
    </div>
  )
}
