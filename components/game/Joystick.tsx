'use client';

import React, { useRef, useEffect } from 'react';
import { playSfx } from '@/lib/sfx';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const joyRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);

  const R = 46;

  useEffect(() => {
    const joyEl = joyRef.current;
    const knobEl = knobRef.current;
    if (!joyEl || !knobEl) return;

    const jmove = (cx: number, cy: number) => {
      const rect = joyEl.getBoundingClientRect();
      let dx = cx - (rect.left + rect.width / 2);
      let dy = cy - (rect.top + rect.height / 2);

      const len = Math.hypot(dx, dy) || 1;
      const c = Math.min(len, R);

      dx = (dx / len) * c;
      dy = (dy / len) * c;

      knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
      onMove(dx / R, dy / R);
    };

    const jreset = () => {
      knobEl.style.transform = 'translate(0, 0)';
      onMove(0, 0);
      pointerIdRef.current = null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerIdRef.current = e.pointerId;
      joyEl.setPointerCapture(e.pointerId);
      jmove(e.clientX, e.clientY);
      playSfx('pop');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        jmove(e.clientX, e.clientY);
      }
    };

    joyEl.addEventListener('pointerdown', handlePointerDown);
    joyEl.addEventListener('pointermove', handlePointerMove);
    joyEl.addEventListener('pointerup', jreset);
    joyEl.addEventListener('pointercancel', jreset);

    return () => {
      joyEl.removeEventListener('pointerdown', handlePointerDown);
      joyEl.removeEventListener('pointermove', handlePointerMove);
      joyEl.removeEventListener('pointerup', jreset);
      joyEl.removeEventListener('pointercancel', jreset);
    };
  }, [onMove]);

  return (
    <div
      ref={joyRef}
      id="joy"
      className="fixed left-4 bottom-4 w-28 h-28 rounded-full bg-black/40 border-3 border-white/60 touch-none z-40 backdrop-blur-xs md:hidden"
    >
      <div
        ref={knobRef}
        id="knob"
        className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#d8c9a8)] border-3 border-[#3a2a17] shadow-[0_3px_0_rgba(0,0,0,0.3)] pointer-events-none"
      />
    </div>
  );
};
