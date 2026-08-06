'use client';

import React from 'react';
import { findEmoteByKey, findEmoteById, EmoteDef } from '@/config/emotes';

interface EmoteMarkerProps {
  idOrKey: string | number;
  className?: string;
  size?: number;
}

export const EmoteMarker: React.FC<EmoteMarkerProps> = ({ idOrKey, className = '', size = 32 }) => {
  const emote: EmoteDef | undefined =
    typeof idOrKey === 'number' ? findEmoteById(idOrKey) : findEmoteByKey(idOrKey);

  if (!emote) {
    return null;
  }

  return (
    <div
      className={`inline-block overflow-hidden image-pixelated align-middle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      title={emote.name}
    >
      {/* 3-frame sprite animation or single frame rendering */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url(${emote.imagePath})`,
          backgroundSize: `${size * 3}px ${size}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
