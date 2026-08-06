'use client';

import React from 'react';
import { Zone } from '@/types/game';
import { Bug, Mail, Clock, DoorOpen } from 'lucide-react';

interface ZoneNodeProps {
  zone: Zone;
  isActive: boolean;
  isBusy: boolean;
  isCooling: boolean;
  leftSec: number;
  onInteract: (zone: Zone) => void;
}

export const ZoneNode: React.FC<ZoneNodeProps> = ({
  zone,
  isActive,
  isBusy,
  isCooling,
  leftSec,
  onInteract,
}) => {
  return (
    <div
      onClick={() => onInteract(zone)}
      className={`zone ${zone.css === 'portal' ? 'portal-zone' : ''} ${isActive ? 'active' : ''} ${isBusy ? 'busy' : ''} ${
        isCooling ? 'cooling' : ''
      }`}
      style={{
        left: `${zone.x}px`,
        top: `${zone.y}px`,
        '--w': `${zone.w || 100}px`,
      } as React.CSSProperties}
    >
      {zone.img && <img src={zone.img} alt={zone.label} style={{ width: zone.w ? `${zone.w}px` : 'auto' }} />}



      {zone.css === 'help' && (
        <div className="cssprop kiosk">
          <div className="roof" />
          <div className="desk flex items-center justify-center">
            <Bug className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="legs">
            <i />
            <i />
          </div>
        </div>
      )}

      {zone.css === 'mail' && (
        <div className="cssprop mail">
          <div className="box flex items-center justify-center">
            <Mail className="w-4 h-4 text-rose-500" />
          </div>
          <div className="post" />
        </div>
      )}

      {zone.css === 'portal' && (
        <div className="cssprop portal-kiosk">
          <div className="portal-sprite" />
        </div>
      )}

      <div className={`sign ${zone.hideLabelUnlessNear ? 'near-only' : ''}`}>
        {zone.label}
      </div>

      <div className="prompt">
        <span className="key font-pixel">E</span>
        <span className="ptxt font-pixel">{zone.label}</span>
      </div>
    </div>
  );
};
