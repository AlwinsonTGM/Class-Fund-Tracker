'use client';

import React, { forwardRef, useLayoutEffect } from 'react';
import { PlayerProfile, PlayerEquipped } from '@/types/game';
import { AVATARS } from '@/config/avatars';
import { OBJECT_Z_OFFSET } from '@/lib/layerZ';
import { GraduationCap, Crown, Star } from 'lucide-react';

interface PlayerEntityProps {
  profile: PlayerProfile;
  equipped: PlayerEquipped;
  tagColor: string;
  owned: Record<string, boolean>;
  progress: Record<string, { perfect?: boolean }>;
  initialX: number;
  initialY: number;
}

export interface PlayerEntityRef {
  el: HTMLDivElement | null;
  spr: HTMLImageElement | HTMLDivElement | null;
  bub: HTMLDivElement | null;
  emoteBub: HTMLDivElement | null;
  tag: HTMLDivElement | null;
  hat: HTMLDivElement | null;
}

export const PlayerEntity = forwardRef<PlayerEntityRef, PlayerEntityProps>(
  ({ profile, equipped, tagColor, owned, progress, initialX, initialY }, ref) => {
    const elRef = React.useRef<HTMLDivElement>(null);
    const sprRef = React.useRef<any>(null);
    const bubRef = React.useRef<HTMLDivElement>(null);
    const emoteBubRef = React.useRef<HTMLDivElement>(null);
    const tagRef = React.useRef<HTMLDivElement>(null);
    const hatRef = React.useRef<HTMLDivElement>(null);

    const currentAv = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];

    // Initialize initial DOM position ONCE on mount so React VDOM re-renders do NOT reset transform
    useLayoutEffect(() => {
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${initialX}px, ${initialY}px, 0)`;
        elRef.current.style.zIndex = `${OBJECT_Z_OFFSET + Math.round(initialY)}`;
      }
    }, [initialX, initialY]);

    React.useImperativeHandle(ref, () => ({
      el: elRef.current,
      spr: sprRef.current,
      bub: bubRef.current,
      emoteBub: emoteBubRef.current,
      tag: tagRef.current,
      hat: hatRef.current,
    }));

    return (
      <div ref={elRef} className="ent">
        <div className="sh" />
        {currentAv.isAnimated ? (
          <div
            ref={sprRef}
            className={`${currentAv.isPipoya32 ? 'spr-pipoya-3x4' : 'spr-animated'} down`}
            style={{
            backgroundImage: `url('${currentAv.img}')`,
              filter: profile.hue ? `hue-rotate(${profile.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))` : 'drop-shadow(0 3px 1px rgba(25,15,5,0.28))',
            }}
          />
        ) : (
          <img
            ref={sprRef}
            src={currentAv.img}
            alt={profile.nickname}
            className="spr"
            style={{
              filter: `hue-rotate(${profile.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))`,
            }}
          />
        )}

        <div
          ref={hatRef}
          className={`hat ${equipped.hat === 'scholar' ? 'emoji flex items-center justify-center' : ''}`}
          style={{
            backgroundImage: equipped.hat === 'phat' ? 'url(/assets/items/phat.png)' : undefined,
          }}
        >
          {equipped.hat === 'scholar' ? <GraduationCap className="w-5 h-5 text-[#5b3a17]" /> : null}
        </div>

        <div
          ref={tagRef}
          className={`tag player-tag font-pixel font-bold flex items-center gap-1 ${equipped.goldtag ? 'gold' : ''}`}
          style={{
            backgroundColor: equipped.goldtag ? undefined : tagColor,
          }}
        >
          {owned.founder && <Crown className="w-3 h-3 text-amber-500 fill-amber-400 inline shrink-0" />}
          {progress.double?.perfect && <Star className="w-3 h-3 text-amber-500 fill-amber-400 inline shrink-0" />}
          <span>{profile.nickname}</span>
        </div>

        <div ref={bubRef} className="bub font-nunito" />
        <div ref={emoteBubRef} className="emote-bub" />
      </div>
    );
  }
);

PlayerEntity.displayName = 'PlayerEntity';
