/*
 * custom-assets.ts
 * Utility for loading custom bird images per universe.
 * Images should be placed under the public folder at:
 *   /multiverse/custom_designs/<category>/<universeId>/bird.png
 *
 * Category corresponds to the universe flavor grouping:
 *   classic, physics-that-hurt, weather, fourth-wall, cinema, online, cursed
 *
 * The loader creates Image objects and caches them. If an image fails to load (404),
 * the corresponding getter returns undefined, causing the renderer to fall back
 * to the default vector graphics.
 */

import { UNIVERSE_CONFIGS } from './multiverse-config'

// null = loaded & not found (404), undefined = not yet attempted
const birdImages: (HTMLImageElement | null | undefined)[] = []

// Tracks which universe indices have been attempted (to avoid re-requests)
const loadAttempted: boolean[] = []

/**
 * Resolve the category folder name from a universe config flavor.
 */
function getCategoryFromFlavor(flavor: string): string {
  switch (flavor) {
    case 'classic':      return 'classic'
    case 'physics':      return 'physics'
    case 'weather':      return 'weather'
    case 'fourth_wall':  return 'fourth_wall'
    case 'cinema':       return 'cinema'
    case 'online':       return 'online'
    case 'cursed':       return 'cursed'
    default:             return 'misc'
  }
}

// Store the most recent universe index so getters can resolve without params
let currentUniIndex: number = 0

/**
 * Load custom assets for a given universe index.
 * Idempotent — only attempts once per universe index.
 */
export function loadCustomAssetsForUniverse(universeIndex: number): void {
  currentUniIndex = universeIndex

  // Already attempted this universe — skip
  if (loadAttempted[universeIndex]) return
  loadAttempted[universeIndex] = true

  const uni = UNIVERSE_CONFIGS[universeIndex]
  if (!uni) return

  const category = getCategoryFromFlavor(uni.flavor)
  const basePath = `/multiverse/custom_designs/${category}/${uni.id}`

  const loadImg = (src: string): HTMLImageElement => {
    const img = new Image()
    img.src = src
    // onerror: keep undefined so the renderer falls back to vector
    return img
  }

  birdImages[universeIndex] = loadImg(`${basePath}/bird.png`)
}

/**
 * Get the loaded bird image for the current universe.
 * Returns undefined if no image was loaded (renderer uses vector fallback).
 */
export function getCustomBirdImg(): HTMLImageElement | undefined {
  const img = birdImages[currentUniIndex]
  // Only return if fully loaded and had no error
  if (img && img.complete && img.naturalWidth > 0) return img
  return undefined
}
