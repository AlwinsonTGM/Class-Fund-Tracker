export interface Item {
  id: string;
  name: string;
  kind: 'resource' | 'cosmetic';
  price: number;
  img?: string;
  emoji?: string;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  r: number;
  w?: number;
  label: string;
  img?: string;
  modal?: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'reviewer';
  gather?: 'carp' | 'wood' | 'stone';
  tool?: string;
  css?: string;
  action?: string;
  hideLabelUnlessNear?: boolean;
}

export interface RectObstacle {
  id: string;
  shape: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleObstacle {
  id: string;
  shape: 'circle';
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
}

export type Obstacle = RectObstacle | CircleObstacle;

export interface CutsceneScene {
  bg: string;
  sp: string;
  pos: 'left' | 'right' | 'center';
  fx?: 'bounce' | 'shake' | '';
  text: string;
}

export interface QuizQuestion {
  q: string;
  c: string[];
  a: number;
  e: string;
}

export interface Module {
  id: string;
  title: string;
  subject: string;
  diff: number;
  reward: number;
  icon: string;
  monster: string;
  mname: string;
  perfectItem?: string;
  scenes: CutsceneScene[];
  questions: QuizQuestion[];
}

export interface Avatar {
  id: string;
  name: string;
  img: string;
  photo: string;
  isAnimated?: boolean;
  category?: string;
  accessRole?: 'all' | 'officer' | 'teacher' | 'dev_event' | 'locked_event' | 'npc_only' | 'enemy' | 'boss';
  gridType?: '3x4' | '1x3';
  isPipoya32?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  pre: string;
  av: number;
  hue: number;
  tag: string;
  home: { x: number; y: number };
  r: number;
  spd: number;
  npc: boolean;
  lines: string[];
  bub: string[];
  mem: string[];
  board?: string[];
  avatarId?: string;
  mapId?: 'plaza' | 'classroom';
}

export interface PlayerProfile {
  nickname: string;
  avatar: string;
  hue: number;
  role?: 'student' | 'officer' | 'teacher' | 'dev';
}

export interface PlayerEquipped {
  hat: string | null;
  goldtag: boolean;
}

export interface GameState {
  profile: PlayerProfile | null;
  coins: number;
  inv: Record<string, number>;
  owned: Record<string, boolean>;
  equipped: PlayerEquipped;
  tagColor: string;
  progress: Record<string, { done?: boolean; perfect?: boolean; seen?: boolean; best?: number; attempts?: number }>;
  subs: Array<{ id: string; kind: string; title: string; body: string; status: string; ts: number }>;
  invites: { count: number; joined: string[]; code: string };
  bubbles: Array<{ author: string; color: string; pre?: string; text: string; ts: number }>;
  flags: { fished: boolean; sold: boolean; quiz: boolean; rookie: boolean };
}
