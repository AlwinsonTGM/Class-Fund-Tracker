'use client';

import React from 'react';
import { PATHS, DECO } from '@/config/zones';

export const Ground: React.FC = () => {
  return (
    <>
      {/* Ground Map Background */}
      <div
        id="ground"
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/backgrounds/world_map.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: '0 0',
        }}
      />
    </>
  );
};
