'use client';

/**
 * Client-side sprite processor utility.
 * The assets in public/assets/ are already pre-processed 32-bit RGBA PNG files with transparent backgrounds.
 * keyOutWhite returns the image URL directly so browser renders clean transparent PNGs instantly.
 */

const cache: Record<string, string> = {};

export async function keyOutWhite(url: string): Promise<string> {
  if (!url) return url;
  return url;
}

export function preloadAllSprites() {
  if (typeof window === 'undefined') return;
  const urls = [
    '/assets/characters/sprout.png',
    '/assets/characters/pebble.png',
    '/assets/characters/fern.png',
    '/assets/characters/ember.png',
    '/assets/items/carp.png',
    '/assets/items/gnome.png',
    '/assets/items/phat.png',
    '/assets/items/stone.png',
    '/assets/items/wood.png',
    '/assets/tiles/board.png',
    '/assets/tiles/pond.png',
    '/assets/tiles/rock.png',
    '/assets/tiles/school.png',
    '/assets/tiles/stall.png',
    '/assets/tiles/tree.png',
  ];
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}
