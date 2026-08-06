import { Avatar } from '@/types/game';
import { PIPOYA_AVATARS, PLAYER_AVAILABLE_AVATARS } from './pipoyaSprites';

export const DEFAULT_AVATARS: Avatar[] = [
  { id: 'sprout', name: 'Sprout', img: '/assets/animated_characters/sprout.png', photo: '/assets/characters/sprout.png', isAnimated: true, category: 'Default' },
  { id: 'pebble', name: 'Pebble', img: '/assets/animated_characters/pebble.png', photo: '/assets/characters/pebble.png', isAnimated: true, category: 'Default' },
  { id: 'fern', name: 'Fern', img: '/assets/animated_characters/fern.png', photo: '/assets/characters/fern.png', isAnimated: true, category: 'Default' },
  { id: 'ember', name: 'Ember', img: '/assets/animated_characters/ember.png', photo: '/assets/characters/ember.png', isAnimated: true, category: 'Default' },
];

export const AVATARS: Avatar[] = [...DEFAULT_AVATARS, ...PLAYER_AVAILABLE_AVATARS];

// ─── Global Avatar Catalog Cache ───────────────────────────────────────────
// The static AVATARS array only has ~25 entries from the hardcoded catalog.
// The full pipoya_catalog.json has 418+ sprites. This cache is populated once
// by `preloadAvatarCatalog()` so that `getAvatarById()` can resolve ANY avatar
// from the full catalog synchronously (for PlayerEntity, HUD, RemotePlayer).

const _catalogCache = new Map<string, Avatar>();
let _catalogLoaded = false;

// Seed cache with static avatars immediately
for (const av of AVATARS) {
  _catalogCache.set(av.id, av);
}

/**
 * Preload the full pipoya catalog JSON into the avatar cache.
 * Call this once early in the app lifecycle (e.g. in GameStateProvider or plaza page).
 * Safe to call multiple times — only fetches once.
 */
export async function preloadAvatarCatalog(): Promise<void> {
  if (_catalogLoaded) return;
  _catalogLoaded = true; // prevent duplicate fetches

  try {
    const res = await fetch('/assets/pipoya/pipoya_catalog.json');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        const id = `pipoya_${item.id}`;
        if (!_catalogCache.has(id)) {
          _catalogCache.set(id, {
            id,
            name: item.name,
            img: item.url,
            photo: item.url,
            isAnimated: true,
            category: item.category,
            accessRole: item.accessRole,
            gridType: item.gridType,
            isPipoya32: true,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to preload avatar catalog:', err);
    _catalogLoaded = false; // allow retry on failure
  }
}

/**
 * Resolve an avatar by ID. Checks the global cache (static + full catalog).
 * Returns a valid Avatar object even for unknown IDs (graceful fallback).
 */
export function getAvatarById(avatarId?: string): Avatar {
  if (!avatarId) return AVATARS[0];

  // Check the global cache (includes static AVATARS + full catalog when loaded)
  const cached = _catalogCache.get(avatarId);
  if (cached) return cached;

  // Fallback: still return AVATARS[0] for truly unknown IDs
  return AVATARS[0];
}

export const HUES = [0, 30, 55, 120, 170, 210, 275, 320];
export const TAGCOLORS = ['#fef3c7', '#ffd6e0', '#d0f4de', '#d7e9ff', '#eadcff', '#ffe5cc'];
