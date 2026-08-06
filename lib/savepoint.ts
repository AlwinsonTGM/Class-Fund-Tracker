export interface PlayerPos {
  x: number;
  y: number;
}

export interface SavePoint {
  map: 'world' | 'classroom';
  world: PlayerPos;
  classroom: PlayerPos;
}

const KEY = 'freedomBroSavepoint_v1';

export const WORLD_DEFAULT_POS: PlayerPos = { x: 1100, y: 880 };
export const CLASSROOM_DEFAULT_POS: PlayerPos = { x: 920, y: 890 };

// Spawn point just outside the schoolhouse door (world map)
export const WORLD_SCHOOL_DOOR_POS: PlayerPos = { x: 1100, y: 470 };

// Spawn point just inside the classroom door (classroom map)
export const CLASSROOM_DOOR_POS: PlayerPos = { x: 920, y: 870 };

const DEFAULTS: SavePoint = {
  map: 'world',
  world: { ...WORLD_DEFAULT_POS },
  classroom: { ...CLASSROOM_DEFAULT_POS },
};

let cache: SavePoint | null = null;

const read = (): SavePoint => {
  if (typeof window === 'undefined') {
    return { map: 'world', world: { ...WORLD_DEFAULT_POS }, classroom: { ...CLASSROOM_DEFAULT_POS } };
  }
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cache = {
        map: parsed.map === 'classroom' ? 'classroom' : 'world',
        world: {
          x: typeof parsed.world?.x === 'number' ? parsed.world.x : WORLD_DEFAULT_POS.x,
          y: typeof parsed.world?.y === 'number' ? parsed.world.y : WORLD_DEFAULT_POS.y,
        },
        classroom: {
          x: typeof parsed.classroom?.x === 'number' ? parsed.classroom.x : CLASSROOM_DEFAULT_POS.x,
          y: typeof parsed.classroom?.y === 'number' ? parsed.classroom.y : CLASSROOM_DEFAULT_POS.y,
        },
      };
      return cache;
    }
  } catch (e) {
    console.warn('Failed to load savepoint', e);
  }
  cache = { map: 'world', world: { ...WORLD_DEFAULT_POS }, classroom: { ...CLASSROOM_DEFAULT_POS } };
  return cache;
};

const write = (next: SavePoint) => {
  cache = next;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Failed to save savepoint', e);
  }
};

export const loadSavePoint = (): SavePoint => read();

export const saveWorldPos = (x: number, y: number) => {
  const s = read();
  write({ ...s, world: { x, y } });
};

export const saveClassroomPos = (x: number, y: number) => {
  const s = read();
  write({ ...s, classroom: { x, y } });
};

export const saveCurrentMap = (map: 'world' | 'classroom') => {
  const s = read();
  write({ ...s, map });
};

/** Called when leaving the classroom: place the player outside the school doors. */
export const placeAtSchoolDoor = () => {
  const s = read();
  write({ ...s, world: { ...WORLD_SCHOOL_DOOR_POS }, map: 'world' });
};

/** Called when entering the classroom: place the player just inside the door. */
export const placeInsideClassroomDoor = () => {
  const s = read();
  write({ ...s, classroom: { ...CLASSROOM_DOOR_POS }, map: 'classroom' });
};
