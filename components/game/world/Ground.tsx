'use client';

import React, { useState, useEffect } from 'react';
import { getBackgroundImage } from '@/lib/editorStorage';

interface GroundProps {
  mapId?: string;
}

export const Ground: React.FC<GroundProps> = ({ mapId = 'plaza' }) => {
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    getBackgroundImage(mapId).then((url) => {
      if (url) setBgUrl(url);
    });
  }, [mapId]);

  const defaultBg = mapId === 'classroom' ? '/assets/backgrounds/classroom.png' : '/assets/backgrounds/world_map.png';

  return (
    <>
      {/* Ground Map Background */}
      <div
        id="ground"
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${bgUrl || defaultBg})`,
          backgroundSize: '100% 100%',
          backgroundPosition: '0 0',
        }}
      />
    </>
  );
};
