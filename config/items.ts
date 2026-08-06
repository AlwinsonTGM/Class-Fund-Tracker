import { Item } from '@/types/game';

export const ITEMS: Record<string, Item> = {
  wood: { id: 'wood', name: 'Wood', kind: 'resource', price: 2, img: '/assets/items/wood.png' },
  carp: { id: 'carp', name: 'Carp', kind: 'resource', price: 8, img: '/assets/items/carp.png' },
  stone: { id: 'stone', name: 'Stone', kind: 'resource', price: 5, img: '/assets/items/stone.png' },
  gnome: { id: 'gnome', name: 'Lawn Gnome', kind: 'cosmetic', price: 60, img: '/assets/items/gnome.png' },
  phat: { id: 'phat', name: 'Party Hat', kind: 'cosmetic', price: 40, img: '/assets/items/phat.png' },
  goldtag: { id: 'goldtag', name: 'Golden Nametag', kind: 'cosmetic', price: 80, emoji: '🏅' },
  scholar: { id: 'scholar', name: 'Scholar Hat', kind: 'cosmetic', price: 0, emoji: '🎓' },
};

export const SHOP = ['gnome', 'phat', 'goldtag'];
