'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PLAYER_EMOTES, EmoteDef } from '@/config/emotes';
import { playSfx } from '@/lib/sfx';
import { EmotePicker } from '@/components/game/EmotePicker';
import { Smile, Plus } from 'lucide-react';

// Default quick bar emote keys
const QUICK_EMOTE_KEYS = [
  'exclamation',
  'pink_heart',
  'sparkles',
  'yellow_star',
  'zzz',
  'party_popper',
  'lightbulb',
  'flame',
  'wave',
  'poop',
];

const FADE_MS = 150;

export const QuickEmoteBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [closingPicker, setClosingPicker] = useState(false);
  const timerRef = useRef<number | null>(null);

  const quickEmotes = QUICK_EMOTE_KEYS.map((k) => PLAYER_EMOTES.find((e) => e.key === k)).filter(
    Boolean
  ) as EmoteDef[];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const openPicker = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClosingPicker(false);
    setShowFullPicker(true);
  };

  const closePicker = () => {
    if (!showFullPicker || closingPicker) return;
    setClosingPicker(true);
    timerRef.current = window.setTimeout(() => {
      setShowFullPicker(false);
      setClosingPicker(false);
      timerRef.current = null;
    }, FADE_MS);
  };

  const togglePicker = () => (showFullPicker ? closePicker() : openPicker());

  const triggerEmote = (emote: EmoteDef) => {
    playSfx('click');
    window.dispatchEvent(
      new CustomEvent('player-trigger-emote', {
        detail: { imagePath: emote.imagePath, ms: 3500 },
      })
    );
  };

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-auto">
      {/* Full Picker Popover (floats above, never shifts the Plaza Chat button) */}
      {showFullPicker && (
        <div
          className={`absolute bottom-[calc(100%+10px)] left-0 z-50 ${
            closingPicker
              ? 'animate-out fade-out-0 zoom-out-95 duration-150'
              : 'animate-in fade-in-0 zoom-in-95 duration-150'
          }`}
        >
          <EmotePicker
            onSelect={(emote) => {
              triggerEmote(emote);
              closePicker();
            }}
            onClose={closePicker}
          />
        </div>
      )}

      {/* Quick Emote Bar Strip (only mounted when open -> toggle stays perfectly centered when closed) */}
      <div className="flex items-center bg-[#f7ecc8] border-3 border-[#5b3a17] p-1.5 rounded-full shadow-lg transition-all hover:border-[#ffb703]">
        <button
          onClick={() => {
            playSfx('click');
            setIsOpen((prev) => !prev);
          }}
          title="Toggle Quick Emotes"
          className="w-7 h-7 shrink-0 grid place-items-center bg-[#ffb703] border-2 border-[#5b3a17] rounded-full hover:scale-105 active:scale-95 transition-transform"
        >
          <Smile className="w-4 h-4 shrink-0 text-[#5b3a17]" />
        </button>

        {isOpen && (
          <div className="flex items-center gap-1 pl-1.5 animate-in fade-in slide-in-from-right-2 duration-150">
            {quickEmotes.map((emote) => (
              <button
                key={emote.id}
                onClick={() => triggerEmote(emote)}
                title={`${emote.name} (${emote.shortcuts[0]})`}
                className="w-7 h-7 flex items-center justify-center bg-[#fff8e1] border-2 border-[#a37f4e] rounded-full hover:border-[#ffb703] hover:bg-[#fff2c2] hover:scale-110 active:scale-90 transition-all overflow-hidden"
              >
                <div
                  className="chat-inline-emote emote-quick"
                  style={{ backgroundImage: `url(${emote.imagePath})`, margin: 0 }}
                />
              </button>
            ))}

            <button
              onClick={() => {
                playSfx('click');
                togglePicker();
              }}
              title="More Emotes..."
              className="w-7 h-7 flex items-center justify-center bg-[#e7d4a3] border-2 border-[#5b3a17] rounded-full font-pixel text-[#5b3a17] font-bold hover:bg-[#ffb703] hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#5b3a17]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};