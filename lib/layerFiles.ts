// Client helpers for persisting cut-out PNGs as real files via the local API.
// URLs produced here are stable public paths (/maps/<mapId>/layers/<name>.png)
// which the exported map JSON can reference directly.

export interface LayerFileRef {
  path: string; // public URL path
  name: string; // file base name (without extension)
}

/** True when the layer url is a project asset path rather than a data URL. */
export function isLayerFileUrl(url: string): boolean {
  return url.startsWith('/maps/');
}

async function request<T>(method: 'POST' | 'PUT' | 'DELETE', body: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/layers', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Layer API ${method} failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

/** Save a PNG data URL as a file; overwritePath reuses an existing file. */
export function saveLayerFile(
  mapId: string,
  name: string,
  dataUrl: string,
  opts?: { overwritePath?: string }
): Promise<LayerFileRef> {
  return request<LayerFileRef>('POST', {
    mapId,
    name,
    url: dataUrl,
    overwritePath: opts?.overwritePath,
  });
}

/** Rename a saved layer file (keeps the same map directory). */
export function renameLayerFile(mapId: string, layerPath: string, newName: string): Promise<LayerFileRef> {
  return request<LayerFileRef>('PUT', { mapId, path: layerPath, newName });
}

/** Delete a saved layer file. */
export function deleteLayerFile(layerPath: string): Promise<{ ok: boolean }> {
  const m = /^\/maps\/([^/]+)\/layers\/([^/]+\.png)$/.exec(layerPath);
  if (!m) throw new Error('Invalid layer file path');
  return request<{ ok: boolean }>('DELETE', { mapId: m[1], path: layerPath });
}
