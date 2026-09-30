export type SpeciesType =
  | 'paramecium'
  | 'amoeba'
  | 'didinium'
  | 'stentor'
  | 'euglena'
  | 'rotifer'
  | 'bacterium'
  | 'phage';

export interface MicrobeTrait {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  speedMod: number; // multiplier, e.g. 1.2
  healthMod: number;
  sizeMod: number;
  divisionMod: number; // lower means splits sooner
  energyEfficiency: number;
  isPhotosynthetic?: boolean;
  isSymbiotic?: boolean;
  isRadiationResistant?: boolean;
  isSwarmLeader?: boolean;
}

export interface OrganismVacuole {
  x: number;
  y: number;
  radius: number;
  phase: number;
  type: 'food' | 'contractile' | 'waste';
}

export interface Pseudopod {
  angle: number;
  targetAngle: number;
  length: number;
  targetLength: number;
  speed: number;
}

export interface Organism {
  id: string;
  name: string;
  species: SpeciesType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  targetAngle: number;
  angularVelocity: number;
  size: number;
  baseRadius: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  age: number; // ticks
  generation: number;
  strainId: string;
  strainName: string;
  strainColor: string;
  traits: string[]; // trait ids
  ingestedCount: number;
  symbioticExchanges: number;
  reproductionCooldown: number;
  vacuoles: OrganismVacuole[];
  pseudopods?: Pseudopod[];
  ciliaPhase: number;
  flagellumPhase: number;
  state: 'grazing' | 'basking' | 'communing' | 'dividing' | 'conjugating';
  divisionProgress: number; // 0 to 1
  glowIntensity: number;
  blessed: boolean;
  title?: string;
  isFavorite?: boolean;
  isGuide?: boolean; // honored community guide
  shieldHealth?: number; // bubble shield
  isElectrified?: boolean; // celestial energy aura
  isImmortal?: boolean; // immortal trait from cosmic blessing
  coffeeBoostTicks?: number; // active swimming boost ticks
  symbioticResonance?: number; // glow ring resonance
}

export interface NutrientParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  amount: number;
  type: 'glucose' | 'detritus' | 'mineral' | 'protein';
}

export interface ChemicalZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'antibiotic' | 'peroxide' | 'toxin' | 'heal' | 'uv' | 'vortex' | 'temperature' | 'nutrient_broth';
  intensity: number; // 0 to 1
  duration: number; // remaining ticks
  maxDuration: number;
  color: string;
}

export interface SlideObstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'debris' | 'air_bubble' | 'algae_clump';
}

export type BiomeType =
  | 'pond_drop'
  | 'nutrient_agar'
  | 'thermal_vent'
  | 'toxic_sludge'
  | 'deep_brackish'
  | 'sterile_dish';

export type MicroscopeFilter =
  | 'brightfield'
  | 'darkfield'
  | 'phase_contrast'
  | 'fluorescent';

export type ToolCategory =
  | 'stewardship'
  | 'miracles'
  | 'cosmic_life'
  | 'elements'
  | 'inspect';

export interface GodTool {
  id: string;
  name: string;
  category: ToolCategory;
  icon: string;
  description: string;
  cursorColor: string;
  defaultBrushRadius: number; // in world units
}

export interface ColonyStrain {
  id: string;
  name: string;
  color: string;
  species: SpeciesType;
  population: number;
  generationsPassed: number;
  harmonyScore: number; // 0 to 100
  vitality: number; // 0 to 100
  stewardshipRole: string;
  symbioticWith: string[]; // ids of partner strains in mutual aid
  capitalPos?: { x: number; y: number };
  lore: string;
}

export interface WorldLaws {
  hungerEnabled: boolean;
  agingEnabled: boolean;
  communitySymbiosis: boolean;
  spontaneousMutations: boolean;
  gravitationalDrift: boolean;
  superMitosis: boolean;
  sanctuaryBlessing: boolean;
  starlightNectarBlooms: boolean;
}

export interface BlackHole {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  duration: number; // ticks
  maxDuration: number;
}

export interface CosmicMeteor {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  radius: number;
  progress: number; // 0 to 1
  exploded: boolean;
}

export interface UniverseSeedInfo {
  seed: string;
  name: string;
  tagline: string;
  description: string;
}

export interface WorldEvent {
  id: string;
  timestamp: string;
  text: string;
  type: 'birth' | 'death' | 'mutation' | 'milestone' | 'blessing' | 'symbiosis' | 'realm';
  species?: SpeciesType;
}

export interface SimulationStats {
  population: number;
  totalBacteria: number;
  totalNutrients: number;
  generationLeader: number;
  dominantSpecies: SpeciesType | 'none';
  ecosystemHealth: number; // 0 - 100
  fps: number;
  ticks: number;
  totalSymbioses: number;
  totalCommunities: number;
}
