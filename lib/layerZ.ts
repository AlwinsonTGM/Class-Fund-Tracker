import type { SegLayerSlot, SegmentedLayer } from '@/types/editor';

// Draw bands. Anything below band 1000 is beneath placed structures /
// y-sorted entities in the world, so these bases keep the fixed
// background < object < character layering sensible in both the editor
// and the live game. `zOffset` lets you nudge a layer across bands.
export const SLOT_BASE: Record<SegLayerSlot, number> = {
  background: 0,
  object: 2000,
  character: 4000,
};

export const OBJECT_Z_OFFSET = SLOT_BASE.object;

// Test-mode player sits between the object and character bands so the
// character walks in front of cut-out objects but below "character" slots.
export const EDITOR_PLAYER_Z = 2500;

// Placed shapes (and their labels) must never be hidden by the AI cut-out
// photos, so all structures render above every segmented band.
export const STRUCTURES_TOP_Z = 90000;

export function layerZIndex(layer: SegmentedLayer): number {
  const bottom =
    layer.crop && layer.crop.h > 0
      ? layer.y + layer.crop.y + layer.crop.h
      : layer.y + layer.h;
  return SLOT_BASE[layer.slot] + layer.zOffset + bottom;
}