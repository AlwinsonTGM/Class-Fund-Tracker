import { Avatar } from '@/types/game';
import { PIPOYA_AVATARS, PLAYER_AVAILABLE_AVATARS } from './pipoyaSprites';

export const DEFAULT_AVATARS: Avatar[] = [
  { id: 'sprout', name: 'Sprout', img: '/assets/animated_characters/sprout.png', photo: '/assets/characters/sprout.png', isAnimated: true, category: 'Default' },
  { id: 'pebble', name: 'Pebble', img: '/assets/animated_characters/pebble.png', photo: '/assets/characters/pebble.png', isAnimated: true, category: 'Default' },
  { id: 'fern', name: 'Fern', img: '/assets/animated_characters/fern.png', photo: '/assets/characters/fern.png', isAnimated: true, category: 'Default' },
  { id: 'ember', name: 'Ember', img: '/assets/animated_characters/ember.png', photo: '/assets/characters/ember.png', isAnimated: true, category: 'Default' },
];

export const AVATARS: Avatar[] = [...DEFAULT_AVATARS, ...PLAYER_AVAILABLE_AVATARS];

export function getAvatarById(avatarId?: string): Avatar {
  if (!avatarId) return AVATARS[0];
  const found = AVATARS.find((a) => a.id === avatarId);
  if (found) return found;

  // Fallback dynamic resolution for pipoya avatars from extended catalog
  if (avatarId.startsWith('pipoya_')) {
    const rawId = avatarId.replace('pipoya_', '');
    const foundInPipoya = PIPOYA_AVATARS.find((a) => a.id === avatarId);
    if (foundInPipoya) return foundInPipoya;

    return {
      id: avatarId,
      name: rawId.replace(/_/g, ' '),
      img: `/assets/pipoya/male/Male 01-1.png`,
      photo: `/assets/pipoya/male/Male 01-1.png`,
      isAnimated: true,
      isPipoya32: true,
      category: 'Male',
    };
  }

  return AVATARS[0];
}

export const HUES = [0, 30, 55, 120, 170, 210, 275, 320];
export const TAGCOLORS = ['#fef3c7', '#ffd6e0', '#d0f4de', '#d7e9ff', '#eadcff', '#ffe5cc'];


