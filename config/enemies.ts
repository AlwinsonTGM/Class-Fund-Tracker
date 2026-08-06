import { Avatar } from '@/types/game';
import { BOSS_SPRITES, ENEMY_SPRITES } from './pipoyaSprites';

export interface EnemyConfig {
  id: string;
  name: string;
  spriteUrl: string;
  gridType: '3x4';
}

export interface BossConfig {
  id: string;
  name: string;
  spriteUrl: string;
  rowIndex: number; // 0..3 (4 rows of bosses in Boss 01.png)
  gridType: '1x3';
}

export const ENEMIES_LIST: EnemyConfig[] = ENEMY_SPRITES.map((enemy, index) => ({
  id: enemy.id,
  name: `Enemy ${index + 1}`,
  spriteUrl: enemy.img,
  gridType: '3x4',
}));

// Boss 01.png contains 4 boss sprites (1 per row, 3 horizontal frames each)
export const BOSSES_LIST: BossConfig[] = [
  { id: 'boss_01_fiend', name: 'Infernal Fiend', spriteUrl: '/assets/pipoya/boss/Boss 01.png', rowIndex: 0, gridType: '1x3' },
  { id: 'boss_02_golem', name: 'Stone Golem', spriteUrl: '/assets/pipoya/boss/Boss 01.png', rowIndex: 1, gridType: '1x3' },
  { id: 'boss_03_shadow', name: 'Shadow Knight', spriteUrl: '/assets/pipoya/boss/Boss 01.png', rowIndex: 2, gridType: '1x3' },
  { id: 'boss_04_dragon', name: 'Wyvern Lord', spriteUrl: '/assets/pipoya/boss/Boss 01.png', rowIndex: 3, gridType: '1x3' },
];
