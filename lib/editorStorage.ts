import type { SegmentedLayer } from '@/types/editor';
import type { Obstacle } from '@/types/game';
import { DEFAULT_PLAZA_LAYERS } from '@/config/defaultLayers';

const DB_NAME = 'CozyPlazaEditorDB';
const DB_VERSION = 2;
const STORE_BG = 'backgrounds';
const STORE_LAYERS = 'layers';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_BG)) {
        db.createObjectStore(STORE_BG);
      }
      if (!db.objectStoreNames.contains(STORE_LAYERS)) {
        db.createObjectStore(STORE_LAYERS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut<T>(store: string, key: string, value: T): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      })
  );
}

function idbGet<T>(store: string, key: string): Promise<T | null> {
  return openDB().then(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      })
  );
}

function idbDelete(store: string, key: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      })
  );
}

export async function storeBackgroundImage(mapId: string, imageDataUrl: string): Promise<void> {
  try {
    await idbPut(STORE_BG, mapId, imageDataUrl);
  } catch (err) {
    console.error('Failed to save background image in IndexedDB:', err);
  }
}

export async function getBackgroundImage(mapId: string): Promise<string | null> {
  try {
    return await idbGet<string>(STORE_BG, mapId);
  } catch (err) {
    console.error('Failed to load background image from IndexedDB:', err);
    return null;
  }
}

// ---- Segmented layer images (large data URIs live here, not in localStorage) ----

export async function storeLayerImage(mapId: string, layerId: string, dataUrl: string): Promise<void> {
  try {
    await idbPut(STORE_LAYERS, `${mapId}/${layerId}`, dataUrl);
  } catch (err) {
    console.error('Failed to save segmented layer image in IndexedDB:', err);
  }
}

export async function getLayerImage(mapId: string, layerId: string): Promise<string | null> {
  try {
    return await idbGet<string>(STORE_LAYERS, `${mapId}/${layerId}`);
  } catch (err) {
    console.error('Failed to load segmented layer image from IndexedDB:', err);
    return null;
  }
}

export async function deleteLayerImage(mapId: string, layerId: string): Promise<void> {
  try {
    await idbDelete(STORE_LAYERS, `${mapId}/${layerId}`);
  } catch (err) {
    console.error('Failed to delete segmented layer image from IndexedDB:', err);
  }
}

/**
 * Restore all segmented cutout layers for a map. The draft (localStorage) holds the layer
 * metadata with an empty `url` (or static asset path); actual PNG data URIs come from IndexedDB.
 * Falls back to DEFAULT_PLAZA_LAYERS when no custom user draft exists.
 */
export async function loadMapLayers(mapId: string): Promise<SegmentedLayer[]> {
  const draft = loadEditorDraft(mapId);
  const meta: Array<Partial<SegmentedLayer> & { id: string }> | undefined = draft?.layers;
  const defaultLayers = mapId === 'plaza' ? DEFAULT_PLAZA_LAYERS : [];

  if (!Array.isArray(meta) || meta.length === 0) {
    return defaultLayers;
  }

  const restored: SegmentedLayer[] = [];
  for (const item of meta) {
    const idbUrl = await getLayerImage(mapId, item.id);
    const url = idbUrl || item.url;
    if (!url) continue;
    restored.push({
      id: item.id,
      name: item.name || 'Layer',
      url,
      x: item.x ?? 0,
      y: item.y ?? 0,
      w: item.w ?? 0,
      h: item.h ?? 0,
      slot: item.slot || 'object',
      zOffset: item.zOffset ?? 0,
      opacity: item.opacity ?? 1,
      visible: item.visible !== false,
      crop: item.crop,
    });
  }

  return restored.length > 0 ? restored : defaultLayers;
}

export function saveEditorDraft(mapId: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `cozyPlazaMapDraft_${mapId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save draft to localStorage:', err);
  }
}

export function loadEditorDraft(mapId: string): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `cozyPlazaMapDraft_${mapId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load draft from localStorage:', err);
    return null;
  }
}

/**
 * Build the gameplay obstacle list straight from the editor's placed
 * structures (absolute collision boxes), so gameplay changes authored in the
 * map editor appear in the live game without any AI/JSON hand-off. Returns
 * null when no editor draft exists (callers fall back to their static config).
 */
export function loadMapObstacles(mapId: string): Obstacle[] | null {
  const draft = loadEditorDraft(mapId);
  const structs = draft?.structures;
  if (!Array.isArray(structs)) return null;

  const list: Obstacle[] = [];
  structs.forEach((s: { uid?: string; x?: number; y?: number; shape?: string; collision?: { x?: number; y?: number; w?: number; h?: number; shape?: string } | null }, idx: number) => {
    const c = s?.collision;
    if (!c || c.w === undefined || c.h === undefined) return;
    const id = s.uid ? `obs_${s.uid}` : `obs_${idx}`;
    if ((c.shape || s.shape) === 'circle') {
      const radius = Math.round(Math.min(c.w, c.h) / 2);
      list.push({
        id,
        shape: 'circle',
        x: Math.round((s.x ?? 0) + (c.x ?? 0)),
        y: Math.round((s.y ?? 0) + (c.y ?? 0)),
        radius,
        width: c.w,
        height: c.h,
      });
    } else {
      list.push({
        id,
        shape: 'rect',
        x: Math.round((s.x ?? 0) + (c.x ?? 0)),
        y: Math.round((s.y ?? 0) + (c.y ?? 0)),
        width: c.w,
        height: c.h,
      });
    }
  });
  return list;
}