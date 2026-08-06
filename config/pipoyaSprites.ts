import { Avatar } from '@/types/game';

export interface PipoyaCatalogItem {
  id: string;
  name: string;
  fileName: string;
  url: string;
  category: string;
  accessRole: 'all' | 'officer' | 'teacher' | 'dev_event' | 'locked_event' | 'npc_only' | 'enemy' | 'boss';
  gridType: '3x4' | '1x3';
}

// Complete Pipoya Avatar Catalog for Player & NPC Entities
export const ALL_PIPOYA_CATALOG: PipoyaCatalogItem[] = [
  // --- NPC Special Sprites (Mayor, Gossip Gnome, Plaza Cat, Plaza Pup, Teachers) ---
  { id: 'headmaster_male_png', name: 'Headmaster Male', fileName: 'Headmaster male.png', url: '/assets/pipoya/teacher/Headmaster male.png', category: 'Teacher', accessRole: 'npc_only', gridType: '3x4' },
  { id: 'headmaster_fmale_png', name: 'Headmaster Female', fileName: 'Headmaster fmale.png', url: '/assets/pipoya/teacher/Headmaster fmale.png', category: 'Teacher', accessRole: 'npc_only', gridType: '3x4' },
  { id: 'pien_png', name: 'Gossip Gnome', fileName: 'pien.png', url: '/assets/pipoya/npc_other/pien.png', category: 'Other', accessRole: 'npc_only', gridType: '3x4' },
  { id: 'cat_01-1_png', name: 'Plaza Cat', fileName: 'Cat 01-1.png', url: '/assets/pipoya/npc_animals/Cat 01-1.png', category: 'Animal', accessRole: 'npc_only', gridType: '3x4' },
  { id: 'dog_01-1_png', name: 'Plaza Pup', fileName: 'Dog 01-1.png', url: '/assets/pipoya/npc_animals/Dog 01-1.png', category: 'Animal', accessRole: 'npc_only', gridType: '3x4' },

  // --- Male Characters ---
  { id: 'male_01-1_png', name: 'Male 01-1', fileName: 'Male 01-1.png', url: '/assets/pipoya/male/Male 01-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_01-2_png', name: 'Male 01-2', fileName: 'Male 01-2.png', url: '/assets/pipoya/male/Male 01-2.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_02-1_png', name: 'Male 02-1', fileName: 'Male 02-1.png', url: '/assets/pipoya/male/Male 02-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_03-1_png', name: 'Male 03-1', fileName: 'Male 03-1.png', url: '/assets/pipoya/male/Male 03-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_04-1_png', name: 'Male 04-1', fileName: 'Male 04-1.png', url: '/assets/pipoya/male/Male 04-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_05-1_png', name: 'Male 05-1', fileName: 'Male 05-1.png', url: '/assets/pipoya/male/Male 05-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_06-1_png', name: 'Male 06-1', fileName: 'Male 06-1.png', url: '/assets/pipoya/male/Male 06-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_07-1_png', name: 'Male 07-1', fileName: 'Male 07-1.png', url: '/assets/pipoya/male/Male 07-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },
  { id: 'male_08-1_png', name: 'Male 08-1', fileName: 'Male 08-1.png', url: '/assets/pipoya/male/Male 08-1.png', category: 'Male', accessRole: 'all', gridType: '3x4' },

  // --- Female Characters ---
  { id: 'female_01-1_png', name: 'Female 01-1', fileName: 'Female 01-1.png', url: '/assets/pipoya/female/Female 01-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_01-2_png', name: 'Female 01-2', fileName: 'Female 01-2.png', url: '/assets/pipoya/female/Female 01-2.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_02-1_png', name: 'Female 02-1', fileName: 'Female 02-1.png', url: '/assets/pipoya/female/Female 02-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_03-1_png', name: 'Female 03-1', fileName: 'Female 03-1.png', url: '/assets/pipoya/female/Female 03-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_04-1_png', name: 'Female 04-1', fileName: 'Female 04-1.png', url: '/assets/pipoya/female/Female 04-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_05-1_png', name: 'Female 05-1', fileName: 'Female 05-1.png', url: '/assets/pipoya/female/Female 05-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },
  { id: 'female_06-1_png', name: 'Female 06-1', fileName: 'Female 06-1.png', url: '/assets/pipoya/female/Female 06-1.png', category: 'Female', accessRole: 'all', gridType: '3x4' },

  // --- School Uniforms ---
  { id: 'school_01-1_png', name: 'School 01', fileName: 'School Uniform 01-1.png', url: '/assets/pipoya/school/School Uniform 01-1.png', category: 'School Uniform', accessRole: 'all', gridType: '3x4' },
  { id: 'school_02-1_png', name: 'School 02', fileName: 'School Uniform 02-1.png', url: '/assets/pipoya/school/School Uniform 02-1.png', category: 'School Uniform', accessRole: 'all', gridType: '3x4' },
  { id: 'school_03-1_png', name: 'School 03', fileName: 'School Uniform 03-1.png', url: '/assets/pipoya/school/School Uniform 03-1.png', category: 'School Uniform', accessRole: 'all', gridType: '3x4' },

  // --- Officers ---
  { id: 'officer_01-1_png', name: 'Officer 01', fileName: 'Officer 01-1.png', url: '/assets/pipoya/officer/Officer 01-1.png', category: 'Officer', accessRole: 'officer', gridType: '3x4' },
  { id: 'officer_02-1_png', name: 'Officer 02', fileName: 'Officer 02-1.png', url: '/assets/pipoya/officer/Officer 02-1.png', category: 'Officer', accessRole: 'officer', gridType: '3x4' },
];

export const PIPOYA_AVATARS: Avatar[] = ALL_PIPOYA_CATALOG.map((item) => ({
  id: `pipoya_${item.id}`,
  name: item.name,
  img: item.url,
  photo: item.url,
  isAnimated: true,
  category: item.category,
  accessRole: item.accessRole,
  gridType: item.gridType,
  isPipoya32: true,
}));

export const PLAYER_AVAILABLE_AVATARS = PIPOYA_AVATARS.filter(
  (av) => av.accessRole !== 'npc_only' && av.accessRole !== 'enemy' && av.accessRole !== 'boss'
);

export const NPC_AVAILABLE_AVATARS = PIPOYA_AVATARS.filter(
  (av) => av.accessRole === 'npc_only' || av.accessRole === 'all'
);

export const ENEMY_SPRITES = PIPOYA_AVATARS.filter((av) => av.accessRole === 'enemy');
export const BOSS_SPRITES = PIPOYA_AVATARS.filter((av) => av.accessRole === 'boss');

export function filterAvatarsByRole(
  avatars: Avatar[],
  userRole?: 'student' | 'officer' | 'teacher' | 'dev'
): { avatar: Avatar; isLocked: boolean; lockReason?: string }[] {
  return avatars.map((av) => {
    let isLocked = false;
    let lockReason: string | undefined = undefined;

    if (av.accessRole === 'officer' && userRole !== 'officer' && userRole !== 'dev') {
      isLocked = true;
      lockReason = 'Requires Officer Role';
    } else if (av.accessRole === 'teacher' && userRole !== 'teacher' && userRole !== 'dev') {
      isLocked = true;
      lockReason = 'Requires Teacher Role';
    } else if (av.accessRole === 'dev_event' && userRole !== 'dev') {
      isLocked = true;
      lockReason = 'Dev / Special Event Only';
    } else if (av.accessRole === 'locked_event') {
      isLocked = true;
      lockReason = 'Event Reward (Locked)';
    }

    return { avatar: av, isLocked, lockReason };
  });
}
