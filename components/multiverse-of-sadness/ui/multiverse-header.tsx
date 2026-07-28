import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, BookOpen } from 'lucide-react'

interface MultiverseHeaderProps {
  soundEnabled: boolean
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void
  pixelatedVideo: boolean
  setPixelatedVideo: (val: boolean | ((prev: boolean) => boolean)) => void
  onOpenDex: () => void
  unlockedCount: number
  totalCount: number
  best?: number
}

export function MultiverseHeader({
  soundEnabled,
  setSoundEnabled,
  pixelatedVideo,
  setPixelatedVideo,
  onOpenDex,
  unlockedCount,
  totalCount,
  best = 0
}: MultiverseHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex flex-wrap justify-between items-end gap-4 px-6 py-4 bg-[#0a0f16]/90 border-b border-[#22344a] backdrop-blur-md z-30 max-w-[1080px] mx-auto w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="font-['Space_Grotesk'] border border-[#22344a] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase text-[#7f93a8] rounded-[3px] transition-all duration-300 hover:border-[#3a5474] hover:text-[#c9d6e2] cursor-pointer flex items-center gap-1.5"
          title="Return to Hub"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hub</span>
        </button>
        <div>
          <h1 className="font-['Special_Elite'] text-[clamp(25px,4.2vw,42px)] font-normal tracking-[3px] text-[#e9f0f7] uppercase leading-[1.05] drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
            Multiverse of Sadness{' '}
            <span className="inline-block font-['Special_Elite'] text-[0.42em] tracking-[2px] text-[#d9a441] border border-[rgba(217,164,65,0.5)] px-[8px] py-[3px] align-middle ml-[2px] -translate-y-[4px]">
              II
            </span>
          </h1>
          <p className="font-['Space_Grotesk'] text-[13px] text-[#7f93a8] tracking-[0.4px] mt-[9px]">
            a flappy bird mode, but it rains in every universe
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenDex}
          className="font-['Space_Grotesk'] border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 hover:border-[#d9a441] hover:bg-[rgba(217,164,65,0.13)] cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dex ({unlockedCount}/{totalCount})</span>
        </button>

        <button
          onClick={() => setPixelatedVideo(prev => !prev)}
          className={`font-['Space_Grotesk'] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 cursor-pointer ${
            pixelatedVideo
              ? 'border border-[rgba(217,164,65,0.45)] text-[#d9a441] hover:bg-[rgba(217,164,65,0.13)]'
              : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
          }`}
        >
          Pixelated: {pixelatedVideo ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={() => setSoundEnabled(prev => !prev)}
          className={`font-['Space_Grotesk'] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
            soundEnabled
              ? 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
              : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
          }`}
          title="Toggle SFX"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#d9a441]" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'sound on' : 'sound off'}</span>
        </button>

        <span className="font-['Space_Grotesk'] border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px]">
          best · {best}
        </span>
      </div>
    </header>
  )
}
