import { GodTool, BiomeType, UniverseSeedInfo } from '../types';

export const GOD_TOOLS: GodTool[] = [
  // 1. STEWARDSHIP & MUTUALISM (Caring for the Paramecia cosmos)
  {
    id: 'whisper_of_harmony',
    name: 'Song of Harmony',
    category: 'stewardship',
    icon: 'Music',
    description: 'Chant a calming celestial frequency across the cosmos, inspiring mutual aid and peaceful communion.',
    cursorColor: '#10b981',
    defaultBrushRadius: 80,
  },
  {
    id: 'forge_symbiosis',
    name: 'Mutualist Pact',
    category: 'stewardship',
    icon: 'Handshake',
    description: 'Establish a lifelong symbiotic bond between two communities, enabling energy sharing and shared stardust.',
    cursorColor: '#38bdf8',
    defaultBrushRadius: 50,
  },
  {
    id: 'nurture_all',
    name: 'Vitality Blessing',
    category: 'stewardship',
    icon: 'Heart',
    description: 'Shower restorative grace: Heals membranes, replenishes ATP energy, and boosts bioluminescent vitality.',
    cursorColor: '#f43f5e',
    defaultBrushRadius: 60,
  },
  {
    id: 'shepherd_current',
    name: 'Shepherd Current',
    category: 'stewardship',
    icon: 'Compass',
    description: 'Direct a gentle hydro-current to guide and gather wandering protozoa toward safe basking havens.',
    cursorColor: '#06b6d4',
    defaultBrushRadius: 55,
  },
  {
    id: 'sanctuary_dome',
    name: 'Sanctuary Field',
    category: 'stewardship',
    icon: 'ShieldCheck',
    description: 'Create a serene sanctuary dome that protects all creatures within from osmotic stress and turbulence.',
    cursorColor: '#6366f1',
    defaultBrushRadius: 70,
  },
  {
    id: 'purify_waters',
    name: 'Purifying Dew',
    category: 'stewardship',
    icon: 'Sparkles',
    description: 'Dispel all harsh chemicals, waste, and irritants, leaving pure crystal-clear oxygenated water.',
    cursorColor: '#34d399',
    defaultBrushRadius: 65,
  },
  {
    id: 'ledger_of_realms',
    name: 'Community Ledger',
    category: 'stewardship',
    icon: 'Scroll',
    description: 'Inspect the Sanctuary Ledger of Clades: Review populations, mutualist bonds, and harmony levels.',
    cursorColor: '#8b5cf6',
    defaultBrushRadius: 15,
  },

  // 2. DIVINE MIRACLES & NURTURING (WorldBox Inspired Creative Stewardship)
  {
    id: 'god_hand_magnet',
    name: 'Divine Hand',
    category: 'miracles',
    icon: 'Hand',
    description: 'Gently pick up, carry, and place any organism across the cosmos with god-like precision.',
    cursorColor: '#38bdf8',
    defaultBrushRadius: 35,
  },
  {
    id: 'starlight_dew',
    name: 'Starlight Dew',
    category: 'miracles',
    icon: 'Sparkles',
    description: 'Drop luminous beads of cosmic starlight mana that feed and awaken dormant cellular organelles.',
    cursorColor: '#eab308',
    defaultBrushRadius: 40,
  },
  {
    id: 'divine_light',
    name: 'Celestial Sunbeam',
    category: 'miracles',
    icon: 'Sun',
    description: 'Beam down pure sunlight where Euglena and symbiotic algae can photosynthesize rich sugar stardust.',
    cursorColor: '#fbbf24',
    defaultBrushRadius: 60,
  },
  {
    id: 'divine_shield',
    name: 'Bubble Shield',
    category: 'miracles',
    icon: 'Shield',
    description: 'Envelop specimens in an iridescent protective bubble shield that buffers impacts and stress.',
    cursorColor: '#60a5fa',
    defaultBrushRadius: 30,
  },
  {
    id: 'hermes_coffee',
    name: 'Hermes Nectar',
    category: 'miracles',
    icon: 'Coffee',
    description: 'A gentle energizing elixir providing swift, graceful swimming motility and agile cilia rotation.',
    cursorColor: '#d97706',
    defaultBrushRadius: 35,
  },
  {
    id: 'hero_inspiration',
    name: 'Sanctuary Guide',
    category: 'miracles',
    icon: 'Award',
    description: 'Honor an elder specimen as a gentle Community Guide, granting a celestial laurel and increased longevity.',
    cursorColor: '#f59e0b',
    defaultBrushRadius: 25,
  },
  {
    id: 'divine_eraser',
    name: 'Gentle Eraser',
    category: 'miracles',
    icon: 'Eraser',
    description: 'Smoothly clear away debris, obstacles, or excess nutrients without harming living creatures.',
    cursorColor: '#94a3b8',
    defaultBrushRadius: 35,
  },

  // 3. COSMIC LIFE (Sanctuary Inhabitants of the Paramecia Universe)
  {
    id: 'spawn_paramecium',
    name: 'Primal Paramecium',
    category: 'cosmic_life',
    icon: 'Fish',
    description: 'The beloved ciliate of the Paramecia cosmos: Slipper-shaped, thousands of coordinated beating cilia.',
    cursorColor: '#38bdf8',
    defaultBrushRadius: 20,
  },
  {
    id: 'spawn_amoeba',
    name: 'Astral Amoeba',
    category: 'cosmic_life',
    icon: 'Cloud',
    description: 'Gentle cosmic silt-gardeners crawling via pseudopodia, recycling sediment into pure minerals.',
    cursorColor: '#c084fc',
    defaultBrushRadius: 25,
  },
  {
    id: 'spawn_didinium',
    name: 'Didinium Glider',
    category: 'cosmic_life',
    icon: 'Feather',
    description: 'Aerodynamic hydro-acrobats gliding across currents, aerating water and dispersing spores.',
    cursorColor: '#f43f5e',
    defaultBrushRadius: 20,
  },
  {
    id: 'spawn_stentor',
    name: 'Stentor Sanctuary',
    category: 'cosmic_life',
    icon: 'Radio',
    description: 'Colossal trumpet ciliates acting as tranquil anchors, stabilizing currents and sheltering smaller companions.',
    cursorColor: '#06b6d4',
    defaultBrushRadius: 30,
  },
  {
    id: 'spawn_euglena',
    name: 'Solar Euglena',
    category: 'cosmic_life',
    icon: 'Sun',
    description: 'Emerald flagellates with whip flagella and red eyespots, photosynthesizing light into oxygen.',
    cursorColor: '#22c55e',
    defaultBrushRadius: 18,
  },
  {
    id: 'spawn_rotifer',
    name: 'Rotifer Guardian',
    category: 'cosmic_life',
    icon: 'Disc',
    description: 'Multi-cellular filter-feeders wielding twin spinning ciliary wheels that purify cosmic water.',
    cursorColor: '#eab308',
    defaultBrushRadius: 35,
  },
  {
    id: 'spawn_bacterium',
    name: 'Probiotic Bacilli',
    category: 'cosmic_life',
    icon: 'Sparkles',
    description: 'Beneficial micro-bacteria swarms forming the nutritious primary base of the ecosystem.',
    cursorColor: '#84cc16',
    defaultBrushRadius: 30,
  },
  {
    id: 'spawn_phage',
    name: 'Symbiotic Phage',
    category: 'cosmic_life',
    icon: 'Bug',
    description: 'Microscopic catalysts that gently regulate bacterial colonies and release organic amino droplets.',
    cursorColor: '#ec4899',
    defaultBrushRadius: 20,
  },

  // 4. COSMIC WATERS & ELEMENTS
  {
    id: 'drop_glucose',
    name: 'Stardust Nectar',
    category: 'elements',
    icon: 'Droplet',
    description: 'Shower sweet energizing glucose drops and minerals to nourish young protozoan colonies.',
    cursorColor: '#34d399',
    defaultBrushRadius: 40,
  },
  {
    id: 'drop_detritus',
    name: 'Organic Minerals',
    category: 'elements',
    icon: 'Layers',
    description: 'Scatter flakes of healthy organic sediment for benthic grazers and amoeba caretakers.',
    cursorColor: '#a16207',
    defaultBrushRadius: 35,
  },
  {
    id: 'env_light_spot',
    name: 'Focus Sunspot',
    category: 'elements',
    icon: 'Sun',
    description: 'Reposition the primary cosmic illuminator, attracting photosynthesizers to bathe in warm rays.',
    cursorColor: '#fde047',
    defaultBrushRadius: 70,
  },
  {
    id: 'env_algae_rock',
    name: 'Micro-Reef Shelter',
    category: 'elements',
    icon: 'Box',
    description: 'Place a peaceful algae-covered shelter where organisms can safely rest against water currents.',
    cursorColor: '#6b7280',
    defaultBrushRadius: 30,
  },
  {
    id: 'env_heat_thermal',
    name: 'Thermal Hydro-Vent',
    category: 'elements',
    icon: 'Flame',
    description: 'A gentle plume of geothermal warmth invigorating dormant cells and promoting metabolism.',
    cursorColor: '#f87171',
    defaultBrushRadius: 45,
  },
  {
    id: 'env_cryo_freeze',
    name: 'Crisp Cool Spring',
    category: 'elements',
    icon: 'Snowflake',
    description: 'Release a refreshing stream of cool water, calming rapid motion and soothing heated sectors.',
    cursorColor: '#93c5fd',
    defaultBrushRadius: 45,
  },
  {
    id: 'pipette_suction',
    name: 'Gentle Pipette',
    category: 'elements',
    icon: 'Pipette',
    description: 'Use delicate suction to sample or relocate water droplets and organisms without harm.',
    cursorColor: '#60a5fa',
    defaultBrushRadius: 30,
  },

  // 5. INSPECTION & SANCTUARY LAWS
  {
    id: 'inspect_organism',
    name: 'Cellular Codex',
    category: 'inspect',
    icon: 'Search',
    description: 'Inspect any creature: Examine vacuoles, cilia, generation, ATP energy, and splice traits.',
    cursorColor: '#6366f1',
    defaultBrushRadius: 15,
  },
  {
    id: 'open_world_laws',
    name: 'Sanctuary Statutes',
    category: 'inspect',
    icon: 'BookOpen',
    description: 'Review and toggle fundamental statutes: Nourishment, Symbiosis, Renewal, and Stardust Blooms.',
    cursorColor: '#a855f7',
    defaultBrushRadius: 15,
  },
  {
    id: 'open_seed_forge',
    name: 'Universe Seed Forge',
    category: 'inspect',
    icon: 'Sparkles',
    description: 'Explore the Paramecia starter seed or forge new fantasy homebrew sanctuaries with custom seeds!',
    cursorColor: '#38bdf8',
    defaultBrushRadius: 15,
  },
];

// FANTASY HOMEBREW UNIVERSE SEEDS (Focused on Stewardship & Lore)
export const UNIVERSE_SEEDS: Record<string, UniverseSeedInfo> = {
  Paramecia: {
    seed: 'Paramecia',
    name: 'The Primordial Paramecia Sanctuary',
    tagline: 'The canonical homebrew starter seed of the Paramecia cosmos',
    description:
      'The sacred genesis haven where the founding Paramecia ciliate clades live in harmonious symbiosis with solar Euglena, gentle Amoeba silt-gardeners, and Stentor anchors around the crystal Genesis Spring.',
  },
  Aetheria: {
    seed: 'Aetheria',
    name: 'The Nebular Stardust Ocean',
    tagline: 'Vast astral currents of radiant photosynthetic harmony',
    description:
      'A serene cosmic ocean bathed in perpetual warm light rays where the Emerald Euglenid Sol-Guild thrives in tranquil communion with giant trumpet Stentors.',
  },
  HarmonicBasin: {
    seed: 'HarmonicBasin',
    name: 'The Confluence of Six Clades',
    tagline: 'All six micro-communities swimming in mutualist balance',
    description:
      'A balanced aquatic paradise where all six microbial communities swim together in deep mutual aid, sharing energy and maintaining pristine water clarity.',
  },
  SolarGrove: {
    seed: 'SolarGrove',
    name: 'The Photosynthetic Sol-Garden',
    tagline: 'Sunlit hydro-gardens where symbiotic micro-flora flourish',
    description:
      'Sun-drenched crystal waters filled with blooming zoochlorellae algae, spinning rotifers, and green Euglena colonies generating sweet stardust nectar.',
  },
  CrystalHaven: {
    seed: 'CrystalHaven',
    name: 'The Glacial Spring of Clarity',
    tagline: 'Chilled crystalline currents of gentle serenity',
    description:
      'Pure, tranquil spring waters where ancient rotifer guardians and Paramecia glide smoothly through serene, filtered currents.',
  },
  BlankVoid: {
    seed: 'BlankVoid',
    name: 'The Primordial Cradle',
    tagline: 'Untouched pure water awaiting your stewardship touch',
    description:
      'A silent, pristine sanctuary ready for your caring hand to introduce stardust, cultivate bacteria, and nurture thriving microbial clades.',
  },
};

export interface BiomeConfig {
  id: BiomeType;
  name: string;
  tagline: string;
  temperature: number;
  pH: number;
  salinity: number;
  waterTint: string;
  gridLineColor: string;
  particleTint: string;
  description: string;
}

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  pond_drop: {
    id: 'pond_drop',
    name: 'The Genesis Spring (Paramecia)',
    tagline: 'Primordial haven radiating with mana vacuoles',
    temperature: 21,
    pH: 7.2,
    salinity: 0.5,
    waterTint: 'rgba(6, 78, 59, 0.08)',
    gridLineColor: 'rgba(52, 211, 153, 0.12)',
    particleTint: '#34d399',
    description: 'The canonical starter seed of the Paramecia fantasy universe, pulsating with tranquil celestial vitality.',
  },
  nutrient_agar: {
    id: 'nutrient_agar',
    name: 'Stardust Nebula Garden',
    tagline: 'Rich cosmic dust & gentle nutrient nurseries',
    temperature: 24,
    pH: 7.4,
    salinity: 1.0,
    waterTint: 'rgba(180, 83, 9, 0.07)',
    gridLineColor: 'rgba(245, 158, 11, 0.12)',
    particleTint: '#f59e0b',
    description: 'Nourishing stardust waters fostering abundant growth and peaceful cellular division.',
  },
  thermal_vent: {
    id: 'thermal_vent',
    name: 'Warm Geothermal Basin',
    tagline: 'Comforting heat vents and mineral currents',
    temperature: 32,
    pH: 6.8,
    salinity: 2.5,
    waterTint: 'rgba(153, 27, 27, 0.08)',
    gridLineColor: 'rgba(239, 68, 68, 0.12)',
    particleTint: '#f87171',
    description: 'Gentle warmth accelerating metabolic harmony and encouraging thermophile adaptations.',
  },
  toxic_sludge: {
    id: 'toxic_sludge',
    name: 'Mineral Mire (Reclaimed Sanctuary)',
    tagline: 'Mineral-rich waters being purified by stewards',
    temperature: 19,
    pH: 6.2,
    salinity: 4.0,
    waterTint: 'rgba(126, 34, 206, 0.08)',
    gridLineColor: 'rgba(168, 85, 247, 0.12)',
    particleTint: '#c084fc',
    description: 'A deep mineral pool where resilient amoebae clear silt and restore ecological clarity.',
  },
  deep_brackish: {
    id: 'deep_brackish',
    name: 'Starlight Coral Haven',
    tagline: 'Gentle rhythmic tides and Stentor citadels',
    temperature: 18,
    pH: 7.6,
    salinity: 8.0,
    waterTint: 'rgba(30, 58, 138, 0.08)',
    gridLineColor: 'rgba(96, 165, 250, 0.12)',
    particleTint: '#60a5fa',
    description: 'Vibrant aquatic groves where Paramecia and Stentors construct calm collaborative havens.',
  },
  sterile_dish: {
    id: 'sterile_dish',
    name: 'The Primordial Cradle',
    tagline: 'Clean water awaiting the spark of life',
    temperature: 20,
    pH: 7.0,
    salinity: 0.0,
    waterTint: 'rgba(255, 255, 255, 0.02)',
    gridLineColor: 'rgba(255, 255, 255, 0.08)',
    particleTint: '#e2e8f0',
    description: 'Pure, peaceful water with zero impurities. Ready for you to seed new microbial communities.',
  },
};

export interface WorldPreset {
  id: string;
  name: string;
  seed: string;
  icon: string;
  biome: BiomeType;
  description: string;
  spawns: {
    paramecium: number;
    amoeba: number;
    didinium: number;
    stentor: number;
    euglena: number;
    rotifer: number;
    bacterium: number;
    nutrients: number;
  };
}

export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: 'seed_paramecia',
    name: 'Seed: Paramecia (Genesis Sanctuary)',
    seed: 'Paramecia',
    icon: 'Sparkles',
    biome: 'pond_drop',
    description: 'The canonical fantasy homebrew starter seed: Paramecia, Euglena, Amoeba, and Stentor living in harmonious stewardship.',
    spawns: {
      paramecium: 16,
      amoeba: 4,
      didinium: 2,
      stentor: 2,
      euglena: 10,
      rotifer: 1,
      bacterium: 35,
      nutrients: 50,
    },
  },
  {
    id: 'seed_aetheria',
    name: 'Seed: Aetheria (Nebular Ocean)',
    seed: 'Aetheria',
    icon: 'Sun',
    biome: 'nutrient_agar',
    description: 'A radiant stardust ocean where peaceful Euglena bask in solar rays alongside giant trumpet Stentor Megaliths.',
    spawns: {
      paramecium: 12,
      amoeba: 3,
      didinium: 1,
      stentor: 4,
      euglena: 16,
      rotifer: 1,
      bacterium: 45,
      nutrients: 60,
    },
  },
  {
    id: 'seed_harmonic',
    name: 'Seed: HarmonicBasin (Mutualist Confluence)',
    seed: 'HarmonicBasin',
    icon: 'Heart',
    biome: 'deep_brackish',
    description: 'All six microbial communities flourishing together in mutualist harmony and symbiotic energy exchange.',
    spawns: {
      paramecium: 18,
      amoeba: 5,
      didinium: 3,
      stentor: 3,
      euglena: 12,
      rotifer: 2,
      bacterium: 50,
      nutrients: 65,
    },
  },
  {
    id: 'seed_solargrove',
    name: 'Seed: SolarGrove (Sunlit Sanctuary)',
    seed: 'SolarGrove',
    icon: 'Sun',
    biome: 'pond_drop',
    description: 'Abundant sun-drenched waters with thriving chloroplast blooms and swimming rotifers clarifying the stream.',
    spawns: {
      paramecium: 14,
      amoeba: 2,
      didinium: 2,
      stentor: 2,
      euglena: 22,
      rotifer: 2,
      bacterium: 45,
      nutrients: 55,
    },
  },
  {
    id: 'seed_crystal',
    name: 'Seed: CrystalHaven (Glacial Spring)',
    seed: 'CrystalHaven',
    icon: 'Snowflake',
    biome: 'sterile_dish',
    description: 'Serene, crystalline waters where ancient rotifer guardians filter gentle currents for gliding ciliates.',
    spawns: {
      paramecium: 15,
      amoeba: 4,
      didinium: 2,
      stentor: 3,
      euglena: 8,
      rotifer: 3,
      bacterium: 40,
      nutrients: 45,
    },
  },
  {
    id: 'seed_blank',
    name: 'Seed: BlankVoid (The Cradle)',
    seed: 'BlankVoid',
    icon: 'PlusCircle',
    biome: 'sterile_dish',
    description: 'An untouched vacuum of peaceful water. Seed stardust, cultivate bacteria, and nurture life from scratch.',
    spawns: {
      paramecium: 0,
      amoeba: 0,
      didinium: 0,
      stentor: 0,
      euglena: 0,
      rotifer: 0,
      bacterium: 0,
      nutrients: 0,
    },
  },
];


