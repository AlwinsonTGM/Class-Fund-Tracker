import { UNIVERSE_CONFIGS, UniverseConfig, RarityTier } from './multiverse-config'

export interface FusionConfig {
  id: string
  key: string
  num: string
  uni1: UniverseConfig
  uni2: UniverseConfig
  name: string
  sub: string
  rarity: RarityTier
  description: string
}

export function getFusionKey(idA: string, idB: string): string {
  return [idA, idB].sort().join('+')
}

// Handcrafted signature descriptions for notable universe pairings
const HANDCRAFTED_FUSIONS: Record<string, { sub?: string; description: string }> = {
  'monday+rain': {
    sub: 'the ultimate damp corporate collapse',
    description: 'Rain drips through the acoustic ceiling tiles as your 9 AM meeting turns into an existential crisis.'
  },
  'flip+sneeze': {
    sub: 'gravity lost its handkerchief',
    description: 'You sneeze so hard that up becomes down, left becomes tears, and the floor files for administrative leave.'
  },
  'birthday+left_on_read': {
    sub: 'party for one, seen at 2:47 PM',
    description: 'The birthday candles burn down quietly while your read receipt mocks your entire existence.'
  },
  'therapy+void_mode': {
    sub: 'coping mechanisms in absolute darkness',
    description: 'Your therapist asks "how does the void make you feel?" but the void is also billing $200 an hour.'
  },
  'tax_season+unionizing': {
    sub: 'audited by collective bargaining',
    description: 'The IRS tried to tax the birds, so the birds formed a strike line around the top pipe.'
  },
  'drought+rain': {
    sub: 'weather paradox of emotional confusion',
    description: 'It is simultaneously pouring and bone-dry. Physics gave up and wept.'
  },
  'autumn+nostalgia': {
    sub: 'crunchy leaves and golden regret',
    description: 'Fallen leaves blow past memories of a time when passing three pipes felt like a major milestone.'
  },
  'comments+free_trial': {
    sub: 'paywall guarded by online toxicity',
    description: 'Your free trial expired after 3 pipes, and the comment section ratioed your credit card.'
  },
  'noir+silent_film': {
    sub: 'black and white silent tragedy',
    description: 'Title card reads: [HE FLAPPED]. Saxophone plays silently in the rain-drenched alleyway.'
  },
  'insomnia+sunday_night': {
    sub: '3:00 AM work anxiety simulator',
    description: 'The sun rises in 3 hours. You have dodged zero pipes and answered zero emails.'
  },
  'anime+musical': {
    sub: 'broadway sorrow with dramatic speed lines',
    description: 'The bird sings a high C while performing Secret Art: Sorrowful Flap in front of a cheering chorus.'
  },
  'dread_meter+low_battery': {
    sub: '5% battery remaining on your last nerve',
    description: 'The screen dims as dread rises. Neither your phone nor your spirits will survive the night.'
  },
  'deep_end+thunderstorm': {
    sub: 'underwater lightning of deep despair',
    description: 'Submerged in heavy water while lightning strikes the surface above. Nowhere is safe.'
  },
  'patch_notes+tutorial': {
    sub: 'nerfed during the instructions',
    description: 'The tutorial pop-up informs you that your happiness was patched out in v2.4.'
  },
  'rainbow+wedding': {
    sub: 'colorful matrimony of heartbreak',
    description: 'A vibrant rainbow arch covers the altar where the pipe left you for a smaller hitbox.'
  },
  'soup+sunday_night': {
    sub: 'lukewarm soup vs looming monday',
    description: 'The broth grows cold while tomorrow looms like an inescapable lower pipe.'
  },
  'spectator+player_left': {
    sub: 'ghost bird watching an empty room',
    description: 'Nobody is playing. Nobody is watching. Two ghosts hover in eternal standby.'
  },
  'deja_vu+echo': {
    sub: 'recursive ghost collision',
    description: 'You died here before, in this exact pattern, listening to your past self apologize.'
  },
  'snow+wind': {
    sub: 'blizzard of personal accountability',
    description: 'Heavy snowfall pushed sideways by winds that explicitly mock your flapping trajectory.'
  },
  'long_goodbye+trust': {
    sub: 'shrinking fake pipes',
    description: 'The pipe looks real, shrinks slowly, and disappears right as you attempt to process the betrayal.'
  }
}

// Procedural generator fallback for remaining pairings
function generateProceduralFusion(u1: UniverseConfig, u2: UniverseConfig): { sub: string; description: string } {
  const flavorCombos: Record<string, string> = {
    'classic+physics': 'Traditional sorrow meets erratic momentum.',
    'classic+weather': 'Atmospheric grief meets classic pipe navigation.',
    'classic+fourth_wall': 'Standard flappy existentialism breaking the canvas boundary.',
    'classic+cinema': 'Cinematic tragedy overlaid with classic rain dynamics.',
    'classic+online': 'Internet culture colliding with fundamental despair.',
    'classic+cursed': 'Dark anomalies warping a familiar rainy day.',
    'physics+weather': 'Natural elements amplifying gravitational turbulence.',
    'physics+fourth_wall': 'Game engine bugs breaking reality in real-time.',
    'physics+cinema': 'Dramatic slow-motion physics of inevitable failure.',
    'physics+online': 'Laggy momentum and uncalibrated expectations.',
    'physics+cursed': 'Uncanny gravitational distortion from forbidden realms.',
    'weather+fourth_wall': 'Meta-meteorology affecting your user interface.',
    'weather+cinema': 'A dramatic cinematic storm of high-production sadness.',
    'weather+online': 'Viral weather events posted without context.',
    'weather+cursed': 'Supernatural precipitation breaking all weather logic.',
    'fourth_wall+cinema': 'Behind-the-scenes documentary about an unscripted fall.',
    'fourth_wall+online': 'Live-streamed self-destruction with active chat reaction.',
    'fourth_wall+cursed': 'Corrupted metadata invading your screen space.',
    'cinema+online': 'Low-budget viral film about a bird with zero followers.',
    'cinema+cursed': 'Lost cursed media found on a dusty VHS tape.',
    'online+cursed': 'Deep-web curse manifest in Flappy form.'
  }

  const keyCombo = [u1.flavor, u2.flavor].sort().join('+')
  const baseFlavorDesc = flavorCombos[keyCombo] || 'An unexpected convergence of two distinct emotional states.'

  const sub = `fused anomaly: ${u1.name.toLowerCase()} & ${u2.name.toLowerCase()}`
  const description = `${baseFlavorDesc} Combining "${u1.sub}" with "${u2.sub}".`

  return { sub, description }
}

let cachedFusions: FusionConfig[] | null = null

export function getAllFusionConfigs(): FusionConfig[] {
  if (cachedFusions) return cachedFusions

  const fusions: FusionConfig[] = []
  let index = 1

  for (let i = 0; i < UNIVERSE_CONFIGS.length; i++) {
    for (let j = i + 1; j < UNIVERSE_CONFIGS.length; j++) {
      const u1 = UNIVERSE_CONFIGS[i]
      const u2 = UNIVERSE_CONFIGS[j]
      const key = getFusionKey(u1.id, u2.id)

      // Calculate combined rarity
      let rarity: RarityTier = 'common'
      if (u1.rarity === 'cursed' || u2.rarity === 'cursed') {
        rarity = 'cursed'
      } else if (u1.rarity === 'uncommon' || u2.rarity === 'uncommon') {
        rarity = 'uncommon'
      }

      const handcrafted = HANDCRAFTED_FUSIONS[key]
      const gen = handcrafted || generateProceduralFusion(u1, u2)

      const numStr = index.toString().padStart(3, '0')

      fusions.push({
        id: key,
        key,
        num: `FUS-${numStr}`,
        uni1: u1,
        uni2: u2,
        name: `${u1.name} × ${u2.name}`,
        sub: gen.sub || `fusion of #${u1.num} and #${u2.num}`,
        rarity,
        description: gen.description
      })

      index++
    }
  }

  cachedFusions = fusions
  return fusions
}

export function getFusionByPair(idA: string, idB: string): FusionConfig | undefined {
  const key = getFusionKey(idA, idB)
  return getAllFusionConfigs().find(f => f.key === key)
}
