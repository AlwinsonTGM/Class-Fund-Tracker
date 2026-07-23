-- ============================================================
--   ADD SONG DATA TO FREEDOM_POSTS TABLE
--   Run this script in your Supabase SQL Editor.
-- ============================================================

-- Add song_data column to store song information as JSON
ALTER TABLE public.freedom_posts 
ADD COLUMN IF NOT EXISTS song_data JSONB;

-- No need to update RLS policies since freedom_posts already allows public insert/select
-- The song_data will be stored as JSON with structure:
-- { "title": "...", "artist": "...", "artworkUrl": "...", "previewUrl": "..." }
