'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { OBSTACLES } from '@/config/obstacles';
import { Obstacle } from '@/types/game';

interface DevRulerProps {
  posRef: React.RefObject<{ x: number; y: number; [key: string]: any }>;
  obstacles?: Obstacle[];
}

export const DevRuler: React.FC<DevRulerProps> = ({ posRef, obstacles = OBSTACLES }) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'rect' | 'circle'>('rect');
  const [width, setWidth] = useState(160);
  const [height, setHeight] = useState(140);
  const [radius, setRadius] = useState(80);
  const [colliderId, setColliderId] = useState('');
  const [topLeft, setTopLeft] = useState({ x: 0, y: 0 });
  const [copiedToast, setCopiedToast] = useState(false);

  const shapeRef = useRef<HTMLDivElement>(null);

  // Keep ref of values for event listeners and animation frame loop
  const stateRef = useRef({
    isActive,
    mode,
    width,
    height,
    radius,
    colliderId,
  });

  useEffect(() => {
    stateRef.current = {
      isActive,
      mode,
      width,
      height,
      radius,
      colliderId,
    };
  }, [isActive, mode, width, height, radius, colliderId]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F9 toggles tool ON/OFF anytime
      if (e.key === 'F9') {
        e.preventDefault();
        setIsActive((prev) => !prev);
        return;
      }

      if (!stateRef.current.isActive) return;

      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      // ESC turns tool off
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsActive(false);
        return;
      }

      // ENTER copies JSON snippet to clipboard
      if (e.key === 'Enter') {
        e.preventDefault();
        copyJsonSnippet();
        return;
      }

      // If user is typing in text input, don't handle C/Q/E/R/F shape controls
      if (isInputFocused) return;

      const key = e.key.toLowerCase();

      // C toggles mode
      if (key === 'c') {
        e.preventDefault();
        setMode((prev) => (prev === 'rect' ? 'circle' : 'rect'));
        return;
      }

      // Resizing keys (4px increments)
      if (stateRef.current.mode === 'rect') {
        if (key === 'q') {
          e.preventDefault();
          setWidth((prev) => Math.max(4, prev - 4));
        } else if (key === 'e') {
          e.preventDefault();
          setWidth((prev) => prev + 4);
        } else if (key === 'r') {
          e.preventDefault();
          setHeight((prev) => prev + 4);
        } else if (key === 'f') {
          e.preventDefault();
          setHeight((prev) => Math.max(4, prev - 4));
        }
      } else {
        // Circle mode
        if (key === 'q') {
          e.preventDefault();
          setRadius((prev) => Math.max(4, prev - 4));
        } else if (key === 'e') {
          e.preventDefault();
          setRadius((prev) => prev + 4);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyJsonSnippet = () => {
    const pos = posRef.current || { x: 0, y: 0 };
    const { mode, width, height, radius, colliderId } = stateRef.current;

    let jsonObj: Record<string, any> = {};

    if (mode === 'rect') {
      const x = Math.round(pos.x - width / 2);
      const y = Math.round(pos.y - height / 2);
      jsonObj = {
        id: colliderId,
        shape: 'rect',
        x,
        y,
        width,
        height,
      };
    } else {
      const x = Math.round(pos.x - radius);
      const y = Math.round(pos.y - radius);
      jsonObj = {
        id: colliderId,
        shape: 'circle',
        x,
        y,
        radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    const snippet = JSON.stringify(jsonObj);

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet).catch((err) => {
        console.error('Failed to copy JSON: ', err);
      });
    } else {
      // Fallback for non-secure context
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    console.log('[Dev Ruler JSON]', snippet);

    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // 60fps loop to update shape position in world & HUD live coordinates
  useEffect(() => {
    if (!isActive) return;

    let animId: number;

    const tick = () => {
      const pos = posRef.current || { x: 0, y: 0 };
      const currentMode = stateRef.current.mode;
      const currentW = stateRef.current.width;
      const currentH = stateRef.current.height;
      const currentR = stateRef.current.radius;

      const halfW = currentMode === 'rect' ? currentW / 2 : currentR;
      const halfH = currentMode === 'rect' ? currentH / 2 : currentR;

      const tX = Math.round(pos.x - halfW);
      const tY = Math.round(pos.y - halfH);

      setTopLeft((prev) => (prev.x === tX && prev.y === tY ? prev : { x: tX, y: tY }));

      if (shapeRef.current) {
        shapeRef.current.style.transform = `translate3d(${pos.x - halfW}px, ${pos.y - halfH}px, 0)`;
        shapeRef.current.style.width = `${currentMode === 'rect' ? currentW : currentR * 2}px`;
        shapeRef.current.style.height = `${currentMode === 'rect' ? currentH : currentR * 2}px`;
        shapeRef.current.style.borderRadius = currentMode === 'circle' ? '50%' : '0px';
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  if (!isActive) return null;

  const currentBoundingW = mode === 'rect' ? width : radius * 2;
  const currentBoundingH = mode === 'rect' ? height : radius * 2;

  const hudPanel = (
    <div className="fixed top-16 left-3 z-50 flex flex-col gap-1.5 bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-xl p-3 shadow-[inset_0_0_0_3px_#fff6d8,0_4px_0_rgba(58,36,16,0.3)] font-pixel text-[#5b3a17] min-w-70 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#5b3a17]/20 pb-1">
        <span className="font-bold text-sm flex items-center gap-1">
          📏 DEV RULER
        </span>
        <span className="text-[10px] bg-[#5b3a17] text-[#fff8e1] px-1.5 py-0.5 rounded font-bold">
          F9 to Toggle
        </span>
      </div>

      {/* Readout Rows */}
      <div className="text-xs flex flex-col gap-1 mt-0.5">
        <div className="flex justify-between items-center">
          <span>MODE:</span>
          <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
            {mode.toUpperCase()} (C)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>TOP-LEFT (X, Y):</span>
          <span className="font-bold text-[#3a2410] bg-[#fff8e1] px-1.5 py-0.5 rounded border border-[#5b3a17]/30">
            {topLeft.x}, {topLeft.y}
          </span>
        </div>

        {mode === 'rect' ? (
          <div className="flex justify-between items-center">
            <span>RECT SIZE:</span>
            <span className="font-bold text-[#3a2410] bg-[#fff8e1] px-1.5 py-0.5 rounded border border-[#5b3a17]/30">
              W: {width}px | H: {height}px
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span>CIRCLE SIZE:</span>
            <span className="font-bold text-[#3a2410] bg-[#fff8e1] px-1.5 py-0.5 rounded border border-[#5b3a17]/30">
              R: {radius}px (W/H: {radius * 2}px)
            </span>
          </div>
        )}
      </div>

      {/* Collider ID input */}
      <div className="flex items-center gap-2 mt-1">
        <label className="text-xs font-bold whitespace-nowrap">ID:</label>
        <input
          type="text"
          value={colliderId}
          onChange={(e) => setColliderId(e.target.value)}
          placeholder="e.g. schoolhouse"
          className="w-full bg-[#fff8e1] border-2 border-[#5b3a17] rounded px-2 py-0.5 text-xs text-[#5b3a17] font-bold focus:outline-none focus:ring-2 focus:ring-[#8a5a2b]"
        />
      </div>

      {/* Key Hints Line */}
      <div className="text-[10px] text-[#5b3a17]/80 border-t border-[#5b3a17]/20 pt-1 mt-1 font-semibold leading-tight">
        <div>[C] Mode | [Q/E] {mode === 'rect' ? 'Width' : 'Radius'} -/+</div>
        <div>{mode === 'rect' ? '[R/F] Height -/+ | ' : ''}[Enter] Copy | [Esc] Off</div>
      </div>

      {/* Toast confirmation message */}
      {copiedToast && (
        <div className="text-xs font-bold text-green-800 bg-green-200 border border-green-500 rounded px-2 py-1 text-center animate-bounce mt-1">
          ✓ Copied JSON to clipboard!
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Preset Map Hitboxes (rendered in green when DevRuler is ON) */}
      {obstacles.map((obs, idx) => (
        <div
          key={`${obs.id}-${idx}`}
          style={{
            position: 'absolute',
            left: `${obs.x}px`,
            top: `${obs.y}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            border: '2px dashed #22c55e',
            borderRadius: obs.shape === 'circle' ? '50%' : '0px',
            pointerEvents: 'none',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15803d',
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            textShadow: '0 0 3px #fff, 0 0 1px #fff',
          }}
        >
          {obs.id}
        </div>
      ))}

      {/* 2. Semi-transparent red active measurement shape centered on player inside #world */}
      <div
        ref={shapeRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${currentBoundingW}px`,
          height: `${currentBoundingH}px`,
          backgroundColor: 'rgba(239, 68, 68, 0.35)',
          border: '2px dashed #ef4444',
          borderRadius: mode === 'circle' ? '50%' : '0px',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
          willChange: 'transform',
        }}
      >
        {/* Center dot anchor */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '6px',
            height: '6px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* 3. Overlay HUD Panel portaled to document.body */}
      {typeof document !== 'undefined' && createPortal(hudPanel, document.body)}
    </>
  );
};
