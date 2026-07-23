-- Table for storing Flappy Bird high scores
CREATE TABLE IF NOT EXISTS public.flappy_bird_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  mode TEXT DEFAULT 'classic', -- 'classic' or 'zen'
  is_guest BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flappy_bird_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leaderboard
DROP POLICY IF EXISTS "Allow public read access to flappy_bird_scores" ON public.flappy_bird_scores;
CREATE POLICY "Allow public read access to flappy_bird_scores"
  ON public.flappy_bird_scores
  FOR SELECT
  USING (true);

-- Allow public insert to flappy_bird_scores
DROP POLICY IF EXISTS "Allow public insert to flappy_bird_scores" ON public.flappy_bird_scores;
CREATE POLICY "Allow public insert to flappy_bird_scores"
  ON public.flappy_bird_scores
  FOR INSERT
  WITH CHECK (true);

-- Allow public update to flappy_bird_scores
DROP POLICY IF EXISTS "Allow public update to flappy_bird_scores" ON public.flappy_bird_scores;
CREATE POLICY "Allow public update to flappy_bird_scores"
  ON public.flappy_bird_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public delete to flappy_bird_scores (for clearing/resetting table)
DROP POLICY IF EXISTS "Allow public delete to flappy_bird_scores" ON public.flappy_bird_scores;
CREATE POLICY "Allow public delete to flappy_bird_scores"
  ON public.flappy_bird_scores
  FOR DELETE
  USING (true);

-- Enable Realtime for flappy_bird_scores table
ALTER PUBLICATION supabase_realtime ADD TABLE public.flappy_bird_scores;


