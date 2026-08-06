export interface SpriteCrop {
  sheet: string; // e.g. '/assets/topdown/TX Plant.png'
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ShapeType = 'rect' | 'circle' | 'pill';

export interface CollisionRect {
  x: number; // relative to structure origin (top-left)
  y: number;
  w: number;
  h: number;
  shape?: ShapeType;
}

export type StructureCategory = 'plants' | 'props' | 'structures' | 'spawns' | 'custom';

export interface StructureTemplate {
  id: string;
  label: string;
  category: StructureCategory;
  w: number;
  h: number;
  shape?: ShapeType;
  crop?: SpriteCrop;
  color?: string; // fallback color for placeholder if crop missing
  defaultCollision?: CollisionRect;
}

export interface PlacedStructure {
  uid: string;
  templateId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: ShapeType;
  label?: string;
  crop?: SpriteCrop;
  customColor?: string;
  customSrc?: string;
  collision: CollisionRect | null;
  /** If set, this structure is bound 1:1 to a SAM2 layer and mirrors its rect. */
  linkedLayerId?: string;
}

export interface MapBackgroundConfig {
  id: string;
  name: string;
  url: string; // URL string or data URI from IndexedDB
  isCustomUpload: boolean;
  worldW: number;
  worldH: number;
  opacity: number;
}

// SAM2-generated cutout layer: transparent PNG extracted from the map background.
// Draw order is decided by `slot` (background < object < character) + `zOffset`.
export type SegLayerSlot = 'background' | 'object' | 'character';

export interface SegmentedLayer {
  id: string;
  name: string;
  url: string; // transparent cut-out PNG (data URI, persisted in IndexedDB)
  x: number; // world coords of the cut-out bounds
  y: number;
  w: number;
  h: number;
  slot: SegLayerSlot;
  zOffset: number;
  opacity: number;
  visible: boolean;
  /** Non-destructive crop: visible sub-rect, RELATIVE to the layer origin
   *  (world units). The original PNG is never rewritten, so re-entering crop
   *  mode (or resetting) can always bring the hidden part back. */
  crop?: { x: number; y: number; w: number; h: number };
  /** If set, a collision structure is bound to this layer and mirrors its rect. */
  linkedStructureId?: string;
}

export type EditorMode = 'edit' | 'test';

export interface MapExportPayload {
  mapId: string;
  exportedAt: string;
  background: {
    name: string;
    worldW: number;
    worldH: number;
    /** Public asset path when the background is a project file (not a data URL). */
    src?: string;
  };
  structures: Array<{
    uid: string;
    templateId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    shape?: ShapeType;
    label?: string;
    collision: CollisionRect | null;
  }>;
  obstacles: Array<{
    id: string;
    shape: 'rect' | 'circle';
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
  }>;
  /** AI cut-out layers. `src` references the saved project file when the
   *  cutout was persisted to disk (portable to a live site); data-URL-only
   *  layers omit it. */
  layers?: Array<{
    id: string;
    name: string;
    slot: SegLayerSlot;
    x: number;
    y: number;
    w: number;
    h: number;
    zOffset: number;
    opacity: number;
    visible: boolean;
    linkedStructureId?: string;
    crop?: { x: number; y: number; w: number; h: number };
    src?: string;
  }>;
}
