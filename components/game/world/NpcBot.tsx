'use client';

import React, { forwardRef, useLayoutEffect } from 'react';
import { NPCData } from '@/types/game';
import { AVATARS } from '@/config/avatars';
import { PIPOYA_AVATARS } from '@/config/pipoyaSprites';
import { OBJECT_Z_OFFSET } from '@/lib/layerZ';

interface NpcBotProps {
  data: NPCData;
  initialX: number;
  initialY: number;
}

export interface NpcBotRef {
  el: HTMLDivElement | null;
  spr: HTMLImageElement | HTMLDivElement | null;
  bub: HTMLDivElement | null;
  tagGroup: HTMLDivElement | null;
}

export const NpcBot = forwardRef<NpcBotRef, NpcBotProps>(({ data, initialX, initialY }, ref) => {
  const elRef = React.useRef<HTMLDivElement>(null);
  const sprRef = React.useRef<any>(null);
  const bubRef = React.useRef<HTMLDivElement>(null);
  const tagGroupRef = React.useRef<HTMLDivElement>(null);

  const av = (data.avatarId ? PIPOYA_AVATARS.find(a => a.id === data.avatarId) : undefined) || AVATARS[data.av] || AVATARS[0];

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
    tagGroup: tagGroupRef.current,
  }));

  return (
    <div ref={elRef} className="ent">
      <div className="sh" />
      {av.isAnimated ? (
        <div
          ref={sprRef}
          className={`${av.isPipoya32 ? 'spr-pipoya-3x4' : 'spr-animated'} down`}
          style={{
            backgroundImage: `url('${av.img}')`,
            filter: `hue-rotate(${data.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))`,
          }}
        />
      ) : (
        <img
          ref={sprRef}
          src={av.img}
          alt={data.name}
          className="spr"
          style={{ filter: `hue-rotate(${data.hue}deg) drop-shadow(0 3px 1px rgba(25,15,5,0.28))` }}
        />
      )}
      <div ref={tagGroupRef} className="npc-tag-group">
        {data.npc && <div className="npc font-pixel">NPC</div>}
        <div
          className="tag font-pixel font-bold"
          style={{ backgroundColor: data.tag }}
        >
          {data.pre}
          {data.name}
        </div>
      </div>
      <div ref={bubRef} className="bub font-nunito" />
    </div>
  );
});

NpcBot.displayName = 'NpcBot';
