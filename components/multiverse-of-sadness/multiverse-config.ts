export interface LyricLine {
  time: number // Time in seconds when this subtitle line displays
  text: string
}

export interface TrackConfig {
  id: string
  title: string
  artist?: string
  audioSrc?: string
  lyrics: LyricLine[]
}

export type UniverseFlavor = 'classic' | 'physics' | 'weather' | 'fourth_wall' | 'cinema' | 'online' | 'cursed'
export type RarityTier = 'common' | 'uncommon' | 'cursed'
export type PipeStyle = 'classic' | 'rust' | 'neon' | 'gothic' | 'crystal' | 'cosmic' | 'overgrown' | 'retro' | 'origami' | 'quantum' | 'void'


export interface UniverseConfig {
  id: string
  num: string
  name: string
  sub: string
  flavor: UniverseFlavor
  rarity: RarityTier
  rain: number
  speed: number
  grav: number
  desat: number
  sky: [string, string]
  drama?: boolean
  sneeze?: boolean
  trust?: boolean
  deepEnd?: boolean
  longGoodbye?: boolean
  dejaVu?: boolean
  wind?: boolean
  insomnia?: boolean
  lowBattery?: boolean
  fog?: boolean
  thunderstorm?: boolean
  autumn?: boolean
  snow?: boolean
  drought?: boolean
  playerLeft?: boolean
  spectator?: boolean
  freeTrial?: boolean
  comments?: boolean
  tutorial?: boolean
  patchNotes?: boolean
  noir?: boolean
  silentFilm?: boolean
  vhs?: boolean
  documentary?: boolean
  musical?: boolean
  anime?: boolean
  memory?: boolean
  leftOnRead?: boolean
  birthday?: boolean
  taxSeason?: boolean
  unionizing?: boolean
  soup?: boolean
  sundayNight?: boolean
  voidMode?: boolean
  therapyBreak?: boolean
  rainbow?: boolean
  nostalgia?: boolean
  wedding?: boolean
  pipeStyle?: PipeStyle
}

export function getPipeStyleForUniverse(u: UniverseConfig): PipeStyle {
  if (u.pipeStyle) return u.pipeStyle
  if (u.voidMode) return 'void'
  if (u.rainbow) return 'cosmic'
  if (u.thunderstorm || u.lowBattery) return 'neon'
  if (u.snow || u.deepEnd) return 'crystal'
  if (u.autumn || u.soup) return 'overgrown'
  if (u.noir || u.silentFilm || u.documentary) return 'origami'
  if (u.vhs || u.comments || u.freeTrial) return 'retro'
  if (u.insomnia || u.taxSeason || u.dreadMeter !== undefined) return 'gothic'
  if (u.rarity === 'cursed' || u.sneeze || u.flip) return 'quantum'
  if (u.flavor === 'physics') return 'rust'
  if (u.flavor === 'fourth_wall') return 'retro'
  if (u.flavor === 'cinema') return 'origami'
  return 'classic'
}

// ----------------------------------------------------------------------
// 1. ALL 40 UNIVERSES DEFINITION
// ----------------------------------------------------------------------

export const UNIVERSE_CONFIGS: UniverseConfig[] = [
  // CLASSIC
  {
    id: 'rain',
    num: '001',
    name: 'The One Where It Rains',
    sub: 'forecast: 100% chance of feelings',
    flavor: 'classic',
    rarity: 'common',
    rain: 1.0,
    speed: 1.0,
    grav: 1,
    desat: 0.12,
    sky: ['#243349', '#131b28']
  },
  {
    id: 'monday',
    num: '014',
    name: 'Monday.',
    sub: 'everything is fine. everything is gray.',
    flavor: 'classic',
    rarity: 'common',
    rain: 0.22,
    speed: 0.76,
    grav: 1,
    desat: 0.78,
    sky: ['#2b2f36', '#16181d']
  },
  {
    id: 'flip',
    num: '027',
    name: 'The Upside-Down-ish One',
    sub: 'gravity filed for divorce',
    flavor: 'classic',
    rarity: 'uncommon',
    rain: 0.4,
    speed: 1.0,
    grav: -1,
    desat: 0.2,
    sky: ['#2a2f3d', '#141019']
  },
  {
    id: 'echo',
    num: '033',
    name: 'The Echo',
    sub: 'you died here before. watch yourself.',
    flavor: 'classic',
    rarity: 'common',
    rain: 0.5,
    speed: 1.05,
    grav: 1,
    desat: 0.35,
    sky: ['#1e3138', '#0d171b']
  },
  {
    id: 'drama',
    num: '046',
    name: 'Drama Universe',
    sub: '[sad violin intensifies]',
    flavor: 'classic',
    rarity: 'common',
    rain: 0.6,
    speed: 1.05,
    grav: 1,
    desat: 0.5,
    sky: ['#1b2231', '#0a0d14'],
    drama: true
  },

  // PHYSICS THAT HURTS
  {
    id: 'sneeze',
    num: '051',
    name: 'The Sneeze',
    sub: 'bless you. …nobody said it back.',
    flavor: 'physics',
    rarity: 'common',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.2,
    sky: ['#26333c', '#151d23'],
    sneeze: true
  },
  {
    id: 'trust',
    num: '052',
    name: 'Trust Issues',
    sub: 'some obstacles were never real. this changes nothing.',
    flavor: 'physics',
    rarity: 'uncommon',
    rain: 0.4,
    speed: 1.0,
    grav: 1,
    desat: 0.3,
    sky: ['#1d2c38', '#0e1821'],
    trust: true
  },
  {
    id: 'deep_end',
    num: '053',
    name: 'The Deep End',
    sub: 'the pressure down here is emotional and also literal.',
    flavor: 'physics',
    rarity: 'common',
    rain: 0.0,
    speed: 0.8,
    grav: 0.55,
    desat: 0.15,
    sky: ['#14384a', '#081c27'],
    deepEnd: true
  },
  {
    id: 'long_goodbye',
    num: '054',
    name: 'The Long Goodbye',
    sub: 'it shrinks. you noticed. good.',
    flavor: 'physics',
    rarity: 'uncommon',
    rain: 0.6,
    speed: 1.0,
    grav: 1,
    desat: 0.4,
    sky: ['#2c2436', '#17111f'],
    longGoodbye: true
  },
  {
    id: 'deja_vu',
    num: '055',
    name: 'Déjà Vu',
    sub: "you've been here before. you'll be here again.",
    flavor: 'physics',
    rarity: 'common',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.25,
    sky: ['#23303d', '#121a22'],
    dejaVu: true
  },
  {
    id: 'wind',
    num: '056',
    name: 'Wind Day',
    sub: 'even the air has opinions about you.',
    flavor: 'physics',
    rarity: 'common',
    rain: 0.8,
    speed: 1.05,
    grav: 1,
    desat: 0.2,
    sky: ['#293845', '#162029'],
    wind: true
  },
  {
    id: 'insomnia',
    num: '057',
    name: 'Insomnia',
    sub: 'why are you like this.',
    flavor: 'physics',
    rarity: 'uncommon',
    rain: 0.3,
    speed: 0.95,
    grav: 1,
    desat: 0.6,
    sky: ['#181a24', '#0a0b12'],
    insomnia: true
  },
  {
    id: 'low_battery',
    num: '058',
    name: 'Low Battery',
    sub: "you should've charged. in every sense.",
    flavor: 'physics',
    rarity: 'uncommon',
    rain: 0.2,
    speed: 0.9,
    grav: 1,
    desat: 0.5,
    sky: ['#232323', '#111111'],
    lowBattery: true
  },

  // WEATHER OF THE SOUL
  {
    id: 'fog',
    num: '060',
    name: 'The Fog',
    sub: "you can't see the future. or the pipes.",
    flavor: 'weather',
    rarity: 'common',
    rain: 0.3,
    speed: 0.95,
    grav: 1,
    desat: 0.45,
    sky: ['#353d46', '#1c2228'],
    fog: true
  },
  {
    id: 'thunderstorm',
    num: '061',
    name: 'Thunderstorm',
    sub: 'the sky is also going through something.',
    flavor: 'weather',
    rarity: 'uncommon',
    rain: 1.8,
    speed: 1.1,
    grav: 1,
    desat: 0.3,
    sky: ['#161c28', '#0a0d14'],
    thunderstorm: true
  },
  {
    id: 'autumn',
    num: '062',
    name: 'Autumn',
    sub: "everything beautiful falls. that's the whole thing.",
    flavor: 'weather',
    rarity: 'common',
    rain: 0.2,
    speed: 0.95,
    grav: 1,
    desat: 0.1,
    sky: ['#3a261c', '#20130d'],
    autumn: true
  },
  {
    id: 'snow',
    num: '063',
    name: 'Snow Day',
    sub: 'the world went quiet. too quiet.',
    flavor: 'weather',
    rarity: 'common',
    rain: 0.0,
    speed: 0.88,
    grav: 1,
    desat: 0.2,
    sky: ['#283545', '#161f2a'],
    snow: true
  },
  {
    id: 'drought',
    num: '064',
    name: 'The Drought',
    sub: "where did the rain go. don't ask.",
    flavor: 'weather',
    rarity: 'uncommon',
    rain: 0.0,
    speed: 1.0,
    grav: 1,
    desat: 0.1,
    sky: ['#423226', '#261b12'],
    drought: true
  },

  // FOURTH-WALL UNIVERSES
  {
    id: 'player_left',
    num: '070',
    name: 'The Player Left',
    sub: "they said they'd be right back. that was 40 pipes ago.",
    flavor: 'fourth_wall',
    rarity: 'uncommon',
    rain: 0.4,
    speed: 1.0,
    grav: 1,
    desat: 0.3,
    sky: ['#242938', '#12151f'],
    playerLeft: true
  },
  {
    id: 'spectator',
    num: '071',
    name: 'Spectator Mode',
    sub: "this is what you could've been.",
    flavor: 'fourth_wall',
    rarity: 'common',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.25,
    sky: ['#1c2d38', '#0c1820'],
    spectator: true
  },
  {
    id: 'free_trial',
    num: '072',
    name: 'Free Trial',
    sub: 'upgrade to keep suffering.',
    flavor: 'fourth_wall',
    rarity: 'uncommon',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.2,
    sky: ['#332a1c', '#1c150b'],
    freeTrial: true
  },
  {
    id: 'comments',
    num: '073',
    name: 'Comment Section',
    sub: '1.2k dislikes. 0 hugs.',
    flavor: 'fourth_wall',
    rarity: 'common',
    rain: 0.4,
    speed: 1.0,
    grav: 1,
    desat: 0.2,
    sky: ['#202636', '#0f121d'],
    comments: true
  },
  {
    id: 'tutorial',
    num: '074',
    name: 'The Tutorial Nobody Skipped',
    sub: 'tap to flap. tap emotionally.',
    flavor: 'fourth_wall',
    rarity: 'common',
    rain: 0.5,
    speed: 0.95,
    grav: 1,
    desat: 0.15,
    sky: ['#213331', '#0e1a19'],
    tutorial: true
  },
  {
    id: 'patch_notes',
    num: '075',
    name: 'Patch Notes',
    sub: 'fixed a bug where you were happy. hope has been nerfed.',
    flavor: 'fourth_wall',
    rarity: 'uncommon',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.35,
    sky: ['#1d2836', '#0c131c'],
    patchNotes: true
  },

  // CINEMA OF SADNESS
  {
    id: 'noir',
    num: '080',
    name: 'Noir',
    sub: 'she walked in like a bad memory.',
    flavor: 'cinema',
    rarity: 'common',
    rain: 1.5,
    speed: 0.95,
    grav: 1,
    desat: 1.0,
    sky: ['#1a1a1a', '#080808'],
    noir: true
  },
  {
    id: 'silent_film',
    num: '081',
    name: 'Silent Film',
    sub: 'ALAS. the pipe. the betrayal. the rain.',
    flavor: 'cinema',
    rarity: 'common',
    rain: 0.4,
    speed: 0.9,
    grav: 1,
    desat: 0.95,
    sky: ['#252520', '#10100d'],
    silentFilm: true
  },
  {
    id: 'vhs',
    num: '082',
    name: 'VHS',
    sub: "rewinding won't fix it. we checked.",
    flavor: 'cinema',
    rarity: 'common',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.3,
    sky: ['#1d2238', '#0c0f1c'],
    vhs: true
  },
  {
    id: 'documentary',
    num: '083',
    name: 'Documentary',
    sub: 'here we see the flappy, in its natural despair.',
    flavor: 'cinema',
    rarity: 'common',
    rain: 0.5,
    speed: 0.95,
    grav: 1,
    desat: 0.2,
    sky: ['#23332c', '#0f1c16'],
    documentary: true
  },
  {
    id: 'musical',
    num: '084',
    name: 'The Musical',
    sub: 'jazz hands. jazz tears.',
    flavor: 'cinema',
    rarity: 'uncommon',
    rain: 0.4,
    speed: 1.0,
    grav: 1,
    desat: 0.15,
    sky: ['#382436', '#1c0f1b'],
    musical: true
  },
  {
    id: 'anime',
    num: '085',
    name: 'Anime',
    sub: 'SECRET ART: SORROWFUL FLAP.',
    flavor: 'cinema',
    rarity: 'common',
    rain: 0.6,
    speed: 1.1,
    grav: 1,
    desat: 0.0,
    sky: ['#1c2842', '#091224'],
    anime: true
  },
  {
    id: 'memory',
    num: '086',
    name: 'Memory',
    sub: "it was better before. probably. you weren't there.",
    flavor: 'cinema',
    rarity: 'common',
    rain: 0.3,
    speed: 0.92,
    grav: 1,
    desat: 0.4,
    sky: ['#383224', '#1f1a10'],
    memory: true
  },

  // EXTREMELY ONLINE / ABSURD
  {
    id: 'left_on_read',
    num: '090',
    name: 'Left On Read',
    sub: 'seen 2:47 pm. delivered. not received.',
    flavor: 'online',
    rarity: 'common',
    rain: 0.4,
    speed: 1.0,
    grav: 1,
    desat: 0.2,
    sky: ['#1c2a38', '#0c1620'],
    leftOnRead: true
  },
  {
    id: 'birthday',
    num: '091',
    name: 'Birthday Nobody Came To',
    sub: "make a wish. it won't help.",
    flavor: 'online',
    rarity: 'common',
    rain: 0.3,
    speed: 0.95,
    grav: 1,
    desat: 0.1,
    sky: ['#362233', '#1e0e1c'],
    birthday: true
  },
  {
    id: 'tax_season',
    num: '092',
    name: 'Tax Season',
    sub: 'the IRS found you in every universe. even this one.',
    flavor: 'online',
    rarity: 'uncommon',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.4,
    sky: ['#223328', '#0e1c12'],
    taxSeason: true
  },
  {
    id: 'unionizing',
    num: '093',
    name: 'The Birds Are Unionizing',
    sub: 'they have demands. you have a death count.',
    flavor: 'online',
    rarity: 'common',
    rain: 0.5,
    speed: 1.0,
    grav: 1,
    desat: 0.2,
    sky: ['#382b24', '#1f140e'],
    unionizing: true
  },
  {
    id: 'soup',
    num: '094',
    name: 'Soup',
    sub: 'the broth remembers.',
    flavor: 'online',
    rarity: 'common',
    rain: 0.0,
    speed: 0.95,
    grav: 1,
    desat: 0.05,
    sky: ['#3d2e1b', '#24190c'],
    soup: true
  },
  {
    id: 'sunday_night',
    num: '095',
    name: 'Sunday Night',
    sub: "tomorrow is coming. it's always coming.",
    flavor: 'online',
    rarity: 'uncommon',
    rain: 0.6,
    speed: 1.02,
    grav: 1,
    desat: 0.55,
    sky: ['#1c1c28', '#0c0c14'],
    sundayNight: true
  },

  // RARE & CURSED
  {
    id: 'void_mode',
    num: '099',
    name: 'The Void',
    sub: 'you are here. you are nowhere.',
    flavor: 'cursed',
    rarity: 'cursed',
    rain: 0.1,
    speed: 1.0,
    grav: 1,
    desat: 1.0,
    sky: ['#050508', '#000000'],
    voidMode: true
  },
  {
    id: 'therapy',
    num: '100',
    name: 'Therapy Break',
    sub: "you are enough. the gap was enough. break's over.",
    flavor: 'cursed',
    rarity: 'cursed',
    rain: 0.0,
    speed: 0.9,
    grav: 0.9,
    desat: 0.0,
    sky: ['#1e3b33', '#0a1f1a'],
    therapyBreak: true
  },
  {
    id: 'rainbow',
    num: '101',
    name: 'The Rainbow One',
    sub: 'happiness is temporary. this is the lesson.',
    flavor: 'cursed',
    rarity: 'cursed',
    rain: 0.0,
    speed: 1.1,
    grav: 1,
    desat: 0.0,
    sky: ['#4a2a4b', '#1f0d20'],
    rainbow: true
  },
  {
    id: 'nostalgia',
    num: '102',
    name: 'Nostalgia',
    sub: 'remember when games were simple. so was sadness.',
    flavor: 'cursed',
    rarity: 'cursed',
    rain: 0.3,
    speed: 0.95,
    grav: 1,
    desat: 0.3,
    sky: ['#182e20', '#0a170f'],
    nostalgia: true
  },
  {
    id: 'wedding',
    num: '103',
    name: 'The Wedding',
    sub: 'they found someone with a smaller hitbox.',
    flavor: 'cursed',
    rarity: 'cursed',
    rain: 0.2,
    speed: 1.0,
    grav: 1,
    desat: 0.1,
    sky: ['#382433', '#1c0e18'],
    wedding: true
  }
]

// Extra quote pools
export const COMMENT_POOL = [
  'skill issue 💀',
  'my dad left during this run',
  '1.2k dislikes. 0 hugs.',
  'bro thought he could fly',
  'lmao died at pipe 3',
  'refund this universe',
  'he is just like me fr'
]

export const TUTORIAL_POUPS = [
  'TAP TO FLAP. TAP EMOTIONALLY.',
  'AVOID PIPES. LIKE RESPONSIBILITY.',
  'GRAVITY IS MANDATORY.',
  'HOPES WILL BE NERFED.'
]

export const ANIME_ATTACKS = [
  'SECRET ART: SORROWFUL FLAP!',
  'NEAR MISS BLADE!',
  'DESPAIR DASH!',
  'TEAR BURST MODE!'
]

// ----------------------------------------------------------------------
// 2. TIMED TRACKS & LYRICS
// ----------------------------------------------------------------------
export const TRACKS_AND_LYRICS: TrackConfig[] = [
  {
    id: 'rainy-lofi',
    title: 'Rainy Night Musings',
    artist: 'Antigravity & Qwen',
    lyrics: [
      { time: 0.0, text: '[rain intensifies softly]' },
      { time: 3.5, text: 'he waited by the pipe. nobody came.' },
      { time: 8.0, text: '[a single piano note, held too long]' },
      { time: 13.0, text: 'the gap was a metaphor. for what, nobody said.' },
      { time: 18.5, text: 'she took the umbrella and never returned.' },
      { time: 24.0, text: '[thunder, but emotionally]' },
      { time: 29.0, text: 'somewhere, a dog still remembers you.' },
      { time: 34.5, text: 'the credits will not fix this.' },
      { time: 40.0, text: 'he flapped. it was not enough. it is never enough.' },
      { time: 46.0, text: 'based on a true sadness.' }
    ]
  }
]

// ----------------------------------------------------------------------
// 3. FALLBACK SUBTITLES POOL
// ----------------------------------------------------------------------
export const FALLBACK_SUBS: string[] = [
  '[rain intensifies]',
  'he waited by the pipe. nobody came.',
  '[sad violin]',
  'the gap was a metaphor. for what, nobody said.',
  'she took the umbrella and never returned.',
  '[thunder, but emotionally]',
  'somewhere, a dog still remembers you.',
  'the credits will not fix this.',
  '[a single piano note, held too long]',
  'he flapped. it was not enough. it is never enough.',
  'based on a true sadness.',
  'they promised sunny skies tomorrow. tomorrow never came.',
  '[distant lo-fi vinyl crackle]',
  'you cannot flap away from your own memory.'
]

export const BIRD_THOUGHTS: string[] = [
  'is this all there is',
  'the pipes never loved me',
  'i could have been a cloud',
  'mom was right',
  'flap. cry. repeat.',
  'what if i just… drifted',
  'the gap fears me too',
  'i miss the nest',
  'do pipes dream',
  'the sky is just more floor',
  'why gravity gotta be so personal',
  'another pipe, another regret'
]

export const DEATH_EPITAPHS: string[] = [
  'the ground understood your pain.',
  'you have reached the void. the void is also sad.',
  'it’s not the fall. it’s the pipe. it’s always the pipe.',
  'somewhere, in another universe, you made it. not this one.',
  'the rain will remember you.',
  'gravity remains undefeated.',
  'you flew like a feeling nobody named.',
  'that pipe has a family. so do you. anyway.',
  'even birds get tired of reaching for height.',
  'the collision was quick. the memory lingers.'
]

export const APOLOGY_QUOTES: string[] = [
  'sorry :(',
  'my bad…',
  'nothing personal',
  'i do this to everyone',
  'forgive me',
  'was that you?',
  'i stood in the wrong spot…',
  'don’t look at me like that'
]

export const MULTIVERSE_VIDEOS: string[] = [
  '/multiverse/ssstik.io_1784846702443.mp4',
  '/multiverse/ssstik.io_@_caileng_1784846852587.mp4',
  '/multiverse/ssstik.io_@_japhette__1784846645457.mp4',
  '/multiverse/ssstik.io_@aveiw._.__1784846730994.mp4',
  '/multiverse/ssstik.io_@blossom_of_shadow_edit_1784846512468.mp4',
  '/multiverse/ssstik.io_@h0361238_1784846968392.mp4',
  '/multiverse/ssstik.io_@javajavijoo_1784846816701.mp4',
  '/multiverse/ssstik.io_@lu.seno_1784846888872.mp4',
  '/multiverse/ssstik.io_@moonlitblues__1784846798057.mp4',
  '/multiverse/ssstik.io_@paindevie26_1784846777168.mp4',
  '/multiverse/ssstik.io_@syrelcalampiano00_1784846942159.mp4',
  '/multiverse/ssstik.io_@unknown.man6913_1784846981285.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846436976.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846542812.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846680171.mp4',
  '/multiverse/ssstik.io_@whitesongs4_1784846786537.mp4',
  '/multiverse/ssstik.io_@whos_leyyyy_1784846666515.mp4',
  '/multiverse/ssstik.io_@zy_mxc_1784846590404.mp4'
]

export const NEAR_MISS_QUOTES: string[] = [
  'so close. like everything else.',

  // FAILURE
  'almost. your whole life, almost.',
  "you made it. don't get used to it.",
  'survived. the bar is on the floor.',
  "you're great at nearly.",
  "close doesn't count. it never counted.",
  "you peaked at 'almost.'",
  'success is a rumor you keep hearing.',
  'not a failure. a learning experience. about failure.',
  "the gap forgives you. your resume won't.",
  "one day you'll make it. statistically.",
  "that's the closest you'll get. to anything.",
  "another one you didn't mess up. yet.",
  'the pipe believed in you. briefly.',
  'you dodged it. like responsibility.',

  // RELATIONSHIPS
  'closer than your last relationship got.',
  'you almost had them. you always almost do.',
  "they said 'maybe.' it meant no.",
  'this gap lasted longer than they did.',
  "you fit through. they didn't fit in.",
  'left on read. by the pipe. by everyone.',
  'you two had something. for 0.3 seconds.',
  "it's not you. it's the pipe. it's also you.",
  "they're with a bird who doesn't flap now.",
  'you gave 100%. they gave a thumbs up.',
  "the pipe will remember you. they won't.",
  'they said forever. forever was four days.',
  "'it's complicated.' everything is.",
  'you swiped. nothing matched. even the pipes.',

  // LIFE
  "you're still here. questionable. but here.",
  'this is it. this is the whole thing.',
  "life flashes. it's mostly pipes.",
  "another day you didn't plan for.",
  'adulthood is just pipes with rent.',
  'nobody gives you the gap tutorial.',
  'the meaning of life was this. sorry.',
  'living is just not dying, repeatedly.',
  'you peaked in the tutorial.',
  'everything happens for a reason. the reason is pipes.',
  'you came, you saw, you nearly died.',
  'the rent is due in every universe.',
  "you'll figure it out. you won't. you'll be fine.",
  "you're the main character. of a sad game.",

  // PASSION
  'the dream was bigger. the gap is smaller.',
  "you wanted to be an astronaut. you're a bird.",
  'passion looks a lot like panic, up close.',
  'this is what you practiced for. somehow.',
  "your childhood dream didn't include pipes.",
  "you're living the dream. it's raining.",
  "the spark is still there. it's wet.",
  "dreams don't come true. gaps do. barely.",
  'you used to want more. now you want the gap.',
  "the fire inside is mostly smoke now.",
  "you're chasing something. it's the next pipe.",
  'make art, they said. you made it through.',
  'your passion has a hitbox now.',
  'you believed in something once. it was a gap.',

  // SELF
  'you made it. you, specifically. somehow.',
  "proud of you. nobody else is. that's fine.",
  "you're enough. the gap agrees. barely.",
  'self-love is surviving a pipe. technically.',
  "inner child is watching. they're stressed.",
  'you are the problem and the solution. mostly the problem.',
  'growth looks like this. damp and narrow.',
  "healing isn't linear. it's pipes.",
  "you're not the same bird. you're worse. but wiser.",
  'be kind to yourself. you just almost died.',
  'you matter. to the scoreboard. briefly.',
  "the voice in your head said 'you got this.' it lied. you got it.",
  "you forgave yourself. the pipe didn't. you made it anyway.",
  "you're becoming someone. it's mostly flapping."
]
