import React from 'react'

interface MultiverseStartOverlayProps {
  onStart?: () => void
}

export function MultiverseStartOverlay({ onStart }: MultiverseStartOverlayProps) {
  return (
    <div
      onClick={onStart}
      className="absolute inset-0 z-[8] flex flex-col items-center justify-center gap-[13px] text-center bg-[#04070c]/[0.68] p-[24px] cursor-pointer font-['Space_Grotesk'] transition-all duration-500"
    >
      <div className="text-[10px] tracking-[3px] uppercase text-[#7f93a8] font-['Space_Grotesk']">
        a flappy bird mod · concept build
      </div>
      <h2 className="font-['Special_Elite'] font-normal text-[34px] text-[#e9f0f7] uppercase tracking-[2px] leading-[1.15] drop-shadow-[0_3px_24px_rgba(0,0,0,0.85)]">
        Multiverse
        <br />
        of Sadness
      </h2>
      <p className="text-[#96b6d6] text-[13px] italic font-['Space_Grotesk']">
        the pipes are randomized. so is the grief.
      </p>
      <div className="mt-[6px] text-[13px] text-[#e9f0f7] font-['Space_Grotesk']">
        press <kbd className="font-['Space_Grotesk'] text-[11px] border border-[#22344a] border-b-2 px-[7px] py-[2px] rounded-[4px] bg-[#111b29] text-[#e9f0f7]">space</kbd> or tap to begin feeling
      </div>
      <p className="text-[10.5px] text-[#7f93a8] tracking-[0.5px] max-w-[300px] leading-[1.6] font-['Space_Grotesk']">
        contains: rain · feelings · one (1) apology from a pipe
      </p>
    </div>
  )
}
