'use client'

import React from 'react'
import { AlertTriangle, Sparkles, Bug, Trophy, X, ShieldAlert } from 'lucide-react'

interface MultiverseBetaModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MultiverseBetaModal({ isOpen, onClose }: MultiverseBetaModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#04070c]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#111b29] to-[#0e1622] border border-[#22344a] hover:border-[rgba(217,164,65,0.45)] transition-all duration-300 rounded-[8px] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative font-['Space_Grotesk'] text-[#c9d6e2]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 border border-[#22344a] rounded-[3px] text-[#7f93a8] hover:text-[#e9f0f7] hover:border-[#d9a441] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-['Special_Elite'] text-[11px] tracking-[2px] text-[#d9a441] border border-[rgba(217,164,65,0.5)] px-[8px] py-[3px] uppercase rounded-[2px] bg-[rgba(217,164,65,0.08)] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> BETA NOTICE & DISCLAIMER
          </span>
        </div>

        {/* Title */}
        <h2 className="font-['Special_Elite'] text-[22px] sm:text-[26px] text-[#e9f0f7] uppercase tracking-[1.5px] leading-tight mb-2">
          Multiverse of Sadness
        </h2>
        <p className="text-[13px] text-[#7f93a8] mb-5 italic">
          Please review the experimental universe parameters before proceeding into the void.
        </p>

        {/* Notice List */}
        <div className="space-y-3 mb-6">
          
          {/* Item 1: Beta Status */}
          <div className="p-3.5 bg-[#0a0f16]/90 border border-[#22344a] rounded-[5px] flex items-start gap-3">
            <div className="p-2 bg-[rgba(217,164,65,0.12)] border border-[rgba(217,164,65,0.3)] rounded-[4px] text-[#d9a441] shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Special_Elite'] text-[13px] text-[#e9f0f7] tracking-[1px] uppercase mb-0.5">
                Game is in Beta
              </h3>
              <p className="text-[12px] text-[#96b6d6] leading-relaxed">
                This project is currently in active Beta stage. Physics, universe mechanics, and visual elements are constantly shifting.
              </p>
            </div>
          </div>

          {/* Item 2: Progressive Updates */}
          <div className="p-3.5 bg-[#0a0f16]/90 border border-[#22344a] rounded-[5px] flex items-start gap-3">
            <div className="p-2 bg-[rgba(150,182,214,0.12)] border border-[rgba(150,182,214,0.3)] rounded-[4px] text-[#96b6d6] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Special_Elite'] text-[13px] text-[#e9f0f7] tracking-[1px] uppercase mb-0.5">
                Progressive Updates
              </h3>
              <p className="text-[12px] text-[#96b6d6] leading-relaxed">
                New universes, sound modes, custom assets, and grief mechanics will be introduced progressively in future builds.
              </p>
            </div>
          </div>

          {/* Item 3: Expected Bugs */}
          <div className="p-3.5 bg-[#0a0f16]/90 border border-[#22344a] rounded-[5px] flex items-start gap-3">
            <div className="p-2 bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] rounded-[4px] text-red-400 shrink-0 mt-0.5">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Special_Elite'] text-[13px] text-[#e9f0f7] tracking-[1px] uppercase mb-0.5">
                Expect Bugs & Anomalies
              </h3>
              <p className="text-[12px] text-[#96b6d6] leading-relaxed">
                You may encounter bugs, erratic hitboxes, audio glitches, or unexpected universe collisions. Proceed with patience.
              </p>
            </div>
          </div>

          {/* Item 4: No Leaderboards */}
          <div className="p-3.5 bg-[#0a0f16]/90 border border-[#22344a] rounded-[5px] flex items-start gap-3">
            <div className="p-2 bg-[rgba(127,147,168,0.12)] border border-[rgba(127,147,168,0.3)] rounded-[4px] text-[#7f93a8] shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 opacity-60" />
            </div>
            <div>
              <h3 className="font-['Special_Elite'] text-[13px] text-[#e9f0f7] tracking-[1px] uppercase mb-0.5">
                No Leaderboards
              </h3>
              <p className="text-[12px] text-[#96b6d6] leading-relaxed">
                There are currently no global leaderboards. Only your local personal records and universe stats are saved on your device.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-transparent border border-[rgba(217,164,65,0.65)] hover:border-[#d9a441] text-[#d9a441] hover:bg-[#d9a441] hover:text-[#141008] font-['Special_Elite'] text-[13px] tracking-[3px] uppercase rounded-[4px] transition-all duration-300 shadow-[0_4px_20px_rgba(217,164,65,0.2)] font-semibold cursor-pointer active:scale-[0.99] text-center"
        >
          ACKNOWLEDGE & ENTER BETA
        </button>

      </div>
    </div>
  )
}
