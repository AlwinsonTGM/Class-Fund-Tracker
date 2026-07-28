'use client'

import React, { useState } from 'react'
import { UNIVERSE_CONFIGS, UniverseFlavor, UniverseConfig } from '../multiverse-config'
import { BookOpen, Ban, CheckCircle2, Lock, X, ShieldAlert } from 'lucide-react'

interface MultiverseDexModalProps {
  isOpen: boolean
  onClose: () => void
  unlockedUniIds: string[]
  bannedUniId: string | null
  onSetBannedUni: (id: string | null) => void
}

export function MultiverseDexModal({
  isOpen,
  onClose,
  unlockedUniIds,
  bannedUniId,
  onSetBannedUni
}: MultiverseDexModalProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<UniverseFlavor | 'all'>('all')
  const [activeCard, setActiveCard] = useState<UniverseConfig | null>(null)

  if (!isOpen) return null

  const witnessedCount = unlockedUniIds.length
  const totalCount = UNIVERSE_CONFIGS.length

  const filtered = UNIVERSE_CONFIGS.filter(u => {
    if (selectedFlavor === 'all') return true
    return u.flavor === selectedFlavor
  })

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'cursed':
        return (
          <span className="px-2 py-0.5 text-[9.5px] uppercase tracking-[1.5px] font-['Space_Grotesk'] font-bold bg-purple-950/60 text-purple-300 border border-purple-600/50 rounded-[3px] flex items-center gap-1">
            💀 CURSED
          </span>
        )
      case 'uncommon':
        return (
          <span className="px-2 py-0.5 text-[9.5px] uppercase tracking-[1.5px] font-['Space_Grotesk'] font-bold bg-[rgba(217,164,65,0.15)] text-[#d9a441] border border-[rgba(217,164,65,0.45)] rounded-[3px]">
            ⚡ UNCOMMON
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 text-[9.5px] uppercase tracking-[1.5px] font-['Space_Grotesk'] font-medium bg-[#111b29] text-[#7f93a8] border border-[#22344a] rounded-[3px]">
            COMMON
          </span>
        )
    }
  }

  const bannedUni = UNIVERSE_CONFIGS.find(u => u.id === bannedUniId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04070c]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0e1622] border border-[#22344a] rounded-[8px] shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden text-[#c9d6e2] font-['Space_Grotesk']">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22344a] bg-[#111b29]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[rgba(217,164,65,0.1)] border border-[rgba(217,164,65,0.4)] rounded-[4px] text-[#d9a441]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-['Special_Elite'] font-normal tracking-[2.5px] uppercase text-[#e9f0f7] flex items-center gap-2">
                Multiverse Dex
                <span className="font-['Special_Elite'] text-[11px] px-2.5 py-0.5 rounded-[3px] bg-[rgba(217,164,65,0.13)] text-[#d9a441] border border-[rgba(217,164,65,0.5)] font-normal tracking-[1.5px]">
                  {witnessedCount} / {totalCount} Witnessed
                </span>
              </h2>
              <p className="text-xs text-[#7f93a8] mt-0.5">Collect every universe of despair across time & space.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="border border-[#22344a] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase text-[#7f93a8] rounded-[3px] transition-all duration-300 hover:border-[#3a5474] hover:text-[#c9d6e2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ban Bar Banner */}
        <div className="px-6 py-2.5 bg-[#111b29]/60 border-b border-[#22344a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#c9d6e2]">
            <ShieldAlert className="w-4 h-4 text-[#d9a441]" />
            <span>
              Avoided Truth:{' '}
              {bannedUni ? (
                <span className="font-bold text-[#d9a441]">#{bannedUni.num} {bannedUni.name}</span>
              ) : (
                <span className="text-[#7f93a8] italic">None (You may avoid one universe per run)</span>
              )}
            </span>
          </div>
          {bannedUniId && (
            <button
              onClick={() => onSetBannedUni(null)}
              className="border border-[rgba(217,164,65,0.45)] px-[9px] py-[3px] text-[10px] font-medium tracking-[1.5px] uppercase text-[#d9a441] rounded-[3px] hover:bg-[rgba(217,164,65,0.13)] cursor-pointer"
            >
              Clear Ban
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#22344a] bg-[#0a0f16] overflow-x-auto custom-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Universes' },
            { id: 'classic', label: 'Classic' },
            { id: 'physics', label: 'Physics' },
            { id: 'weather', label: 'Weather' },
            { id: 'fourth_wall', label: 'Fourth-Wall' },
            { id: 'cinema', label: 'Cinema' },
            { id: 'online', label: 'Online' },
            { id: 'cursed', label: 'Cursed 💀' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFlavor(tab.id as any)}
              className={`px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 whitespace-nowrap cursor-pointer ${
                selectedFlavor === tab.id
                  ? 'border border-[rgba(217,164,65,0.55)] text-[#d9a441] bg-[rgba(217,164,65,0.13)]'
                  : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 custom-scrollbar">
          {filtered.map(u => {
            const isUnlocked = unlockedUniIds.includes(u.id)
            const isBanned = bannedUniId === u.id

            return (
              <div
                key={u.id}
                onClick={() => setActiveCard(u)}
                className={`relative group p-4 rounded-[6px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isBanned
                    ? 'bg-[rgba(217,164,65,0.08)] border-[rgba(217,164,65,0.45)]'
                    : isUnlocked
                    ? 'bg-[#111b29] border-[#22344a] hover:border-[#3a5474] hover:bg-[#152234]'
                    : 'bg-[#0a0f16] border-[#22344a]/50 opacity-55'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-['Special_Elite'] text-xs text-[#d9a441]">#{u.num}</span>
                    <div className="flex items-center gap-1.5">
                      {isBanned && (
                        <span className="px-1.5 py-0.5 rounded-[3px] text-[9.5px] bg-[rgba(217,164,65,0.15)] text-[#d9a441] border border-[rgba(217,164,65,0.45)] font-bold flex items-center gap-1">
                          <Ban className="w-3 h-3" /> BANNED
                        </span>
                      )}
                      {getRarityBadge(u.rarity)}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-[#e9f0f7] group-hover:text-[#f0d9a8] transition-colors flex items-center gap-2">
                    {!isUnlocked ? (
                      <span className="flex items-center gap-1 text-[#7f93a8]">
                        <Lock className="w-3.5 h-3.5" /> ???
                      </span>
                    ) : (
                      u.name
                    )}
                  </h3>

                  <p className="text-xs text-[#96b6d6] italic mt-1.5 line-clamp-2">
                    {isUnlocked ? `"${u.sub}"` : 'Witness this universe in battle to unlock its secrets.'}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#22344a]/70 flex items-center justify-between text-[11px] text-[#7f93a8]">
                  <span className="uppercase tracking-[1.5px] font-['Space_Grotesk'] text-[10px]">{u.flavor.replace('_', ' ')}</span>
                  {isUnlocked && (
                    <span className="text-[#96b6d6] flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-[#d9a441]" /> Discovered
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Card Detail Popup Modal */}
        {activeCard && (
          <div className="absolute inset-0 z-20 bg-[#04070c]/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#0e1622] border border-[#22344a] rounded-[8px] p-6 shadow-2xl relative font-['Space_Grotesk']">
              <button
                onClick={() => setActiveCard(null)}
                className="absolute top-4 right-4 p-1.5 border border-[#22344a] rounded-[3px] text-[#7f93a8] hover:text-[#c9d6e2] hover:border-[#3a5474]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-['Special_Elite'] text-sm text-[#d9a441]">#{activeCard.num}</span>
                {getRarityBadge(activeCard.rarity)}
              </div>

              <h3 className="font-['Special_Elite'] text-2xl uppercase text-[#e9f0f7] mb-2">{activeCard.name}</h3>

              <div className="p-3 rounded-[4px] bg-[#111b29] border border-[#22344a] my-4">
                <p className="text-sm italic text-[#96b6d6] text-center font-['Space_Grotesk']">
                  "{activeCard.sub}"
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#7f93a8] mb-6">
                <div className="flex justify-between py-1 border-b border-[#22344a]">
                  <span>Flavor:</span>
                  <span className="font-semibold text-[#e9f0f7] uppercase">{activeCard.flavor.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#22344a]">
                  <span>Status:</span>
                  <span className="font-semibold text-[#e9f0f7]">
                    {unlockedUniIds.includes(activeCard.id) ? 'Discovered' : 'Locked'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {bannedUniId === activeCard.id ? (
                  <button
                    onClick={() => {
                      onSetBannedUni(null)
                      setActiveCard(null)
                    }}
                    className="border border-[#22344a] px-[16px] py-[8px] text-[10.5px] font-medium tracking-[1.8px] uppercase text-[#7f93a8] rounded-[3px] transition-all duration-300 hover:border-[#3a5474] hover:text-[#c9d6e2] cursor-pointer flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d9a441]" /> Remove Ban
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSetBannedUni(activeCard.id)
                      setActiveCard(null)
                    }}
                    className="border border-[rgba(217,164,65,0.45)] text-[#d9a441] px-[16px] py-[8px] text-[10.5px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all duration-300 hover:border-[#d9a441] hover:bg-[rgba(217,164,65,0.13)] cursor-pointer flex-1 flex items-center justify-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" /> Avoid This Truth (Ban)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

