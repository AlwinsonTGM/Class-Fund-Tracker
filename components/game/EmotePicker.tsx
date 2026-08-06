'use client';

import React, { useState } from 'react';
import { PLAYER_EMOTES, EmoteDef } from '@/config/emotes';
import { playSfx } from '@/lib/sfx';
import { X, Search } from 'lucide-react';

interface EmotePickerProps {
  onSelect: (emote: EmoteDef) => void;
  onClose?: () => void;
}

const CATEGORIES = [
  'All',
  'Emotions & Expressions',
  'States & Feelings',
  'Physical Status',
  'Facial Expressions',
  'Combat & Effects',
  'Misc & Weather',
  'Items & Food',
  'RPG Objects',
  'Characters & Hands',
  'Card Suits & Symbols',
];

export const EmotePicker: React.FC<EmotePickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [hoveredEmote, setHoveredEmote] = useState<EmoteDef | null>(null);

  const filtered = PLAYER_EMOTES.filter((e) => {
    const matchesCat = activeCategory === 'All' || e.category === activeCategory;
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.key.toLowerCase().includes(search.toLowerCase()) ||
      e.shortcuts.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col w-[320px] max-h-[380px] bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-xl shadow-2xl overflow-hidden select-none p-2 space-y-2 z-50">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b-2 border-[#d4b47d] pb-1.5 px-1">
        <div className="flex items-center gap-1.5 font-pixel font-bold text-xs text-[#5b3a17]">
          <span>Select Emote</span>
          <span className="text-[10px] bg-[#e7d4a3] px-1.5 py-0.5 rounded-full text-[#6a5230]">
            {filtered.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-pixel text-[#5b3a17] hover:text-[#9a3b2e] px-1 flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search emote or shortcut…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="shrink-0 w-full font-nunito text-xs bg-[#fff8e1] border-2 border-[#5b3a17] rounded-lg px-2 py-1 text-[#3a2a17] focus:outline-none focus:border-[#ffb703]"
      />

      {/* Category Pills */}
      <div className="shrink-0 flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSfx('click');
              setActiveCategory(cat);
            }}
            className={`font-pixel text-[10px] px-2 py-0.5 whitespace-nowrap rounded-md border transition-all ${
              activeCategory === cat
                ? 'bg-[#ffb703] border-[#5b3a17] text-[#3a2410] font-bold shadow-sm'
                : 'bg-[#e7d4a3] border-transparent text-[#6a5230] hover:bg-[#ebdcae]'
            }`}
          >
            {cat === 'All' ? 'All' : cat.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Grid of Emote Icons */}
      <div className="flex-1 overflow-y-auto grid grid-cols-6 content-start gap-1.5 p-1 bg-[#fff6d8] border-2 border-[#d4b47d] rounded-lg min-h-[180px]">
        {filtered.length === 0 ? (
          <div className="col-span-6 flex flex-col items-center justify-center py-6 text-center text-xs font-pixel text-[#8c6d46] gap-1">
            <Search className="w-5 h-5 text-[#8c6d46]" />
            <span>No emotes found</span>
          </div>
        ) : (
          filtered.map((emote) => (
            <button
              key={emote.id}
              onClick={() => {
                playSfx('click');
                onSelect(emote);
              }}
              onMouseEnter={() => setHoveredEmote(emote)}
              onMouseLeave={() => setHoveredEmote(null)}
              className="w-10 h-10 flex items-center justify-center bg-[#fff8e1] border-2 border-[#a37f4e] rounded-lg hover:border-[#ffb703] hover:bg-[#fff2c2] hover:scale-110 active:scale-95 transition-all relative overflow-hidden group"
            >
              <div
                className="chat-inline-emote"
                style={{
                  backgroundImage: `url(${emote.imagePath})`,
                }}
              />
            </button>
          ))
        )}
      </div>

      {/* Tooltip Footer */}
      <div className="shrink-0 h-6 flex items-center justify-between px-1.5 text-[11px] font-pixel text-[#5b3a17] bg-[#e7d4a3] rounded-md border border-[#c9a86a]">
        {hoveredEmote ? (
          <>
            <span className="truncate max-w-[190px] font-bold">{hoveredEmote.name}</span>
            <span className="text-[10px] text-[#8c6d46] bg-[#fff8e1] px-1 rounded border border-[#c9a86a]">
              {hoveredEmote.shortcuts[0]}
            </span>
          </>
        ) : (
          <span className="text-[10px] text-[#8c6d46] italic">Hover to preview shortcut</span>
        )}
      </div>
    </div>
  );
};
