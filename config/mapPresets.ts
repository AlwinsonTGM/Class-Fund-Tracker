import type { MapBackgroundConfig, PlacedStructure } from '@/types/editor';
import { OBSTACLES } from '@/config/obstacles';
import { CLASSROOM_OBSTACLES } from '@/config/classroomObstacles';

export const MAP_PRESETS: Record<string, { background: MapBackgroundConfig; structures: PlacedStructure[] }> = {
  plaza: {
    background: {
      id: 'plaza',
      name: 'Cozy Plaza',
      url: '/assets/backgrounds/world_map.png',
      isCustomUpload: false,
      worldW: 2200,
      worldH: 1500,
      opacity: 1,
    },
    structures: OBSTACLES.map((obs, idx) => {
      const isCircle = obs.shape === 'circle';
      const radius = 'radius' in obs ? obs.radius : undefined;
      const w = obs.width || (radius ? radius * 2 : 64);
      const h = obs.height || (radius ? radius * 2 : 64);

      let color = '#3b82f6';
      if (obs.id.includes('tree') || obs.id.includes('bush')) color = '#22c55e';
      else if (obs.id.includes('rock')) color = '#64748b';
      else if (obs.id.includes('fountain') || obs.id.includes('pond')) color = '#0284c7';
      else if (obs.id.includes('school') || obs.id.includes('store')) color = '#d97706';
      else if (obs.id.includes('portal')) color = '#8b5cf6';

      return {
        uid: `preset_plaza_${idx}_${obs.id}`,
        templateId: obs.id,
        x: obs.x,
        y: obs.y,
        w,
        h,
        shape: isCircle ? 'circle' : 'rect',
        label: `${obs.id.charAt(0).toUpperCase() + obs.id.slice(1)}`,
        customColor: color,
        collision: {
          x: 0,
          y: 0,
          w,
          h,
          shape: isCircle ? 'circle' : 'rect',
        },
      };
    }),
  },
  classroom: {
    background: {
      id: 'classroom',
      name: 'Classroom',
      url: '/assets/backgrounds/classroom.png',
      isCustomUpload: false,
      worldW: 1840,
      worldH: 1036,
      opacity: 1,
    },
    structures: CLASSROOM_OBSTACLES.map((obs, idx) => {
      const isCircle = obs.shape === 'circle';
      const radius = 'radius' in obs ? obs.radius : undefined;
      const w = obs.width || (radius ? radius * 2 : 64);
      const h = obs.height || (radius ? radius * 2 : 64);

      let color = '#0284c7';
      if (obs.id.includes('desk') || obs.id.includes('table')) color = '#b45309';
      else if (obs.id.includes('chair')) color = '#d97706';
      else if (obs.id.includes('wall')) color = '#ef4444';
      else if (obs.id.includes('plant')) color = '#10b981';
      else if (obs.id.includes('lamp') || obs.id.includes('globe')) color = '#f59e0b';
      else if (obs.id.includes('book_shelf')) color = '#854d0e';
      else if (obs.id.includes('cleaning')) color = '#ec4899';

      return {
        uid: `preset_classroom_${idx}_${obs.id}`,
        templateId: obs.id,
        x: obs.x,
        y: obs.y,
        w,
        h,
        shape: isCircle ? 'circle' : 'rect',
        label: `${obs.id.replace(/_/g, ' ').toUpperCase()}`,
        customColor: color,
        collision: {
          x: 0,
          y: 0,
          w,
          h,
          shape: isCircle ? 'circle' : 'rect',
        },
      };
    }),
  },
  custom: {
    background: {
      id: 'custom',
      name: 'Custom Sandbox',
      url: '',
      isCustomUpload: false,
      worldW: 2200,
      worldH: 1500,
      opacity: 1,
    },
    structures: [],
  },
};
