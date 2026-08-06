import { Avatar } from '@/types/game';
import { PIPOYA_AVATARS, PLAYER_AVAILABLE_AVATARS } from './pipoyaSprites';

export const DEFAULT_AVATARS: Avatar[] = [
  { id: 'sprout', name: 'Sprout', img: '/assets/animated_characters/sprout.png', photo: '/assets/characters/sprout.png', isAnimated: true, category: 'Default' },
  { id: 'pebble', name: 'Pebble', img: '/assets/animated_characters/pebble.png', photo: '/assets/characters/pebble.png', isAnimated: true, category: 'Default' },
  { id: 'fern', name: 'Fern', img: '/assets/animated_characters/fern.png', photo: '/assets/characters/fern.png', isAnimated: true, category: 'Default' },
  { id: 'ember', name: 'Ember', img: '/assets/animated_characters/ember.png', photo: '/assets/characters/ember.png', isAnimated: true, category: 'Default' },
];

export const AVATARS: Avatar[] = [...DEFAULT_AVATARS, ...PLAYER_AVAILABLE_AVATARS];

export const HUES = [0, 30, 55, 120, 170, 210, 275, 320];
export const TAGCOLORS = ['#fef3c7', '#ffd6e0', '#d0f4de', '#d7e9ff', '#eadcff', '#ffe5cc'];

