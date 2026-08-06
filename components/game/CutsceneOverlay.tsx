'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Module } from '@/types/game';
import { playSfx } from '@/lib/sfx';
import { Film, ChevronDown } from 'lucide-react';

interface CutsceneOverlayProps {
  module: Module | null;
  onComplete: () => void;
}

export const CutsceneOverlay: React.FC<CutsceneOverlayProps> = ({ module, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!module) return;
    setIdx(0);
  }, [module]);

  const currentScene = module?.scenes[idx];

  const handleAdvance = useCallback(() => {
    if (!module || !currentScene) return;

    if (isTyping) {
      setTypedText(currentScene.text);
      setIsTyping(false);
      return;
    }

    playSfx('click');

    if (idx < module.scenes.length - 1) {
      setIdx((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [isTyping, currentScene, idx, module, onComplete]);

  // Spacebar advance listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  // Typewriter effect
  useEffect(() => {
    if (!module || !currentScene) return;

    setIsTyping(true);
    setTypedText('');

    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      setTypedText(currentScene.text.slice(0, charIdx));
      if (charIdx >= currentScene.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [module, idx, currentScene]);

  if (!module || !currentScene) return null;

  return (
    <div
      onClick={handleAdvance}
      className="fixed inset-0 z-50 select-none cursor-pointer bg-black/60"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 pixelated"
        style={{ backgroundImage: `url(${currentScene.bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />

      {/* Sprite */}
      <img
        src="/assets/npcs/owl.png"
        alt={currentScene.sp}
        className={`absolute bottom-40 w-52 h-auto pixelated transition-all duration-300 ${
          currentScene.pos === 'left'
            ? 'left-[6%]'
            : currentScene.pos === 'right'
            ? 'right-[6%]'
            : 'left-1/2 -translate-x-1/2'
        } ${currentScene.fx === 'bounce' ? 'animate-bounce' : ''}`}
      />

      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between px-5 font-pixel text-base text-white drop-shadow">
        <span className="flex items-center gap-1.5">
          <Film className="w-4 h-4 text-white" />
          <span>{module.title}</span>
        </span>
        <span>
          {idx + 1} / {module.scenes.length}
        </span>
      </div>

      {/* Dialog Box */}
      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-full max-w-[720px] px-4">
        <div className="cozy-panel relative p-5 bg-[#f7ecc8]">
          <div className="absolute -top-4 left-4 bg-[#5b3a17] text-[#fff8e1] font-pixel text-sm px-3 py-0.5 rounded-lg border-2 border-[#3a2410]">
            {currentScene.sp}
          </div>
          <p className="min-h-[64px] font-nunito font-bold text-lg text-[#3a2a17] leading-relaxed pt-1">
            {typedText}
            {isTyping && <span className="font-pixel text-[#ffb703]">▌</span>}
          </p>
          <div className="text-right text-xs font-bold text-[#9a7a4a] animate-pulse mt-2 flex items-center justify-end gap-1">
            <ChevronDown className="w-3.5 h-3.5" />
            <span>click / space to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
