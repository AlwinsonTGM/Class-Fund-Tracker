import { createClient } from '@/lib/supabase-server'
import { FlappyBirdGame } from '@/components/flappy-bird/flappy-bird-game'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Flappy Bird Arcade • BSIS 201 Section Hub',
  description: 'Play Flappy Bird arcade mini-game and compete on the BSIS 201 class leaderboard!'
}

export default async function FlappyBirdPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <FlappyBirdGame user={user} />
}
