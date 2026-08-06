export interface EmoteDef {
  id: number;
  row: number;
  col: number;
  key: string;
  name: string;
  category: string;
  isPlayerEmote: boolean;
  imagePath: string;
  shortcuts: string[];
}

export const PLAYER_EMOTES: EmoteDef[] = [
  // Row 1: Emotions & Expressions (001 - 010)
  { id: 1, row: 1, col: 1, key: 'exclamation', name: 'Exclamation Mark (!)', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_001.png', shortcuts: [':!', ':exclamation:'] },
  { id: 2, row: 1, col: 2, key: 'question', name: 'Question Mark (?)', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_002.png', shortcuts: [':?', ':question:'] },
  { id: 3, row: 1, col: 3, key: 'interrobang', name: 'Surprise (!?)', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_003.png', shortcuts: [':!?:', ':surprise:'] },
  { id: 4, row: 1, col: 4, key: 'shock_spikes', name: 'Shock Spikes', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_004.png', shortcuts: [':shock:', ':anger_spikes:'] },
  { id: 5, row: 1, col: 5, key: 'music_note', name: 'Musical Note', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_005.png', shortcuts: [':music:', ':note:'] },
  { id: 6, row: 1, col: 6, key: 'sparkles', name: 'Sparkles', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_006.png', shortcuts: [':sparkles:', ':glitter:'] },
  { id: 7, row: 1, col: 7, key: 'yellow_star', name: 'Yellow Star', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_007.png', shortcuts: [':star:', ':yellow_star:'] },
  { id: 8, row: 1, col: 8, key: 'thought_star', name: 'Thought Bubble Star', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_008.png', shortcuts: [':thought_star:'] },
  { id: 9, row: 1, col: 9, key: 'pink_heart', name: 'Pink Heart', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_009.png', shortcuts: [':heart:', '<3', ':love:'] },
  { id: 10, row: 1, col: 10, key: 'broken_heart', name: 'Broken Heart', category: 'Emotions & Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_010.png', shortcuts: [':broken_heart:', '</3'] },

  // Row 2: States & Feelings (011 - 020)
  { id: 11, row: 2, col: 1, key: 'blushing', name: 'Blushing Face', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_011.png', shortcuts: [':blush:', ':embarrassed:'] },
  { id: 12, row: 2, col: 2, key: 'kiss', name: 'Kiss / Lips', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_012.png', shortcuts: [':kiss:', ':lips:'] },
  { id: 13, row: 2, col: 3, key: 'flower', name: 'Flower', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_013.png', shortcuts: [':flower:', ':blossom:'] },
  { id: 14, row: 2, col: 4, key: 'swirl', name: 'Swirl / Dizzy', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_014.png', shortcuts: [':dizzy:', ':swirl:'] },
  { id: 15, row: 2, col: 5, key: 'party_popper', name: 'Party Popper', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_015.png', shortcuts: [':party:', ':tada:'] },
  { id: 16, row: 2, col: 6, key: 'bullseye', name: 'Bullseye', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_016.png', shortcuts: [':target:', ':bullseye:'] },
  { id: 17, row: 2, col: 7, key: 'lightbulb', name: 'Lightbulb / Idea', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_017.png', shortcuts: [':idea:', ':lightbulb:'] },
  { id: 18, row: 2, col: 8, key: 'ellipsis', name: 'Silence (...)', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_018.png', shortcuts: [':...', ':silence:'] },
  { id: 19, row: 2, col: 9, key: 'scribble', name: 'Scribble / Confusion', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_019.png', shortcuts: [':confusion:', ':scribble:'] },
  { id: 20, row: 2, col: 10, key: 'spiral', name: 'Hypnosis / Spiral', category: 'States & Feelings', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_020.png', shortcuts: [':hypnosis:', ':spiral:'] },

  // Row 3: Physical Status (021 - 030)
  { id: 21, row: 3, col: 1, key: 'zzz', name: 'Sleeping (Zzz)', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_021.png', shortcuts: [':zzz:', ':sleep:'] },
  { id: 22, row: 3, col: 2, key: 'angered', name: 'Angered / Vein Pop', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_022.png', shortcuts: [':angry:', ':vein:'] },
  { id: 23, row: 3, col: 3, key: 'cold_sweat', name: 'Cold Sweat', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_023.png', shortcuts: [':sweat:', ':cold_sweat:'] },
  { id: 24, row: 3, col: 4, key: 'gloom', name: 'Gloom Cloud', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_024.png', shortcuts: [':gloom:', ':sad:'] },
  { id: 25, row: 3, col: 5, key: 'shock_lines', name: 'Shock Lines', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_025.png', shortcuts: [':shock_lines:'] },
  { id: 26, row: 3, col: 6, key: 'water_drop', name: 'Water Drop', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_026.png', shortcuts: [':drop:', ':water:'] },
  { id: 27, row: 3, col: 7, key: 'sweat_drops', name: 'Sweat Drops', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_027.png', shortcuts: [':sweat_drops:'] },
  { id: 28, row: 3, col: 8, key: 'skull', name: 'Skull / Dead', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_028.png', shortcuts: [':skull:', ':dead:'] },
  { id: 29, row: 3, col: 9, key: 'impact_slash', name: 'Impact / Slash', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_029.png', shortcuts: [':slash:', ':impact:'] },
  { id: 30, row: 3, col: 10, key: 'rock', name: 'Rock / Stone', category: 'Physical Status', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_030.png', shortcuts: [':rock:', ':stone:'] },

  // Row 4: Facial Expressions (031 - 040)
  { id: 31, row: 4, col: 1, key: 'sparkling_eyes', name: 'Sparkling Eyes', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_031.png', shortcuts: [':sparkle_eyes:'] },
  { id: 32, row: 4, col: 2, key: 'wide_eyes', name: 'Wide Eyes', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_032.png', shortcuts: [':stare:', ':blank:'] },
  { id: 33, row: 4, col: 3, key: 'squinting', name: 'Squinting / Pain', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_033.png', shortcuts: [':pain:', ':squint:'] },
  { id: 34, row: 4, col: 4, key: 'silly_tongue', name: 'Silly / Tongue Out', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_034.png', shortcuts: [':silly:', ':tongue:'] },
  { id: 35, row: 4, col: 5, key: 'whistle', name: 'Whistle / Blowing', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_035.png', shortcuts: [':whistle:'] },
  { id: 36, row: 4, col: 6, key: 'ghost_face', name: 'Ghost Face / Horror', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_036.png', shortcuts: [':horror:', ':scared:'] },
  { id: 37, row: 4, col: 7, key: 'evil_grin', name: 'Mischievous / Evil Grin', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_037.png', shortcuts: [':grin:', ':evil:'] },
  { id: 38, row: 4, col: 8, key: 'glowing_eyes', name: 'Glowing Cross Eyes', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_038.png', shortcuts: [':glowing_eyes:'] },
  { id: 39, row: 4, col: 9, key: 'flame', name: 'Flame / On Fire', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_039.png', shortcuts: [':fire:', ':flame:'] },
  { id: 40, row: 4, col: 10, key: 'water_orb', name: 'Water Orb / Bubble', category: 'Facial Expressions', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_040.png', shortcuts: [':bubble:', ':orb:'] },

  // Row 5: Combat & Effects (041 - 050)
  { id: 41, row: 5, col: 1, key: 'ground_crack', name: 'Ground Crack', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_041.png', shortcuts: [':crack:'] },
  { id: 42, row: 5, col: 2, key: 'blood_splatter', name: 'Blood Splatter', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_042.png', shortcuts: [':blood:', ':splatter:'] },
  { id: 43, row: 5, col: 3, key: 'flash_loading', name: 'Flash / Loading', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_043.png', shortcuts: [':flash:', ':loading:'] },
  { id: 44, row: 5, col: 4, key: 'crossed_swords', name: 'Crossed Swords', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_044.png', shortcuts: [':swords:', ':battle:'] },
  { id: 45, row: 5, col: 5, key: 'sunburst', name: 'Explosive Sunburst', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_045.png', shortcuts: [':boom:', ':sunburst:'] },
  { id: 46, row: 5, col: 6, key: 'hexagram', name: 'Hexagram', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_046.png', shortcuts: [':hexagram:'] },
  { id: 47, row: 5, col: 7, key: 'bright_starburst', name: 'Bright Starburst', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_047.png', shortcuts: [':starburst:'] },
  { id: 48, row: 5, col: 8, key: 'sharp_teeth', name: 'Sharp Teeth / Chomp', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_048.png', shortcuts: [':chomp:', ':teeth:'] },
  { id: 49, row: 5, col: 9, key: 'rune_text', name: 'Unreadable Rune', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_049.png', shortcuts: [':rune:'] },
  { id: 50, row: 5, col: 10, key: 'musical_staff', name: 'Musical Staff', category: 'Combat & Effects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_050.png', shortcuts: [':staff:', ':notes:'] },

  // Row 6: Misc Objects & Weather (051 - 060)
  { id: 51, row: 6, col: 1, key: 'numbers_misc', name: 'Numbers (3,4,7)', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_051.png', shortcuts: [':numbers:'] },
  { id: 52, row: 6, col: 2, key: 'math_symbols', name: 'Math Symbols', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_052.png', shortcuts: [':math:'] },
  { id: 53, row: 6, col: 3, key: 'sun', name: 'Sun', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_053.png', shortcuts: [':sun:', ':sunny:'] },
  { id: 54, row: 6, col: 4, key: 'cloud', name: 'Cloud', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_054.png', shortcuts: [':cloud:'] },
  { id: 55, row: 6, col: 5, key: 'lightning_cloud', name: 'Lightning Cloud', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_055.png', shortcuts: [':lightning:', ':thunder:'] },
  { id: 56, row: 6, col: 6, key: 'rain_cloud', name: 'Rain Cloud', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_056.png', shortcuts: [':rain:'] },
  { id: 57, row: 6, col: 7, key: 'snowman', name: 'Snowman', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_057.png', shortcuts: [':snowman:', ':snow:'] },
  { id: 58, row: 6, col: 8, key: 'rainbow', name: 'Rainbow', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_058.png', shortcuts: [':rainbow:'] },
  { id: 59, row: 6, col: 9, key: 'moon_star', name: 'Moon & Star', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_059.png', shortcuts: [':moon:'] },
  { id: 60, row: 6, col: 10, key: 'bread', name: 'Bread Loaf', category: 'Misc & Weather', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_060.png', shortcuts: [':bread:'] },

  // Row 7: Items & Food (061 - 070)
  { id: 61, row: 7, col: 1, key: 'meat', name: 'Meat on Bone', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_061.png', shortcuts: [':meat:'] },
  { id: 62, row: 7, col: 2, key: 'fish', name: 'Fish', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_062.png', shortcuts: [':fish:'] },
  { id: 63, row: 7, col: 3, key: 'mushroom', name: 'Mushroom', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_063.png', shortcuts: [':mushroom:'] },
  { id: 64, row: 7, col: 4, key: 'apple', name: 'Red Apple', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_064.png', shortcuts: [':apple:'] },
  { id: 65, row: 7, col: 5, key: 'cake', name: 'Cake Slice', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_065.png', shortcuts: [':cake:'] },
  { id: 66, row: 7, col: 6, key: 'coffee', name: 'Hot Tea / Coffee', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_066.png', shortcuts: [':coffee:', ':tea:'] },
  { id: 67, row: 7, col: 7, key: 'beer', name: 'Mug of Beer', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_067.png', shortcuts: [':beer:'] },
  { id: 68, row: 7, col: 8, key: 'letter', name: 'Sealed Letter', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_068.png', shortcuts: [':letter:', ':mail:'] },
  { id: 69, row: 7, col: 9, key: 'book', name: 'Open Book', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_069.png', shortcuts: [':book:'] },
  { id: 70, row: 7, col: 10, key: 'bomb', name: 'Bomb', category: 'Items & Food', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_070.png', shortcuts: [':bomb:'] },

  // Row 8: RPG Objects (071 - 080)
  { id: 71, row: 8, col: 1, key: 'hammer', name: 'Hammer', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_071.png', shortcuts: [':hammer:'] },
  { id: 72, row: 8, col: 2, key: 'red_button', name: 'Red Button', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_072.png', shortcuts: [':button:'] },
  { id: 73, row: 8, col: 3, key: 'pocket_watch', name: 'Pocket Watch', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_073.png', shortcuts: [':watch:', ':timer:'] },
  { id: 74, row: 8, col: 4, key: 'coin_medal', name: 'Coin / Medal', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_074.png', shortcuts: [':coin:'] },
  { id: 75, row: 8, col: 5, key: 'diamond', name: 'Diamond Gem', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_075.png', shortcuts: [':gem:', ':diamond:'] },
  { id: 76, row: 8, col: 6, key: 'chest', name: 'Treasure Chest', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_076.png', shortcuts: [':chest:'] },
  { id: 77, row: 8, col: 7, key: 'gift', name: 'Wrapped Gift', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_077.png', shortcuts: [':gift:'] },
  { id: 78, row: 8, col: 8, key: 'trophy', name: 'Trophy', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_078.png', shortcuts: [':trophy:'] },
  { id: 79, row: 8, col: 9, key: 'gold_medal', name: 'Gold Medal', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_079.png', shortcuts: [':medal:'] },
  { id: 80, row: 8, col: 10, key: 'crown', name: 'Crown', category: 'RPG Objects', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_080.png', shortcuts: [':crown:'] },

  // Row 9: Characters & Hands (081 - 090)
  { id: 81, row: 9, col: 1, key: 'chick', name: 'Yellow Chick', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_081.png', shortcuts: [':chick:', ':bird:'] },
  { id: 82, row: 9, col: 2, key: 'angel', name: 'Angel', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_082.png', shortcuts: [':angel:'] },
  { id: 83, row: 9, col: 3, key: 'bat', name: 'Bat', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_083.png', shortcuts: [':bat:'] },
  { id: 84, row: 9, col: 4, key: 'ghost', name: 'Ghost', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_084.png', shortcuts: [':ghost:'] },
  { id: 85, row: 9, col: 5, key: 'poop', name: 'Stinky Poop', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_085.png', shortcuts: [':poop:'] },
  { id: 86, row: 9, col: 6, key: 'fist', name: 'Fist', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_086.png', shortcuts: [':fist:'] },
  { id: 87, row: 9, col: 7, key: 'peace', name: 'Peace Sign', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_087.png', shortcuts: [':peace:', ':v:'] },
  { id: 88, row: 9, col: 8, key: 'wave', name: 'Open Hand Wave', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_088.png', shortcuts: [':wave:', ':hi:'] },
  { id: 89, row: 9, col: 9, key: 'trend_up', name: 'Red Arrow Up-Right', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_089.png', shortcuts: [':trend_up:'] },
  { id: 90, row: 9, col: 10, key: 'trend_down', name: 'Blue Arrow Down-Right', category: 'Characters & Hands', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_090.png', shortcuts: [':trend_down:'] },

  // Row 10: Card Suits & Symbols (091 - 100)
  { id: 91, row: 10, col: 1, key: 'spade', name: 'Spade', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_091.png', shortcuts: [':spade:'] },
  { id: 92, row: 10, col: 2, key: 'card_heart', name: 'Card Heart', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_092.png', shortcuts: [':card_heart:'] },
  { id: 93, row: 10, col: 3, key: 'club', name: 'Club', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_093.png', shortcuts: [':club:'] },
  { id: 94, row: 10, col: 4, key: 'card_diamond', name: 'Card Diamond', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_094.png', shortcuts: [':card_diamond:'] },
  { id: 95, row: 10, col: 5, key: 'male', name: 'Male Symbol', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_095.png', shortcuts: [':male:'] },
  { id: 96, row: 10, col: 6, key: 'female', name: 'Female Symbol', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_096.png', shortcuts: [':female:'] },
  { id: 97, row: 10, col: 7, key: 'target_circle', name: 'Target Circle', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_097.png', shortcuts: [':circle:'] },
  { id: 98, row: 10, col: 8, key: 'blue_x', name: 'Blue X', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_098.png', shortcuts: [':blue_x:', ':x:'] },
  { id: 99, row: 10, col: 9, key: 'yellow_triangle', name: 'Yellow Triangle', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_099.png', shortcuts: [':triangle:'] },
  { id: 100, row: 10, col: 10, key: 'green_square', name: 'Green Square', category: 'Card Suits & Symbols', isPlayerEmote: true, imagePath: '/assets/emotes/player/emote_100.png', shortcuts: [':square:'] }
];

export const SYSTEM_EMOTES: EmoteDef[] = [
  // Row 11: Numbers 0–9 (101 - 110)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 101 + i,
    row: 11,
    col: i + 1,
    key: `num_${i}`,
    name: `Number ${i}`,
    category: 'Numbers',
    isPlayerEmote: false,
    imagePath: `/assets/emotes/system/marker_${String(101 + i).padStart(3, '0')}.png`,
    shortcuts: [`:num_${i}:`]
  })),

  // Row 12: Directional Arrows (111 - 120)
  { id: 111, row: 12, col: 1, key: 'arrow_up', name: 'Up Arrow', category: 'Arrows', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_111.png', shortcuts: [':arrow_up:'] },
  { id: 112, row: 12, col: 2, key: 'arrow_down', name: 'Down Arrow', category: 'Arrows', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_112.png', shortcuts: [':arrow_down:'] },
  { id: 113, row: 12, col: 3, key: 'arrow_left', name: 'Left Arrow', category: 'Arrows', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_113.png', shortcuts: [':arrow_left:'] },
  { id: 114, row: 12, col: 4, key: 'arrow_right', name: 'Right Arrow', category: 'Arrows', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_114.png', shortcuts: [':arrow_right:'] },

  // Row 15: White UI Markers (141 - 150)
  { id: 141, row: 15, col: 1, key: 'ui_check', name: 'CHECK! (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_141.png', shortcuts: [':check:'] },
  { id: 142, row: 15, col: 2, key: 'ui_start', name: 'START (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_142.png', shortcuts: [':start:'] },
  { id: 143, row: 15, col: 3, key: 'ui_goal', name: 'GOAL (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_143.png', shortcuts: [':goal:'] },
  { id: 144, row: 15, col: 4, key: 'ui_exit', name: 'EXIT (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_144.png', shortcuts: [':exit:'] },
  { id: 145, row: 15, col: 5, key: 'ui_player', name: 'PLAYER (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_145.png', shortcuts: [':player_tag:'] },
  { id: 146, row: 15, col: 6, key: 'ui_enemy', name: 'ENEMY (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_146.png', shortcuts: [':enemy_tag:'] },
  { id: 147, row: 15, col: 7, key: 'ui_boss', name: 'BOSS (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_147.png', shortcuts: [':boss_tag:'] },
  { id: 148, row: 15, col: 8, key: 'ui_target', name: 'TARGET (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_148.png', shortcuts: [':target_tag:'] },
  { id: 149, row: 15, col: 9, key: 'ui_item', name: 'ITEM (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_149.png', shortcuts: [':item_tag:'] },
  { id: 150, row: 15, col: 10, key: 'ui_treasure', name: 'TREASURE (White)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_150.png', shortcuts: [':treasure_tag:'] },

  // Row 16: Colored UI Markers (151 - 160)
  { id: 151, row: 16, col: 1, key: 'ui_check_red', name: 'CHECK! (Red)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_151.png', shortcuts: [':check_red:'] },
  { id: 152, row: 16, col: 2, key: 'ui_start_cyan', name: 'START (Cyan)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_152.png', shortcuts: [':start_cyan:'] },
  { id: 153, row: 16, col: 3, key: 'ui_goal_orange', name: 'GOAL (Orange)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_153.png', shortcuts: [':goal_orange:'] },
  { id: 154, row: 16, col: 4, key: 'ui_exit_green', name: 'EXIT (Green)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_154.png', shortcuts: [':exit_green:'] },
  { id: 155, row: 16, col: 5, key: 'ui_player_yellow', name: 'PLAYER (Yellow)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_155.png', shortcuts: [':player_yellow:'] },
  { id: 156, row: 16, col: 6, key: 'ui_enemy_red', name: 'ENEMY (Red)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_156.png', shortcuts: [':enemy_red:'] },
  { id: 157, row: 16, col: 7, key: 'ui_boss_darkred', name: 'BOSS (Dark Red)', category: 'UI Markers', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_157.png', shortcuts: [':boss_red:'] },

  // Row 17 & 18: System Tags (161 - 178)
  { id: 161, row: 17, col: 1, key: 'tag_new', name: 'NEW! (White)', category: 'System Tags', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_161.png', shortcuts: [':tag_new:'] },
  { id: 165, row: 17, col: 5, key: 'tag_talk', name: 'TALK (White)', category: 'System Tags', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_165.png', shortcuts: [':tag_talk:'] },
  { id: 166, row: 17, col: 6, key: 'tag_quest', name: 'QUEST (White)', category: 'System Tags', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_166.png', shortcuts: [':tag_quest:'] },
  { id: 171, row: 18, col: 1, key: 'tag_new_red', name: 'NEW! (Red)', category: 'System Tags', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_171.png', shortcuts: [':tag_new_red:'] },
  { id: 176, row: 18, col: 6, key: 'tag_quest_gold', name: 'QUEST (Gold)', category: 'System Tags', isPlayerEmote: false, imagePath: '/assets/emotes/system/marker_176.png', shortcuts: [':tag_quest_gold:'] }
];

export const ALL_EMOTES = [...PLAYER_EMOTES, ...SYSTEM_EMOTES];

// Maps shortcut strings to EmoteDef
const SHORTCUT_MAP = new Map<string, EmoteDef>();
ALL_EMOTES.forEach((e) => {
  e.shortcuts.forEach((sc) => SHORTCUT_MAP.set(sc.toLowerCase(), e));
  SHORTCUT_MAP.set(`:${e.key.toLowerCase()}:`, e);
});

export function findEmoteByShortcut(shortcut: string): EmoteDef | undefined {
  return SHORTCUT_MAP.get(shortcut.trim().toLowerCase());
}

export function findEmoteById(id: number): EmoteDef | undefined {
  return ALL_EMOTES.find((e) => e.id === id);
}

export function findEmoteByKey(key: string): EmoteDef | undefined {
  const cleanKey = key.toLowerCase().replace(/^:|:$/g, '');
  return ALL_EMOTES.find((e) => e.key.toLowerCase() === cleanKey);
}

/**
 * Parses raw text and replaces emote shortcuts (e.g. :heart:, :zzz:, :exclamation:)
 * with inline animated emote badge components.
 */
export function parseChatEmoteTokens(text: string): Array<{ type: 'text' | 'emote'; value: string; emote?: EmoteDef }> {
  // Regex to match :shortcut: or <3 or </3 or :! or :?
  const regex = /(:[a-zA-Z0-9_!?-]+:|<3|<\/3|:!|:\?)/g;
  const parts: Array<{ type: 'text' | 'emote'; value: string; emote?: EmoteDef }> = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.substring(lastIndex, match.index) });
    }
    const token = match[0];
    const emote = findEmoteByShortcut(token);
    if (emote) {
      parts.push({ type: 'emote', value: token, emote });
    } else {
      parts.push({ type: 'text', value: token });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.substring(lastIndex) });
  }

  return parts;
}

