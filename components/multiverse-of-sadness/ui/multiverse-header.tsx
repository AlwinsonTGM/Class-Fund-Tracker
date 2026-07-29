import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Gamepad2, BookOpen, SlidersHorizontal, X } from 'lucide-react'
import { SoundMode, AudioVolumes } from '../multiverse-audio'

interface MultiverseHeaderProps {
  soundMode: SoundMode
  onCycleSoundMode: () => void
  onOpenDex: () => void
  onOpenBetaModal?: () => void
  unlockedCount: number
  totalCount: number
  best?: number
  volumes: AudioVolumes
  onUpdateVolumes: (newVols: Partial<AudioVolumes>) => void
  onTestFlap?: () => void
  onTestScore?: () => void
}

export function MultiverseHeader({
  soundMode,
  onCycleSoundMode,
  onOpenDex,
  onOpenBetaModal,
  unlockedCount,
  totalCount,
  best = 0,
  volumes,
  onUpdateVolumes,
  onTestFlap,
  onTestScore
}: MultiverseHeaderProps) {
  const router = useRouter()
  const [showVolumeModal, setShowVolumeModal] = useState(false)

  return (
    <header className="relative flex flex-wrap justify-between items-end gap-4 px-6 py-4 bg-[#0a0f16]/90 border-b border-[#22344a] backdrop-blur-md z-30 max-w-[1080px] mx-auto w-full">
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
            <button
              onClick={onOpenBetaModal}
              className="inline-block font-['Special_Elite'] text-[0.42em] tracking-[2px] text-[#d9a441] border border-[rgba(217,164,65,0.5)] px-[8px] py-[3px] align-middle ml-[2px] -translate-y-[4px] hover:bg-[rgba(217,164,65,0.15)] transition-colors cursor-pointer"
              title="View Beta & Disclaimer Notice"
            >
              BETA II
            </button>
          </h1>
          <p className="font-['Space_Grotesk'] text-[13px] text-[#7f93a8] tracking-[0.4px] mt-[9px]">
            a flappy bird mode, but it rains in every universe
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap relative">
        <button
          onClick={onOpenDex}
          className="font-['Space_Grotesk'] border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 hover:border-[#d9a441] hover:bg-[rgba(217,164,65,0.13)] cursor-pointer flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Dex ({unlockedCount}/{totalCount})</span>
        </button>

        <button
          onClick={onCycleSoundMode}
          className={`font-['Space_Grotesk'] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
            soundMode === 'multiverse'
              ? 'border border-[rgba(217,164,65,0.45)] text-[#d9a441] hover:bg-[rgba(217,164,65,0.13)]'
              : soundMode === 'original'
              ? 'border border-[#38bdf8] text-[#38bdf8] hover:bg-[rgba(56,189,248,0.13)]'
              : soundMode === 'flappy'
              ? 'border border-[#4ade80] text-[#4ade80] hover:bg-[rgba(74,222,128,0.13)]'
              : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
          }`}
          title="Cycle SFX Mode (Multiverse Synth → Original 8-Bit → Flappy WAV → Muted)"
        >
          {soundMode === 'multiverse' && <Volume2 className="w-3.5 h-3.5 text-[#d9a441]" />}
          {soundMode === 'original' && <Gamepad2 className="w-3.5 h-3.5 text-[#38bdf8]" />}
          {soundMode === 'flappy' && <span className="text-[#4ade80] text-[12px] leading-none">🐦</span>}
          {soundMode === 'off' && <VolumeX className="w-3.5 h-3.5 text-[#7f93a8]" />}
          <span>
            {soundMode === 'multiverse' && 'sfx: synth'}
            {soundMode === 'original' && 'sfx: 8-bit'}
            {soundMode === 'flappy' && 'sfx: flappy'}
            {soundMode === 'off' && 'sfx: off'}
          </span>
        </button>

        <button
          onClick={() => setShowVolumeModal(prev => !prev)}
          className={`font-['Space_Grotesk'] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
            showVolumeModal
              ? 'border border-[#d9a441] bg-[rgba(217,164,65,0.18)] text-[#d9a441]'
              : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
          }`}
          title="Adjust Audio Volumes"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Volume</span>
        </button>

        <span className="font-['Space_Grotesk'] border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px]">
          best · {best}
        </span>

        {/* Volume Settings Popover */}
        {showVolumeModal && (
          <div className="absolute right-0 top-full mt-2 w-[320px] bg-[#0e1622] border border-[#22344a] rounded-[6px] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-[#22344a]">
              <div className="font-['Special_Elite'] text-[12px] tracking-[2px] uppercase text-[#d9a441]">
                Audio Volume Controls
              </div>
              <button
                onClick={() => setShowVolumeModal(false)}
                className="text-[#7f93a8] hover:text-[#e9f0f7] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-['Space_Grotesk'] text-[12px]">
              {/* Flap Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[#c9d6e2]">
                  <span className="text-[#7f93a8]">Flap Sound</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#d9a441]">{Math.round(volumes.flap * 100)}%</span>
                    {onTestFlap && (
                      <button
                        onClick={onTestFlap}
                        className="text-[10px] uppercase border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-1.5 py-0.5 rounded hover:bg-[rgba(217,164,65,0.15)]"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes.flap}
                  onChange={e => onUpdateVolumes({ flap: parseFloat(e.target.value) })}
                  className="w-full accent-[#d9a441] bg-[#111b29] h-1.5 rounded-lg appearance-none cursor-pointer border border-[#22344a]"
                />
              </div>

              {/* Score / Ting Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[#c9d6e2]">
                  <span className="text-[#7f93a8]">Point / Ting Sound</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#d9a441]">{Math.round(volumes.score * 100)}%</span>
                    {onTestScore && (
                      <button
                        onClick={onTestScore}
                        className="text-[10px] uppercase border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-1.5 py-0.5 rounded hover:bg-[rgba(217,164,65,0.15)]"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes.score}
                  onChange={e => onUpdateVolumes({ score: parseFloat(e.target.value) })}
                  className="w-full accent-[#d9a441] bg-[#111b29] h-1.5 rounded-lg appearance-none cursor-pointer border border-[#22344a]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

