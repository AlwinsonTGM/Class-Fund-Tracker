import type { Metadata } from 'next'
import { MultiverseGameStandalone } from '@/components/multiverse-of-sadness/multiverse-game-standalone'

export const metadata: Metadata = {
  title: 'Multiverse of Sadness II — Standalone Flappy Concept',
  description: 'A flappy bird mod, but it rains in every universe.',
}

export default function MultiverseOfSadnessPage() {
  return <MultiverseGameStandalone />
}
