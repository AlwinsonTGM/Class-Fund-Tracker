export interface SongPreview {
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

export interface FreedomPost {
  id: number
  created_at?: string
  content: string
  author_name: string
  color: string
  song?: SongPreview | null
  song_data?: SongPreview | null
}

export interface UserType {
  id?: string
  email?: string
  name?: string
  role?: string
}

export interface ItunesResult {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
  previewUrl: string
}

export type ToolType = 'bomb' | 'magnet' | 'tornado' | null

export interface Position {
  x: number
  y: number
}

export interface Velocity {
  vx: number
  vy: number
}
