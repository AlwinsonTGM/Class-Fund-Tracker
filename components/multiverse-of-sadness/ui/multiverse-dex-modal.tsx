'use client'

import React, { useState, useMemo } from 'react'
import { UNIVERSE_CONFIGS, UniverseFlavor, UniverseConfig, RarityTier } from '../multiverse-config'
import { getAllFusionConfigs, FusionConfig } from '../multiverse-fusions'
import { BookOpen, Ban, CheckCircle2, Lock, X, ShieldAlert, Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

interface MultiverseDexModalProps {
  isOpen: boolean
  onClose: () => void
  unlockedUniIds: string[]
  unlockedFusionKeys?: string[]
  bannedUniId: string | null
  onSetBannedUni: (id: string | null) => void
}

type DexMode = 'universes' | 'fusions'

const ITEMS_PER_PAGE = 24

export function MultiverseDexModal({
  isOpen,
  onClose,
  unlockedUniIds,
  unlockedFusionKeys = [],
  bannedUniId,
  onSetBannedUni
}: MultiverseDexModalProps) {
  const [activeTabMode, setActiveTabMode] = useState<DexMode>('universes')
  const [selectedFlavor, setSelectedFlavor] = useState<UniverseFlavor | 'all'>('all')
  const [selectedFusionRarity, setSelectedFusionRarity] = useState<RarityTier | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [activeCard, setActiveCard] = useState<UniverseConfig | null>(null)
  const [activeFusionCard, setActiveFusionCard] = useState<FusionConfig | null>(null)

  const allFusions = useMemo(() => getAllFusionConfigs(), [])

  if (!isOpen) return null

  const witnessedUniCount = unlockedUniIds.length
  const totalUniCount = UNIVERSE_CONFIGS.length

  const witnessedFusionCount = unlockedFusionKeys.length
  const totalFusionCount = allFusions.length

  // Filter Base Universes
  const filteredUniverses = UNIVERSE_CONFIGS.filter(u => {
    const isUnlocked = unlockedUniIds.includes(u.id)
    if (statusFilter === 'unlocked' && !isUnlocked) return false
    if (statusFilter === 'locked' && isUnlocked) return false

    if (selectedFlavor !== 'all' && u.flavor !== selectedFlavor) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = u.name.toLowerCase().includes(q)
      const matchesSub = u.sub.toLowerCase().includes(q)
      const matchesNum = u.num.includes(q)
      return matchesName || matchesSub || matchesNum
    }
    return true
  })

  // Filter Fusion Universes
  const filteredFusions = allFusions.filter(f => {
    const isUnlocked = unlockedFusionKeys.includes(f.key)
    if (statusFilter === 'unlocked' && !isUnlocked) return false
    if (statusFilter === 'locked' && isUnlocked) return false

    if (selectedFusionRarity !== 'all' && f.rarity !== selectedFusionRarity) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = f.name.toLowerCase().includes(q)
      const matchesSub = f.sub.toLowerCase().includes(q)
      const matchesDesc = f.description.toLowerCase().includes(q)
      const matchesNum = f.num.toLowerCase().includes(q)
      const matchesUni1 = f.uni1.name.toLowerCase().includes(q)
      const matchesUni2 = f.uni2.name.toLowerCase().includes(q)
      return matchesName || matchesSub || matchesDesc || matchesNum || matchesUni1 || matchesUni2
    }
    return true
  })

  // Pagination for Fusions
  const totalFusionPages = Math.ceil(filteredFusions.length / ITEMS_PER_PAGE) || 1
  const paginatedFusions = filteredFusions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0e1622] border border-[#22344a] rounded-[8px] shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden text-[#c9d6e2] font-['Space_Grotesk']">
        
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
                  {activeTabMode === 'universes'
                    ? `${witnessedUniCount} / ${totalUniCount} Universes`
                    : `${witnessedFusionCount} / ${totalFusionCount} Fusions`}
                </span>
              </h2>
              <p className="text-xs text-[#7f93a8] mt-0.5">Cataloging every universe & fusion anomaly across time and sorrow.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="border border-[#22344a] px-[11px] py-[5px] text-[10.5px] font-medium tracking-[1.8px] uppercase text-[#7f93a8] rounded-[3px] transition-all duration-300 hover:border-[#3a5474] hover:text-[#c9d6e2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0a0f16] border-b border-[#22344a] gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTabMode('universes')
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 text-[11px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all cursor-pointer flex items-center gap-2 ${
                activeTabMode === 'universes'
                  ? 'bg-[rgba(217,164,65,0.15)] text-[#d9a441] border border-[rgba(217,164,65,0.5)] font-bold'
                  : 'bg-[#111b29] text-[#7f93a8] border border-[#22344a] hover:text-[#c9d6e2]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Universes ({witnessedUniCount}/{totalUniCount})
            </button>
            <button
              onClick={() => {
                setActiveTabMode('fusions')
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 text-[11px] font-medium tracking-[1.8px] uppercase rounded-[3px] transition-all cursor-pointer flex items-center gap-2 ${
                activeTabMode === 'fusions'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-600/50 font-bold'
                  : 'bg-[#111b29] text-[#7f93a8] border border-[#22344a] hover:text-[#c9d6e2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Fusion Dex ({witnessedFusionCount}/{totalFusionCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7f93a8]" />
            <input
              type="text"
              placeholder={activeTabMode === 'universes' ? 'Search universes...' : 'Search 780 fusions...'}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-3 py-1 text-xs bg-[#111b29] border border-[#22344a] rounded-[3px] text-[#e9f0f7] placeholder-[#5a6d82] focus:outline-none focus:border-[#d9a441]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#7f93a8] hover:text-[#c9d6e2]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Ban Bar Banner */}
        <div className="px-6 py-2 bg-[#111b29]/60 border-b border-[#22344a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#c9d6e2]">
            <ShieldAlert className="w-4 h-4 text-[#d9a441]" />
            <span>
              Avoided Truth:{' '}
              {bannedUni ? (
                <span className="font-bold text-[#d9a441]">#{bannedUni.num} {bannedUni.name}</span>
              ) : (
                <span className="text-[#7f93a8] italic">None (Avoid 1 universe per run)</span>
              )}
            </span>
          </div>
          {bannedUniId && (
            <button
              onClick={() => onSetBannedUni(null)}
              className="border border-[rgba(217,164,65,0.45)] px-[9px] py-[2px] text-[10px] font-medium tracking-[1.5px] uppercase text-[#d9a441] rounded-[3px] hover:bg-[rgba(217,164,65,0.13)] cursor-pointer"
            >
              Clear Ban
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 px-6 py-2.5 border-b border-[#22344a] bg-[#0a0f16] overflow-x-auto custom-scrollbar text-xs">
          {activeTabMode === 'universes' ? (
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All' },
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
                  className={`px-[9px] py-[4px] text-[10px] font-medium tracking-[1.5px] uppercase rounded-[3px] transition-all cursor-pointer ${
                    selectedFlavor === tab.id
                      ? 'border border-[rgba(217,164,65,0.55)] text-[#d9a441] bg-[rgba(217,164,65,0.13)]'
                      : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All Rarities' },
                { id: 'common', label: 'Common' },
                { id: 'uncommon', label: 'Uncommon' },
                { id: 'cursed', label: 'Cursed 💀' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedFusionRarity(tab.id as any)
                    setCurrentPage(1)
                  }}
                  className={`px-[9px] py-[4px] text-[10px] font-medium tracking-[1.5px] uppercase rounded-[3px] transition-all cursor-pointer ${
                    selectedFusionRarity === tab.id
                      ? 'border border-purple-500/60 text-purple-300 bg-purple-950/40'
                      : 'border border-[#22344a] text-[#7f93a8] hover:border-[#3a5474] hover:text-[#c9d6e2]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Discovery Status Filter */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'unlocked', label: 'Unlocked' },
              { id: 'locked', label: 'Locked' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id as any)
                  setCurrentPage(1)
                }}
                className={`px-2 py-1 text-[10px] tracking-[1px] uppercase rounded-[3px] transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#22344a] text-[#e9f0f7] font-semibold'
                    : 'text-[#7f93a8] hover:text-[#c9d6e2]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTabMode === 'universes' ? (
            /* Base Universes Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredUniverses.map(u => {
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

                      <h3 className="font-bold text-sm text-[#e9f0f7] group-hover:text-[#f0d9a8] transition-colors flex items-center gap-2 font-['Special_Elite']">
                        {!isUnlocked ? (
                          <span className="flex items-center gap-1 text-[#7f93a8] font-['Space_Grotesk'] font-normal">
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
          ) : (
            /* Fusion Dex Grid & Pagination */
            <div>
              {paginatedFusions.length === 0 ? (
                <div className="py-12 text-center text-[#7f93a8]">
                  <p className="text-sm italic font-['Space_Grotesk']">No fusion anomalies match your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedFusions.map(f => {
                    const isUnlocked = unlockedFusionKeys.includes(f.key)

                    return (
                      <div
                        key={f.key}
                        onClick={() => setActiveFusionCard(f)}
                        className={`relative group p-4 rounded-[6px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                          isUnlocked
                            ? 'bg-[#111b29] border-purple-900/40 hover:border-purple-600/60 hover:bg-[#161c2e]'
                            : 'bg-[#0a0f16] border-[#22344a]/40 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-['Special_Elite'] text-xs text-purple-400 font-bold">{f.num}</span>
                            {getRarityBadge(f.rarity)}
                          </div>

                          <h3 className="font-bold text-xs text-[#e9f0f7] group-hover:text-purple-300 transition-colors font-['Special_Elite'] line-clamp-1">
                            {!isUnlocked ? (
                              <span className="flex items-center gap-1 text-[#7f93a8] font-['Space_Grotesk'] font-normal">
                                <Lock className="w-3.5 h-3.5" /> Locked Fusion
                              </span>
                            ) : (
                              f.name
                            )}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[10px] text-[#7f93a8] mt-1">
                            <span className="truncate max-w-[110px]">#{f.uni1.num} {f.uni1.name}</span>
                            <span className="text-purple-400">×</span>
                            <span className="truncate max-w-[110px]">#{f.uni2.num} {f.uni2.name}</span>
                          </div>

                          <p className="text-xs text-[#96b6d6] italic mt-2 line-clamp-2">
                            {isUnlocked ? f.description : 'Reach score ≥ 30 to trigger fusion shifts in battle.'}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#22344a]/60 flex items-center justify-between text-[10.5px] text-[#7f93a8]">
                          <span className="uppercase tracking-[1.2px] text-[9.5px]">Fusion Pair</span>
                          {isUnlocked ? (
                            <span className="text-purple-300 flex items-center gap-1 font-medium text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-purple-400" /> Discovered
                            </span>
                          ) : (
                            <span className="text-[#5a6d82] text-[10px]">Locked</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination Bar for Fusions */}
              {totalFusionPages > 1 && (
                <div className="mt-6 pt-4 border-t border-[#22344a] flex items-center justify-between text-xs text-[#7f93a8]">
                  <span>
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredFusions.length)} of {filteredFusions.length} Fusions
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-1.5 border border-[#22344a] rounded-[3px] text-[#c9d6e2] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#111b29]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-['Special_Elite'] text-[#d9a441] px-2">
                      Page {currentPage} / {totalFusionPages}
                    </span>
                    <button
                      disabled={currentPage === totalFusionPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalFusionPages))}
                      className="p-1.5 border border-[#22344a] rounded-[3px] text-[#c9d6e2] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#111b29]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Base Universe Detail Modal Popup */}
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

        {/* Fusion Detail Modal Popup */}
        {activeFusionCard && (
          <div className="absolute inset-0 z-20 bg-[#04070c]/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-[#0e1622] border border-purple-800/60 rounded-[8px] p-6 shadow-2xl relative font-['Space_Grotesk']">
              <button
                onClick={() => setActiveFusionCard(null)}
                className="absolute top-4 right-4 p-1.5 border border-[#22344a] rounded-[3px] text-[#7f93a8] hover:text-[#c9d6e2] hover:border-[#3a5474]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-['Special_Elite'] text-sm text-purple-400 font-bold">{activeFusionCard.num}</span>
                {getRarityBadge(activeFusionCard.rarity)}
              </div>

              <h3 className="font-['Special_Elite'] text-2xl uppercase text-[#e9f0f7] mb-1">
                {activeFusionCard.name}
              </h3>
              <p className="text-xs text-purple-300 italic tracking-wide">{activeFusionCard.sub}</p>

              {/* Source Universes Component Cards */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 bg-[#111b29] border border-[#22344a] rounded-[4px]">
                  <span className="font-['Special_Elite'] text-[10px] text-[#d9a441]">#{activeFusionCard.uni1.num}</span>
                  <h4 className="font-bold text-xs text-[#e9f0f7] font-['Special_Elite'] mt-0.5">{activeFusionCard.uni1.name}</h4>
                  <p className="text-[10px] text-[#7f93a8] italic mt-1 line-clamp-1">"{activeFusionCard.uni1.sub}"</p>
                </div>
                <div className="p-3 bg-[#111b29] border border-[#22344a] rounded-[4px]">
                  <span className="font-['Special_Elite'] text-[10px] text-[#d9a441]">#{activeFusionCard.uni2.num}</span>
                  <h4 className="font-bold text-xs text-[#e9f0f7] font-['Special_Elite'] mt-0.5">{activeFusionCard.uni2.name}</h4>
                  <p className="text-[10px] text-[#7f93a8] italic mt-1 line-clamp-1">"{activeFusionCard.uni2.sub}"</p>
                </div>
              </div>

              <div className="p-4 rounded-[4px] bg-[#111b29]/80 border border-purple-900/40 mb-5">
                <p className="text-xs text-[#c9d6e2] leading-relaxed font-['Space_Grotesk']">
                  {unlockedFusionKeys.includes(activeFusionCard.key)
                    ? activeFusionCard.description
                    : 'This fusion anomaly is currently locked. Score 30 or higher in a run to unleash multi-universe shifts.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-[#7f93a8]">
                <span>Status:</span>
                <span className="font-semibold text-purple-300 uppercase">
                  {unlockedFusionKeys.includes(activeFusionCard.key) ? 'Discovered & Witnessed' : 'Locked'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
