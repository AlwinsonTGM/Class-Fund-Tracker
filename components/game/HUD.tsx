'use client';

import React, { useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { AVATARS } from '@/config/avatars';
import { setMuted, getMuted, playSfx } from '@/lib/sfx';
import Link from 'next/link';
import { Coins, ShoppingBag, Volume2, VolumeX, RotateCcw, MessageSquare, Crown, Star, Maximize2, Minimize2, Radio, ArrowLeft } from 'lucide-react';

import { QuickEmoteBar } from '@/components/game/QuickEmoteBar';

interface HUDProps {
  onToggleInv: () => void;
  onToggleChat: () => void;
  unreadChatCount: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenCharacterCustomizer?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onToggleInv, onToggleChat, unreadChatCount, isFullscreen = false, onToggleFullscreen, onOpenCharacterCustomizer }) => {
  const { gameState, resetSave } = useGameState();
  const { profile, coins, tagColor, equipped, owned, progress } = gameState;
  const [isMutedState, setIsMutedState] = useState(getMuted());

  if (!profile) return null;

  const currentAv = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];

  const handleToggleMute = () => {
    const next = !isMutedState;
    setMuted(next);
    setIsMutedState(next);
    if (!next) playSfx('click');
  };

  return (
    <>
      {/* Top Left: Player Card & Coins & Live Badge */}
      <div className="fixed top-3 left-3 z-40 flex items-center gap-2 select-none flex-wrap">
        {/* Player Card (Clickable to customize character!) */}
        <div
          onClick={() => {
            if (onOpenCharacterCustomizer) {
              playSfx('click');
              onOpenCharacterCustomizer();
            }
          }}
          title="Click to customize character & avatar"
          className="flex items-center gap-2 bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-xl p-1.5 pr-3 shadow-[inset_0_0_0_3px_#fff6d8,0_4px_0_rgba(58,36,16,0.3)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#fff8e1] border-3 border-[#5b3a17] rounded-lg grid place-items-center overflow-hidden flex-shrink-0 relative">
            {currentAv.isPipoya32 ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url('${currentAv.photo}')`,
                  backgroundSize: '300% 400%',
                  backgroundPosition: '50% 0%',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  filter: `hue-rotate(${profile.hue}deg)`
                }}
              />
            ) : (
              <img
                src={currentAv.photo}
                alt="avatar"
                className="w-8 h-10 object-contain"
                style={{ filter: `hue-rotate(${profile.hue}deg)` }}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-pixel text-sm font-bold text-[#5b3a17] truncate max-w-[120px] flex items-center gap-1">
              {owned.founder && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 inline shrink-0" />}
              {progress.double?.perfect && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 inline shrink-0" />}
              <span className="truncate">{profile.nickname}</span>
            </div>
            <div
              className="h-2 rounded border border-black/20 mt-0.5"
              style={{
                background: equipped.goldtag
                  ? 'linear-gradient(180deg, #ffe08a, #ffb703)'
                  : tagColor,
              }}
            />
          </div>
        </div>

        {/* Live Indicator Badge (Moved out of center screen!) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#f7ecc8] border-3 border-[#5b3a17] rounded-xl px-2.5 py-2 shadow-[0_4px_0_rgba(58,36,16,0.2)]">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
          <span className="font-pixel font-bold text-xs text-[#5b3a17]">PLAZA LIVE</span>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2 select-none">
        <Link
          href="/"
          className="hud-btn font-pixel bg-[#fff8e1] border-3 border-[#5b3a17] text-[#5b3a17] text-xs font-bold px-3 h-10 rounded-xl flex items-center gap-1.5 hover:bg-[#fff0c4] active:translate-y-0.5 shadow-[0_4px_0_rgba(58,36,16,0.2)]"
          title="Back to Class Fund Tracker"
        >
          <ArrowLeft className="w-4 h-4 text-[#5b3a17]" />
          <span className="hidden sm:inline">Exit Plaza</span>
        </Link>
        {onToggleFullscreen && (
          <button
            onClick={() => {
              playSfx('click');
              onToggleFullscreen();
            }}
            className="hud-btn font-pixel bg-[#fff8e1] border-3 border-[#5b3a17] text-lg w-10 h-10 rounded-xl grid place-items-center hover:bg-[#fff0c4] active:translate-y-0.5 shadow-[0_4px_0_rgba(58,36,16,0.2)]"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-[#5b3a17]" /> : <Maximize2 className="w-5 h-5 text-[#5b3a17]" />}
          </button>
        )}
        <button
          onClick={handleToggleMute}
          className="hud-btn font-pixel bg-[#fff8e1] border-3 border-[#5b3a17] text-lg w-10 h-10 rounded-xl grid place-items-center hover:bg-[#fff0c4] active:translate-y-0.5 shadow-[0_4px_0_rgba(58,36,16,0.2)]"
          title="Toggle Mute"
        >
          {isMutedState ? <VolumeX className="w-5 h-5 text-[#5b3a17]" /> : <Volume2 className="w-5 h-5 text-[#5b3a17]" />}
        </button>
      </div>

      {/* Bottom Right Floating Action Bar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-end gap-2 select-none">
        <QuickEmoteBar />
        <button
          onClick={() => {
            playSfx('click');
            onToggleChat();
          }}
          className="hud-btn relative font-pixel bg-[#fff8e1] border-3 border-[#5b3a17] text-[#5b3a17] font-bold px-3.5 py-2 rounded-xl hover:bg-[#fff0c4] active:translate-y-0.5 shadow-[0_4px_0_rgba(58,36,16,0.2)] flex items-center gap-2 text-sm cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#5b3a17]" />
          <span>Plaza Chat</span>
          {unreadChatCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#e63946] text-white text-xs w-5 h-5 rounded-full grid place-items-center border-2 border-white animate-bounce font-bold">
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
