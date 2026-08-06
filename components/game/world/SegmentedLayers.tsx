'use client';

import React from 'react';
import type { SegmentedLayer } from '@/types/editor';
import { layerZIndex } from '@/lib/layerZ';

interface SegmentedLayersProps {
  layers: SegmentedLayer[];
  worldW: number;
  worldH: number;
  /** Editor-only: layers become clickable/draggable so they can be selected. */
  interactive?: boolean;
  onLayerPointerDown?: (e: React.PointerEvent<HTMLImageElement>, layer: SegmentedLayer) => void;
}

/**
 * Renders SAM2-cutout layers as absolutely-positioned transparent PNGs.
 * Used by both the map editor and the live game world so layered maps
 * look identical everywhere. Draw order follows the layer slot system.
 */
export const SegmentedLayers: React.FC<SegmentedLayersProps> = ({
  layers,
  worldW,
  worldH,
  interactive = false,
  onLayerPointerDown,
}) => {
  const visible = layers.filter((l) => l.visible && l.url && l.w > 0 && l.h > 0);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((l) => {
        // Non-destructive crop: clamp the stored (relative) rect into the layer
        // bounds, then render the full photo inside a clipping box. The hidden
        // part stays in the PNG, so a wrong crop can always be re-adjusted.
        const hasCrop = !!l.crop && l.crop.w > 0 && l.crop.h > 0;
        const cx = hasCrop ? Math.max(0, Math.min(l.w, l.crop!.x)) : 0;
        const cy = hasCrop ? Math.max(0, Math.min(l.h, l.crop!.y)) : 0;
        const cw = hasCrop ? Math.max(1, Math.min(l.w - cx, l.crop!.w)) : l.w;
        const ch = hasCrop ? Math.max(1, Math.min(l.h - cy, l.crop!.h)) : l.h;
        const isFull =
          cx <= 0.5 && cy <= 0.5 && cw >= l.w - 0.5 && ch >= l.h - 0.5;

        const imgProps = {
          src: l.url,
          'aria-hidden': true as const,
          draggable: false,
          onPointerDown:
            interactive && onLayerPointerDown
              ? (e: React.PointerEvent<HTMLImageElement>) => onLayerPointerDown(e, l)
              : undefined,
        };

        if (isFull) {
          return (
            <img
              key={l.id}
              {...imgProps}
              alt={l.name}
              className={`absolute select-none ${interactive ? 'cursor-grab map-layer-interactive' : 'pointer-events-none'}`}
              style={{
                left: l.x,
                top: l.y,
                width: l.w,
                height: l.h,
                maxWidth: worldW,
                maxHeight: worldH,
                zIndex: layerZIndex(l),
                opacity: l.opacity,
              }}
            />
          );
        }

        return (
          <div
            key={l.id}
            className="absolute overflow-hidden select-none"
            style={{
              left: l.x + cx,
              top: l.y + cy,
              width: cw,
              height: ch,
              zIndex: layerZIndex(l),
            }}
          >
            <img
              {...imgProps}
              alt={l.name}
              className={`absolute ${interactive ? 'cursor-grab map-layer-interactive' : 'pointer-events-none'}`}
              style={{
                left: -cx,
                top: -cy,
                width: l.w,
                height: l.h,
                maxWidth: 'none',
                maxHeight: 'none',
                opacity: l.opacity,
              }}
            />
          </div>
        );
      })}
    </>
  );
};
