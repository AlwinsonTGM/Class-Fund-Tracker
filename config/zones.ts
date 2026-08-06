import { Zone } from '@/types/game';

export const ZONES: Zone[] = [
  { id: 'school', x: 1100, y: 330, r: 120, w: 230, label: '🏫 Schoolhouse', modal: 'school' },
  { id: 'vendor', x: 470, y: 470, r: 108, w: 210, label: '🏪 General Store', modal: 'vendor' },
  { id: 'board', x: 1730, y: 470, r: 100, w: 165, label: '📋 Bulletin Board', modal: 'board' },
  { id: 'pond', x: 330, y: 1180, r: 108, w: 200, label: '🎣 Fishing Pond', gather: 'carp', tool: '🎣' },
  { id: 'tree', x: 1960, y: 760, r: 100, w: 205, label: '🪓 Old Oak', gather: 'wood', tool: '🪓' },
  { id: 'rock', x: 1860, y: 1230, r: 100, w: 175, label: '⛏️ Rock Outcrop', gather: 'stone', tool: '⛏️' },
  { id: 'help', x: 1100, y: 1290, r: 96, label: '🐛 Help Desk', modal: 'help', css: 'help' },
  { id: 'invite', x: 760, y: 830, r: 90, label: '💌 Invite Friends', modal: 'invite', css: 'mail' },
  { id: 'portal', x: 279, y: 731, r: 120, w: 160, label: '🌀 Portal', css: 'portal', hideLabelUnlessNear: true },
];

export const PATHS = [
  { x: 1100, y: 450, w: 84, h: 280, r: 0 },   // Schoolhouse (North)
  { x: 625, y: 520, w: 360, h: 84, r: 18 },   // General Store (North-West)
  { x: 1575, y: 520, w: 360, h: 84, r: -18 },  // Bulletin Board (North-East)
  { x: 1690, y: 760, w: 580, h: 84, r: 0 },   // Old Oak (East)
  { x: 1640, y: 1130, w: 530, h: 84, r: 24 },  // Rock Outcrop (South-East)
  { x: 1100, y: 1160, w: 84, h: 300, r: 0 },  // Help Desk (South)
  { x: 555, y: 1105, w: 520, h: 84, r: -18 },  // Fishing Pond (South-West)
];

export const DECO: Array<[number, number, string]> = [
  [120, 300, 'flower'], [260, 520, 'mush'], [180, 820, 'bush'], [120, 1320, 'flower2'], [420, 1380, 'tuft'],
  [600, 260, 'flower'], [560, 1380, 'bush'], [820, 1380, 'flower2'], [1380, 1380, 'mush'], [1620, 1380, 'flower'],
  [2080, 300, 'bush'], [2080, 520, 'flower2'], [2100, 1000, 'tuft'], [2080, 1380, 'flower'], [1700, 260, 'mush'],
  [1380, 200, 'flower'], [980, 200, 'bush'], [300, 680, 'tuft'], [2000, 1380, 'mush'], [640, 640, 'flower2'],
  [1560, 640, 'flower'], [1300, 1380, 'tuft'], [420, 260, 'bush'], [1900, 300, 'flower2'], [1180, 1380, 'flower'],
];
