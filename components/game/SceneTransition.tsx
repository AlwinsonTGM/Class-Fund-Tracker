'use client';

import React, { useEffect, useRef, useState } from 'react';
import { playSfx } from '@/lib/sfx';
import { ArrowRight, School } from 'lucide-react';

interface SceneTransitionProps {
  active: boolean;
  title?: string;
}

type Stage = 'preview' | 'closing' | 'closed' | 'opening' | 'hidden';

// How long the panels sit fully open before sliding shut (lets CSS transition fire).
const PREVIEW_MS = 60;
const SLIDE_MS = 400;

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  active,
  title = 'Transitioning...',
}) => {
  const [stage, setStage] = useState<Stage>('hidden');
  const stageRef = useRef<Stage>('hidden');

  const go = (s: Stage) => {
    stageRef.current = s;
    setStage(s);
  };

  useEffect(() => {
    if (active) {
      playSfx('door');
      // Mount panels OPEN (invisible, off-screen) so the close can be seen slide in.
      go('preview');
      const closeTimer = setTimeout(() => go('closing'), PREVIEW_MS);
      const lockTimer = setTimeout(() => go('closed'), PREVIEW_MS + SLIDE_MS);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(lockTimer);
      };
    } else {
      const cur = stageRef.current;
      if (cur === 'closing' || cur === 'closed' || cur === 'preview') {
        playSfx('door');
        go('opening');
        const timer = setTimeout(() => go('hidden'), SLIDE_MS);
        return () => clearTimeout(timer);
      }
    }
  }, [active]);

  if (stage === 'hidden') return null;

  // 'preview' mounts open -> 'closing' slides shut -> 'closed' holds shut.
  const engaged = stage === 'closing' || stage === 'closed';

  return <SchoolEntrance shut={engaged} title={title} />;
};

/* ------------------------------------------------------------------ */
/* SCHOOL ENTRANCE & EXIT: door.png split sliding double door         */
/* ------------------------------------------------------------------ */
const SchoolEntrance: React.FC<{ shut: boolean; title: string }> = ({ shut, title }) => {
  const doorsShut = shut;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none pointer-events-auto flex items-center justify-center">
      {/* Dark Ambient Backdrop */}
      <div
        className={`absolute inset-0 bg-black/75 transition-opacity duration-300 z-0 ${
          doorsShut ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Left Door Half (Width 50vw, containing left half of door.png) */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2 overflow-hidden z-10 transition-transform duration-500 ease-in-out"
        style={{
          transform: doorsShut ? 'translateX(0%)' : 'translateX(-100%)',
          boxShadow: doorsShut ? '15px 0 35px rgba(0,0,0,0.85)' : 'none',
        }}
      >
        <img
          src="/assets/door.png"
          alt="Left Door"
          className="absolute top-0 left-0 w-[100vw] h-full object-cover max-w-none pointer-events-none"
        />
        {/* Inner edge shadow overlay for depth */}
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Right Door Half (Width 50vw, containing right half of door.png) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2 overflow-hidden z-10 transition-transform duration-500 ease-in-out"
        style={{
          transform: doorsShut ? 'translateX(0%)' : 'translateX(100%)',
          boxShadow: doorsShut ? '-15px 0 35px rgba(0,0,0,0.85)' : 'none',
        }}
      >
        <img
          src="/assets/door.png"
          alt="Right Door"
          className="absolute top-0 right-0 w-[100vw] h-full object-cover max-w-none pointer-events-none"
        />
        {/* Inner edge shadow overlay for depth */}
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Center Seam Glow when doors shut */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 z-20 transition-opacity duration-300 ${
          doorsShut ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
        } bg-[#ffb703] shadow-[0_0_20px_#ffb703,0_0_40px_#ffb703]`}
      />

      {/* Center Modal / Transition Information Overlay Card */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center px-8 py-6 rounded-2xl bg-[#f7ecc8] border-4 border-[#5b3a17] shadow-[inset_0_0_0_3px_#fff6d8,0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 ${
          doorsShut ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        {/* Medallion */}
        <div className="relative mb-3">
          <div className="w-18 h-18 rounded-xl bg-[#fff8e1] border-3 border-[#5b3a17] flex items-center justify-center relative z-10 shadow-[0_4px_0_rgba(58,36,16,0.2)]">
            <School className="w-9 h-9 text-[#5b3a17] drop-shadow-sm animate-pulse" />
          </div>

          {/* Animated Outer Rotating Ring */}
          <div
            className="absolute -inset-2 rounded-xl border-2 border-dashed border-[#5b3a17]/40 animate-spin pointer-events-none"
            style={{ animationDuration: '8s' }}
          />
        </div>

        {/* Title */}
        <h2 className="font-pixel text-xl md:text-2xl tracking-wider text-center text-[#5b3a17] font-bold drop-shadow-sm">
          {title}
        </h2>

        {/* Dynamic Subtext */}
        <p className="mt-1 text-xs text-[#8a6a3a] font-pixel font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span>Schoolhouse</span>
          <ArrowRight className="w-3.5 h-3.5 inline animate-pulse text-[#d97706]" />
        </p>

        {/* Retro Cozy Pixel Progress Bar */}
        <div className="mt-4 w-52 h-3.5 bg-[#fff8e1] border-3 border-[#5b3a17] rounded-xl p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-lg animate-pulse transition-all duration-500 bg-gradient-to-r from-[#ffb703] via-[#f59e0b] to-[#7fb069]"
            style={{ width: doorsShut ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};