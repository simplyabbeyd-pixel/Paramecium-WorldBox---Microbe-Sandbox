import {
  SpeciesType,
  Organism,
  NutrientParticle,
  ChemicalZone,
  SlideObstacle,
  BiomeType,
  ColonyStrain,
  WorldEvent,
  SimulationStats,
  WorldLaws,
  BlackHole,
  CosmicMeteor,
} from '../types';
import { SPECIES_CONFIGS, ALL_TRAITS } from '../data/speciesAndTraits';
import { BIOME_CONFIGS, WORLD_PRESETS } from '../data/godPowersAndBiomes';
import { soundEngine } from '../audio/soundEffects';

export interface ViewportState {
  x: number; // center x
  y: number; // center y
  zoom: number; // 0.5 to 4.0
}

export class SimulationEngine {
  public width: number = 1800;
  public height: number = 1200;
  public slideRadius: number = 700; // circular universe boundary

  public universeSeed: string = 'Paramecia';
  public worldLaws: WorldLaws = {
    hungerEnabled: true,
    agingEnabled: true,
    communitySymbiosis: true,
    spontaneousMutations: true,
    gravitationalDrift: true,
    superMitosis: false,
    sanctuaryBlessing: true,
    starlightNectarBlooms: true,
  };

  public organisms: Organism[] = [];
  public nutrients: NutrientParticle[] = [];
  public chemicals: ChemicalZone[] = [];
  public obstacles: SlideObstacle[] = [];
  public strains: Map<string, ColonyStrain> = new Map();
  public events: WorldEvent[] = [];

  public blackHoles: BlackHole[] = [];
  public meteors: CosmicMeteor[] = [];
  public snapFlash: number = 0; // for Coin of Fate flash animation

  // Divine Magnet / God Hand state
  public isDraggingEntity: boolean = false;
  public draggedEntityId: string | null = null;

  public biome: BiomeType = 'pond_drop';
  public lightSpot: { x: number; y: number; radius: number; intensity: number } = {
    x: 900,
    y: 600,
    radius: 350,
    intensity: 1.0,
  };

  public isPaused: boolean = false;
  public speedMultiplier: number = 1.0;
  public tickCount: number = 0;
  public selectedOrganismId: string | null = null;
  public followedOrganismId: string | null = null;

  public maxGeneration: number = 1;

  constructor() {
    this.initDefaultStrains();
    this.initObstacles();
    this.generateUniverseFromSeed('Paramecia');
  }

  private initDefaultStrains() {
    const defaultStrains: ColonyStrain[] = [
      {
        id: 'strain_azure',
        name: 'Azure Slipper Sanctuary',
        color: '#38bdf8',
        species: 'paramecium',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 95,
        vitality: 90,
        stewardshipRole: 'Genesis Stewards & Ciliary Swarm',
        symbioticWith: ['strain_emerald', 'strain_cyan'],
        capitalPos: { x: 820, y: 560 },
        lore: 'The primordial founding stewards of the Paramecia cosmos, cultivating nutrient vacuoles and guiding younger protozoa.',
      },
      {
        id: 'strain_emerald',
        name: 'Emerald Sol-Order Weavers',
        color: '#22c55e',
        species: 'euglena',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 98,
        vitality: 95,
        stewardshipRole: 'Solar Mana Weavers & Oxygenators',
        symbioticWith: ['strain_azure'],
        capitalPos: { x: 980, y: 620 },
        lore: 'Photosynthetic caretakers basking in celestial light, weaving glucose stardust and oxygen dew for neighbor clades.',
      },
      {
        id: 'strain_amethyst',
        name: 'Amethyst Silt Gardeners',
        color: '#c084fc',
        species: 'amoeba',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 92,
        vitality: 88,
        stewardshipRole: 'Benthic Silt Recyclers',
        symbioticWith: ['strain_gold'],
        capitalPos: { x: 740, y: 720 },
        lore: 'Gentle creeping astral gardeners who glide across sediment, turning detritus into pure minerals for the whole cosmos.',
      },
      {
        id: 'strain_crimson',
        name: 'Didinia Hydro-Acrobats',
        color: '#f43f5e',
        species: 'didinium',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 88,
        vitality: 92,
        stewardshipRole: 'Vortex Aerators & Spore Scouts',
        symbioticWith: ['strain_azure'],
        capitalPos: { x: 1120, y: 440 },
        lore: 'High-speed aerodynamic spiral gliders that stir hydro-currents, oxygenating deep waters and dispersing healthy spores.',
      },
      {
        id: 'strain_gold',
        name: 'Golden Rotifer Purifiers',
        color: '#facc15',
        species: 'rotifer',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 94,
        vitality: 90,
        stewardshipRole: 'Cosmic Water Clarifiers',
        symbioticWith: ['strain_amethyst'],
        capitalPos: { x: 1040, y: 760 },
        lore: 'Multi-cellular filter caretakers whose rotating twin wheels filter organic particles and keep the slide pristine.',
      },
      {
        id: 'strain_cyan',
        name: 'Azure Stentor Anchors',
        color: '#06b6d4',
        species: 'stentor',
        population: 0,
        generationsPassed: 1,
        harmonyScore: 96,
        vitality: 94,
        stewardshipRole: 'Current Calmers & Sanctuary Beacons',
        symbioticWith: ['strain_azure'],
        capitalPos: { x: 700, y: 460 },
        lore: 'Colossal trumpet ciliates acting as tranquil anchors, stabilizing violent currents and sheltering small companions.',
      },
    ];
    defaultStrains.forEach((s) => this.strains.set(s.id, s));
  }

  private initObstacles() {
    this.obstacles = [
      { id: 'obs_1', x: 650, y: 480, radius: 45, type: 'debris' },
      { id: 'obs_2', x: 1150, y: 720, radius: 55, type: 'debris' },
      { id: 'obs_3', x: 920, y: 350, radius: 35, type: 'algae_clump' },
      { id: 'obs_4', x: 780, y: 880, radius: 40, type: 'algae_clump' },
      { id: 'obs_5', x: 1250, y: 450, radius: 30, type: 'air_bubble' },
    ];
  }

  public logEvent(text: string, type: WorldEvent['type'], species?: SpeciesType) {
    const evt: WorldEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
      type,
      species,
    };
    this.events.unshift(evt);
    if (this.events.length > 60) {
      this.events.pop();
    }
  }

  // GENERATE UNIVERSE DETERMINISTICALLY FROM SEED (PARIS, AETHERIA, VOIDFALL, ETC.)
  public generateUniverseFromSeed(seed: string) {
    this.universeSeed = seed || 'Paramecia';
    this.organisms = [];
    this.nutrients = [];
    this.chemicals = [];
    this.blackHoles = [];
    this.meteors = [];
    this.selectedOrganismId = null;
    this.followedOrganismId = null;
    this.maxGeneration = 1;

    // Reset strain stats
    this.initDefaultStrains();

    const normalizedSeed = seed.trim().toLowerCase();

    if (normalizedSeed === 'blankvoid' || normalizedSeed === 'empty') {
      this.biome = 'sterile_dish';
      this.logEvent(`Seed [${this.universeSeed}]: Pre-creation vacuum initialized. Use god tools to paint life.`, 'milestone');
      return;
    }

    if (normalizedSeed === 'aetheria') {
      this.biome = 'nutrient_agar';
      this.lightSpot = { x: 900, y: 600, radius: 450, intensity: 1.3 };
      for (let i = 0; i < 16; i++) {
        this.spawnOrganism('euglena', 900 + (Math.random() - 0.5) * 500, 600 + (Math.random() - 0.5) * 500, 'strain_emerald');
      }
      for (let i = 0; i < 10; i++) {
        this.spawnOrganism('paramecium', 900 + (Math.random() - 0.5) * 500, 600 + (Math.random() - 0.5) * 500, 'strain_azure');
      }
      for (let i = 0; i < 4; i++) {
        this.spawnOrganism('stentor', 900 + (Math.random() - 0.5) * 400, 600 + (Math.random() - 0.5) * 400, 'strain_cyan');
      }
      this.spawnNutrientCluster(900, 600, 50, 450);
      this.spawnBacteriaSwarm(900, 600, 40, 500);
      this.logEvent(`Seed [Aetheria]: Nebular Stardust Ocean awakened. Sol-Order basks in celestial rays.`, 'realm');
      return;
    }

    if (normalizedSeed === 'voidfall') {
      this.biome = 'deep_brackish';
      for (let i = 0; i < 18; i++) {
        this.spawnOrganism('paramecium', 800 + (Math.random() - 0.5) * 400, 600 + (Math.random() - 0.5) * 400, 'strain_azure');
      }
      for (let i = 0; i < 5; i++) {
        const didi = this.spawnOrganism('didinium', 1100 + (Math.random() - 0.5) * 300, 600 + (Math.random() - 0.5) * 300, 'strain_crimson');
        if (didi && i === 0) {
          didi.isGuide = true;
          didi.title = 'Deep Currents Guide';
          didi.traits.push('sanctuary_guide', 'symbiotic_communion');
          this.applyTraitStats(didi);
        }
      }
      this.spawnNutrientCluster(900, 600, 40, 500);
      this.spawnBacteriaSwarm(900, 600, 40, 450);
      this.forgeSymbiosis('strain_crimson', 'strain_azure');
      this.logEvent(`Seed [Voidfall]: The Abyssal Trench awakened! Didinia and Azure Paramecia joined in symbiosis.`, 'symbiosis');
      return;
    }

    if (normalizedSeed === 'clashofrealms' || normalizedSeed === 'clash' || normalizedSeed === 'conclave') {
      this.biome = 'deep_brackish';
      // 4 clades gathered in harmonic council
      const guides = [
        { species: 'paramecium' as const, strain: 'strain_azure', name: 'Guide Paramecia', x: 720, y: 500 },
        { species: 'amoeba' as const, strain: 'strain_amethyst', name: 'Elder Proteus', x: 720, y: 720 },
        { species: 'didinium' as const, strain: 'strain_crimson', name: 'Glider Zephyr', x: 1080, y: 500 },
        { species: 'rotifer' as const, strain: 'strain_gold', name: 'Clarifier Corona', x: 1080, y: 720 },
      ];
      guides.forEach((k) => {
        const guideOrg = this.spawnOrganism(k.species, k.x, k.y, k.strain);
        if (guideOrg) {
          guideOrg.isGuide = true;
          guideOrg.name = k.name;
          guideOrg.title = `Sanctuary Guide of ${this.strains.get(k.strain)?.name}`;
          guideOrg.traits.push('sanctuary_guide', 'symbiotic_communion', 'immortal');
          this.applyTraitStats(guideOrg);
        }
        for (let j = 0; j < 5; j++) {
          this.spawnOrganism(k.species, k.x + (Math.random() - 0.5) * 120, k.y + (Math.random() - 0.5) * 120, k.strain);
        }
      });
      this.spawnNutrientCluster(900, 600, 50, 400);
      this.spawnBacteriaSwarm(900, 600, 45, 450);
      this.forgeSymbiosis('strain_azure', 'strain_crimson');
      this.forgeSymbiosis('strain_amethyst', 'strain_gold');
      this.forgeSymbiosis('strain_azure', 'strain_amethyst');
      this.logEvent(`Seed [ConclaveOfRealms]: Four Celestial Clades united in the Grand Symbiotic Covenant!`, 'symbiosis');
      return;
    }

    if (normalizedSeed === 'supernova99' || normalizedSeed === 'supernova') {
      this.biome = 'thermal_vent';
      for (let i = 0; i < 12; i++) {
        const org = this.spawnOrganism('paramecium', 900 + (Math.random() - 0.5) * 500, 600 + (Math.random() - 0.5) * 500, 'strain_azure');
        if (org && !org.traits.includes('extremophile_heat')) {
          org.traits.push('extremophile_heat', 'electrified');
          this.applyTraitStats(org);
        }
      }
      for (let i = 0; i < 8; i++) {
        const org = this.spawnOrganism('amoeba', 900 + (Math.random() - 0.5) * 500, 600 + (Math.random() - 0.5) * 500, 'strain_amethyst');
        if (org && !org.traits.includes('extremophile_heat')) {
          org.traits.push('extremophile_heat', 'hypertrophic_giant');
          this.applyTraitStats(org);
        }
      }
      this.spawnNutrientCluster(900, 600, 60, 500);
      this.spawnBacteriaSwarm(900, 600, 50, 500);
      this.logEvent(`Seed [Supernova99]: Thermal Plasma Sanctuary activated. Heat-thriving mutualists flourish!`, 'milestone');
      return;
    }

    // THE CANONICAL STARTER SEED: "PARAMECIA" (The User's Fantasy Homebrew Cosmos)
    this.biome = 'pond_drop';
    this.universeSeed = 'Paramecia';

    // 1. Honor the Firstborn Sanctuary Guide of Paramecia: Paramecia Prime
    const firstborn = this.spawnOrganism('paramecium', 840, 580, 'strain_azure', undefined, 1);
    if (firstborn) {
      firstborn.name = 'Paramecia Prime';
      firstborn.title = 'Elder Sanctuary Guide of Paramecia';
      firstborn.isGuide = true;
      firstborn.isFavorite = true;
      firstborn.blessed = true;
      firstborn.traits.push('sanctuary_guide', 'immortal', 'symbiotic_communion');
      this.applyTraitStats(firstborn);
    }

    // 2. Spawn the companion populace of the Azure Slipper Sanctuary
    for (let i = 0; i < 15; i++) {
      this.spawnOrganism('paramecium', 820 + (Math.random() - 0.5) * 350, 580 + (Math.random() - 0.5) * 350, 'strain_azure');
    }

    // 3. The Peaceful Emerald Sol-Order
    for (let i = 0; i < 8; i++) {
      this.spawnOrganism('euglena', 960 + (Math.random() - 0.5) * 300, 620 + (Math.random() - 0.5) * 300, 'strain_emerald');
    }

    // 4. Astral Amoeba Silt Gardeners
    for (let i = 0; i < 4; i++) {
      this.spawnOrganism('amoeba', 740 + (Math.random() - 0.5) * 300, 720 + (Math.random() - 0.5) * 300, 'strain_amethyst');
    }

    // 5. Azure Stentor Megalith Sanctuary Anchor
    for (let i = 0; i < 2; i++) {
      this.spawnOrganism('stentor', 680 + (Math.random() - 0.5) * 200, 480 + (Math.random() - 0.5) * 200, 'strain_cyan');
    }

    // 6. Didinia Hydro-Acrobat Spore Scout
    this.spawnOrganism('didinium', 1150, 460, 'strain_crimson');

    // 7. Golden Rotifer Purifier
    this.spawnOrganism('rotifer', 1060, 740, 'strain_gold');

    // 8. Genesis Core Stardust & Bacilli Swarm
    this.spawnBacteriaSwarm(900, 600, 40, 500);
    this.spawnNutrientCluster(900, 600, 55, 520);

    this.logEvent(`Genesis Seed [Paramecia] ignited! Elder Sanctuary Guide Paramecia Prime welcomes the cosmos.`, 'symbiosis', 'paramecium');
  }

  public loadPreset(presetId: string) {
    const preset = WORLD_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      this.generateUniverseFromSeed(preset.seed);
    } else {
      this.generateUniverseFromSeed(presetId);
    }
  }

  public spawnOrganism(
    species: SpeciesType,
    x: number,
    y: number,
    strainId?: string,
    inheritedTraits?: string[],
    generation: number = 1
  ): Organism | null {
    const config = SPECIES_CONFIGS[species];
    if (!config) return null;

    const validStrainId =
      strainId ||
      (species === 'paramecium'
        ? 'strain_azure'
        : species === 'amoeba'
        ? 'strain_amethyst'
        : species === 'didinium'
        ? 'strain_crimson'
        : species === 'euglena'
        ? 'strain_emerald'
        : species === 'rotifer'
        ? 'strain_gold'
        : 'strain_cyan');

    const strain = this.strains.get(validStrainId);
    const strainColor = strain ? strain.color : config.color;
    const strainName = strain ? strain.name : config.name;

    const angle = Math.random() * Math.PI * 2;
    const traits = inheritedTraits ? [...inheritedTraits] : [...config.defaultTraits];

    const vacuoles = [
      { x: -config.baseRadius * 0.4, y: 0, radius: config.baseRadius * 0.28, phase: Math.random(), type: 'contractile' as const },
      { x: config.baseRadius * 0.4, y: 0, radius: config.baseRadius * 0.26, phase: Math.random(), type: 'contractile' as const },
      { x: 0, y: config.baseRadius * 0.2, radius: config.baseRadius * 0.2, phase: Math.random(), type: 'food' as const },
    ];

    const pseudopods =
      species === 'amoeba'
        ? [
            { angle: 0, targetAngle: 0.2, length: 18, targetLength: 24, speed: 0.05 },
            { angle: 1.2, targetAngle: 1.4, length: 22, targetLength: 16, speed: 0.06 },
            { angle: 2.5, targetAngle: 2.3, length: 15, targetLength: 26, speed: 0.04 },
            { angle: 4.0, targetAngle: 3.8, length: 20, targetLength: 18, speed: 0.05 },
            { angle: 5.2, targetAngle: 5.4, length: 16, targetLength: 22, speed: 0.06 },
          ]
        : undefined;

    const org: Organism = {
      id: 'org_' + Math.random().toString(36).substring(2, 9),
      name: `${config.name} #${Math.floor(Math.random() * 900) + 100}`,
      species,
      x,
      y,
      vx: (Math.random() - 0.5) * config.baseSpeed,
      vy: (Math.random() - 0.5) * config.baseSpeed,
      angle,
      targetAngle: angle,
      angularVelocity: 0,
      size: 1.0,
      baseRadius: config.baseRadius,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      energy: config.maxEnergy * 0.75,
      maxEnergy: config.maxEnergy,
      age: 0,
      generation,
      strainId: validStrainId,
      strainName,
      strainColor,
      traits,
      ingestedCount: 0,
      symbioticExchanges: 0,
      reproductionCooldown: Math.floor(config.reproductionCooldownTicks * (0.6 + Math.random() * 0.4)),
      vacuoles,
      pseudopods,
      ciliaPhase: Math.random() * Math.PI * 2,
      flagellumPhase: Math.random() * Math.PI * 2,
      state: 'grazing',
      divisionProgress: 0,
      glowIntensity: 0,
      blessed: false,
      isGuide: false,
      symbioticResonance: 0,
    };

    this.applyTraitStats(org);
    this.organisms.push(org);

    if (strain) {
      strain.population++;
    }
    if (generation > this.maxGeneration) {
      this.maxGeneration = generation;
    }

    return org;
  }

  public applyTraitStats(org: Organism) {
    const config = SPECIES_CONFIGS[org.species];
    if (!config) return;

    let healthMult = 1.0;
    let sizeMult = 1.0;

    org.traits.forEach((traitId) => {
      const trait = ALL_TRAITS[traitId];
      if (trait) {
        healthMult *= trait.healthMod;
        sizeMult *= trait.sizeMod;
      }
    });

    if (org.isGuide || org.traits.includes('sanctuary_guide')) {
      healthMult *= 1.4;
      sizeMult *= 1.15;
    }
    if (org.blessed) {
      healthMult *= 1.5;
      sizeMult *= 1.15;
    }

    org.maxHealth = Math.round(config.maxHealth * healthMult);
    org.size = sizeMult;
  }

  public spawnNutrientCluster(cx: number, cy: number, count: number, spread: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * spread;
      this.nutrients.push({
        id: 'nut_' + Math.random().toString(36).substring(2, 9),
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        amount: 14 + Math.random() * 12,
        type: 'glucose',
      });
    }
  }

  public spawnBacteriaSwarm(cx: number, cy: number, count: number, spread: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * spread;
      this.spawnOrganism('bacterium', cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
    }
  }

  public update(dt: number) {
    if (this.isPaused) return;

    const actualDt = Math.min(dt * this.speedMultiplier, 3.0);
    this.tickCount++;

    if (this.snapFlash > 0) {
      this.snapFlash = Math.max(0, this.snapFlash - actualDt * 0.05);
    }

    this.updateBlackHoles(actualDt);
    this.updateMeteors(actualDt);
    this.updateChemicals(actualDt);
    this.updateNutrients(actualDt);
    this.updateOrganisms(actualDt);

    // Occasional starlight nectar bloom if World Law enabled
    if (this.worldLaws.starlightNectarBlooms && this.tickCount % 400 === 0 && Math.random() < 0.35) {
      this.triggerStarlightNectarBloom();
    }
  }

  private updateBlackHoles(dt: number) {
    for (let i = this.blackHoles.length - 1; i >= 0; i--) {
      const bh = this.blackHoles[i];
      bh.duration -= dt;

      // Gravitational pull on organisms
      const pullRadius = bh.radius * 3.5;
      for (let j = this.organisms.length - 1; j >= 0; j--) {
        const org = this.organisms[j];
        const dx = bh.x - org.x;
        const dy = bh.y - org.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < pullRadius * pullRadius && distSq > 10) {
          const dist = Math.sqrt(distSq);
          const force = (bh.mass / Math.max(80, distSq)) * 85 * dt;
          org.vx += (dx / dist) * force + (-dy / dist) * (force * 0.4);
          org.vy += (dy / dist) * force + (dx / dist) * (force * 0.4);

          // Event horizon swallowing
          if (dist < bh.radius * 0.45) {
            bh.mass += 8;
            bh.radius = Math.min(100, bh.radius + 0.8);
            this.killOrganism(j);
            soundEngine.playBubblePop(220);
          }
        }
      }

      // Gravitational pull on nutrients
      for (let j = this.nutrients.length - 1; j >= 0; j--) {
        const nut = this.nutrients[j];
        const dx = bh.x - nut.x;
        const dy = bh.y - nut.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < pullRadius * pullRadius && distSq > 10) {
          const dist = Math.sqrt(distSq);
          const force = (bh.mass / Math.max(60, distSq)) * 95 * dt;
          nut.vx += (dx / dist) * force;
          nut.vy += (dy / dist) * force;
          if (dist < bh.radius * 0.45) {
            bh.mass += 2;
            this.nutrients.splice(j, 1);
          }
        }
      }

      if (bh.duration <= 0) {
        this.blackHoles.splice(i, 1);
        this.logEvent('Black hole singularity collapsed peacefully.', 'milestone');
      }
    }
  }

  private updateMeteors(dt: number) {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.progress += 0.05 * dt;
      m.x = m.startX + (m.targetX - m.startX) * m.progress;
      m.y = m.startY + (m.targetY - m.startY) * m.progress;

      if (m.progress >= 1 && !m.exploded) {
        m.exploded = true;
        // Detonation crater & shockwave
        this.chemicals.push({
          id: 'chem_' + Math.random().toString(36).substring(2, 9),
          x: m.targetX,
          y: m.targetY,
          radius: m.radius * 2.2,
          type: 'peroxide',
          intensity: 1.4,
          duration: 90,
          maxDuration: 90,
          color: 'rgba(249, 115, 22, 0.60)',
        });
        soundEngine.playSquish();

        // Damage & fling nearby organisms
        let casualties = 0;
        for (let j = this.organisms.length - 1; j >= 0; j--) {
          const org = this.organisms[j];
          const dist = Math.hypot(org.x - m.targetX, org.y - m.targetY);
          if (dist < m.radius * 2.0) {
            if (org.shieldHealth && org.shieldHealth > 0) {
              org.shieldHealth -= 80;
            } else {
              org.health -= 130;
              casualties++;
              if (org.health <= 0) {
                this.killOrganism(j);
              }
            }
          }
        }
        this.logEvent(`Supernova Meteor crashed at coordinates (${Math.round(m.targetX)}, ${Math.round(m.targetY)})!`, 'milestone');
        this.meteors.splice(i, 1);
      }
    }
  }

  private triggerRandomCosmicEvent() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (this.slideRadius - 100);
    const tx = 900 + Math.cos(angle) * dist;
    const ty = 600 + Math.sin(angle) * dist;

    const r = Math.random();
    if (r < 0.5) {
      // Meteor
      this.meteors.push({
        id: 'meteor_' + Math.random().toString(36).substring(2, 9),
        startX: tx - 300,
        startY: ty - 400,
        targetX: tx,
        targetY: ty,
        x: tx - 300,
        y: ty - 400,
        radius: 40,
        progress: 0,
        exploded: false,
      });
      soundEngine.playLaserHum();
    } else {
      // Solar flare eruption
      this.chemicals.push({
        id: 'chem_' + Math.random().toString(36).substring(2, 9),
        x: tx,
        y: ty,
        radius: 70,
        type: 'uv',
        intensity: 1.2,
        duration: 120,
        maxDuration: 120,
        color: 'rgba(245, 158, 11, 0.5)',
      });
      soundEngine.playChemicalFizz();
      this.logEvent('Solar flare eruption swept through the sector!', 'milestone');
    }
  }

  private updateChemicals(dt: number) {
    for (let i = this.chemicals.length - 1; i >= 0; i--) {
      const chem = this.chemicals[i];
      chem.duration -= dt;

      if (chem.type === 'vortex') {
        const pullRadius = chem.radius * 2.2;
        this.organisms.forEach((org) => {
          const dx = chem.x - org.x;
          const dy = chem.y - org.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < pullRadius * pullRadius && distSq > 10) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / pullRadius) * 4.5 * chem.intensity;
            org.vx += (dx / dist) * force + (-dy / dist) * force * 1.5;
            org.vy += (dy / dist) * force + (dx / dist) * force * 1.5;
          }
        });
        this.nutrients.forEach((nut) => {
          const dx = chem.x - nut.x;
          const dy = chem.y - nut.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < pullRadius * pullRadius && distSq > 10) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / pullRadius) * 5 * chem.intensity;
            nut.vx += (dx / dist) * force + (-dy / dist) * force * 2;
            nut.vy += (dy / dist) * force + (dx / dist) * force * 2;
          }
        });
      }

      if (chem.duration <= 0) {
        this.chemicals.splice(i, 1);
      }
    }
  }

  private updateNutrients(dt: number) {
    for (let i = this.nutrients.length - 1; i >= 0; i--) {
      const nut = this.nutrients[i];
      nut.x += nut.vx * dt;
      nut.y += nut.vy * dt;
      nut.vx *= 0.98;
      nut.vy *= 0.98;

      const dx = nut.x - 900;
      const dy = nut.y - 600;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > this.slideRadius) {
        nut.x = 900 + (dx / dist) * (this.slideRadius - 5);
        nut.y = 600 + (dy / dist) * (this.slideRadius - 5);
        nut.vx *= -0.5;
        nut.vy *= -0.5;
      }
    }

    // Passive stardust regeneration
    if (this.tickCount % 80 === 0 && this.nutrients.length < 90) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (this.slideRadius - 60);
      this.nutrients.push({
        id: 'nut_' + Math.random().toString(36).substring(2, 9),
        x: 900 + Math.cos(angle) * dist,
        y: 600 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        amount: 12 + Math.random() * 8,
        type: 'glucose',
      });
    }
  }

  private updateOrganisms(dt: number) {
    const biomeConfig = BIOME_CONFIGS[this.biome];
    const tempEffect = (biomeConfig.temperature - 20) * 0.02;

    for (let i = this.organisms.length - 1; i >= 0; i--) {
      const org = this.organisms[i];
      org.age += dt;
      org.ciliaPhase += 0.25 * dt;
      org.flagellumPhase += 0.3 * dt;

      // Hermes coffee boost decay
      if (org.coffeeBoostTicks && org.coffeeBoostTicks > 0) {
        org.coffeeBoostTicks -= dt;
        if (org.coffeeBoostTicks <= 0) {
          const cIdx = org.traits.indexOf('hermes_haste');
          if (cIdx !== -1) org.traits.splice(cIdx, 1);
        }
      }

      // 1. ENERGY & STARVATION (World Law: hungerEnabled)
      if (this.worldLaws.hungerEnabled && !org.isImmortal) {
        let energyBurnRate = 0.045 + Math.max(0, tempEffect * 0.03);
        if (org.species === 'bacterium') energyBurnRate = 0.015;
        if (org.species === 'phage') energyBurnRate = 0.02;

        org.traits.forEach((tId) => {
          const t = ALL_TRAITS[tId];
          if (t) energyBurnRate /= t.energyEfficiency;
        });

        // Photosynthesis
        if (org.traits.includes('photosynthesis') || org.traits.includes('zoochlorellae_symbiont')) {
          const ldx = org.x - this.lightSpot.x;
          const ldy = org.y - this.lightSpot.y;
          const distToLight = Math.sqrt(ldx * ldx + ldy * ldy);
          if (distToLight < this.lightSpot.radius) {
            const lightIntensity = (1 - distToLight / this.lightSpot.radius) * this.lightSpot.intensity;
            org.energy = Math.min(org.maxEnergy, org.energy + lightIntensity * 0.16 * dt);
          }
        }

        org.energy -= energyBurnRate * dt;

        if (org.energy <= 0) {
          org.health -= 0.14 * dt;
        }
      }

      // 2. AGING & MORTALITY (World Law: agingEnabled)
      if (this.worldLaws.agingEnabled && !org.isImmortal && org.age > 4500) {
        org.health -= 0.1 * dt;
      }

      // 3. CHEMICAL EXPOSURE
      this.chemicals.forEach((chem) => {
        const cdx = org.x - chem.x;
        const cdy = org.y - chem.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < chem.radius) {
          const intensity = (1 - cdist / chem.radius) * chem.intensity;
          if (chem.type === 'antibiotic') {
            if (org.species === 'bacterium') {
              org.health -= 2.5 * intensity * dt;
            } else if (!org.traits.includes('sturdy_membrane')) {
              org.health -= 0.35 * intensity * dt;
            }
          } else if (chem.type === 'peroxide') {
            org.health -= 1.8 * intensity * dt;
            org.energy -= 0.5 * intensity * dt;
          } else if (chem.type === 'heal') {
            org.health = Math.min(org.maxHealth, org.health + 2.5 * intensity * dt);
            org.energy = Math.min(org.maxEnergy, org.energy + 2.0 * intensity * dt);
          } else if (chem.type === 'uv') {
            if (!org.traits.includes('radio_resistant') && !org.isImmortal) {
              org.health -= 0.7 * intensity * dt;
              if (Math.random() < 0.01 * intensity && org.traits.length < 8) {
                this.mutateOrganism(org);
              }
            }
          }
        }
      });

      // Spontaneous mutation law
      if (this.worldLaws.spontaneousMutations && Math.random() < 0.0003 * dt && org.traits.length < 8) {
        this.mutateOrganism(org);
      }

      // Death check
      if (org.health <= 0) {
        this.killOrganism(i);
        continue;
      }

      // Reproduction check
      if (org.reproductionCooldown > 0) {
        const mult = this.worldLaws.superMitosis ? 8 : org.traits.includes('hermes_haste') ? 3 : 1;
        org.reproductionCooldown -= dt * mult;
      } else {
        const config = SPECIES_CONFIGS[org.species];
        let divThreshold = config.divisionEnergy;
        org.traits.forEach((tId) => {
          const t = ALL_TRAITS[tId];
          if (t) divThreshold *= t.divisionMod;
        });

        if (this.worldLaws.superMitosis) divThreshold *= 0.5;

        if (org.energy >= divThreshold) {
          this.executeBinaryFission(org);
        }
      }

      // Amoeba pseudopods animation
      if (org.pseudopods) {
        org.pseudopods.forEach((p) => {
          p.angle += p.speed * 0.1 * dt;
          p.length += (p.targetLength - p.length) * 0.05 * dt;
          if (Math.abs(p.targetLength - p.length) < 2) {
            p.targetLength = 12 + Math.random() * 18;
          }
        });
      }

      // Organism Navigation & Behavior
      this.updateOrganismBehavior(org, dt);

      // Kinematic update
      org.x += org.vx * dt;
      org.y += org.vy * dt;

      // Angular smoothing
      let diffAngle = org.targetAngle - org.angle;
      while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
      while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
      org.angle += diffAngle * 0.08 * dt;

      // Friction
      org.vx *= 0.94;
      org.vy *= 0.94;

      // Obstacle collision
      this.obstacles.forEach((obs) => {
        const odx = org.x - obs.x;
        const ody = org.y - obs.y;
        const odist = Math.sqrt(odx * odx + ody * ody);
        const minDist = obs.radius + org.baseRadius * org.size;
        if (odist < minDist && odist > 0.1) {
          org.x = obs.x + (odx / odist) * minDist;
          org.y = obs.y + (ody / odist) * minDist;
          org.vx *= -0.3;
          org.vy *= -0.3;
        }
      });

      // Universe boundary containment
      const cdx = org.x - 900;
      const cdy = org.y - 600;
      const distFromCenter = Math.sqrt(cdx * cdx + cdy * cdy);
      const boundary = this.slideRadius - org.baseRadius * org.size;
      if (distFromCenter > boundary) {
        org.x = 900 + (cdx / distFromCenter) * boundary;
        org.y = 600 + (cdy / distFromCenter) * boundary;
        org.vx *= -0.6;
        org.vy *= -0.6;
        org.targetAngle = Math.atan2(-cdy, -cdx);
      }
    }
  }

  private updateOrganismBehavior(org: Organism, dt: number) {
    const config = SPECIES_CONFIGS[org.species];
    let baseSpeed = config.baseSpeed;

    org.traits.forEach((tId) => {
      const t = ALL_TRAITS[tId];
      if (t) baseSpeed *= t.speedMod;
    });

    if (org.traits.includes('hermes_haste') || (org.coffeeBoostTicks && org.coffeeBoostTicks > 0)) {
      baseSpeed *= 2.2;
    }

    // Decay temporary resonance
    if (org.symbioticResonance && org.symbioticResonance > 0) {
      org.symbioticResonance = Math.max(0, org.symbioticResonance - dt * 0.05);
    }

    const strain = this.strains.get(org.strainId);

    // 1. COMMUNITY SYMBIOSIS & MUTUAL AID (Sharing energy & swimming together)
    if (this.worldLaws.communitySymbiosis && org.species !== 'bacterium' && org.species !== 'phage') {
      let nearestCompanion: Organism | null = null;
      let minCompDist = 130;

      for (let j = 0; j < this.organisms.length; j++) {
        const other = this.organisms[j];
        if (other.id === org.id || other.species === 'bacterium' || other.species === 'phage') continue;

        const isSameStrain = other.strainId === org.strainId;
        const isPartnerStrain = strain && strain.symbioticWith.includes(other.strainId);

        if (isSameStrain || isPartnerStrain) {
          const dx = other.x - org.x;
          const dy = other.y - org.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minCompDist) {
            minCompDist = dist;
            nearestCompanion = other;
          }
        }
      }

      if (nearestCompanion) {
        // Gently steer towards companion to swim alongside
        const dx = nearestCompanion.x - org.x;
        const dy = nearestCompanion.y - org.y;
        const compAngle = Math.atan2(dy, dx);
        org.targetAngle = (org.targetAngle + compAngle * 0.2 + nearestCompanion.angle * 0.8) / 2;
        org.state = 'communing';
        org.symbioticResonance = 1.0;

        // Mutual aid: if one organism is hungry and the other is well-fed, share energy!
        if (org.energy > org.maxEnergy * 0.55 && nearestCompanion.energy < nearestCompanion.maxEnergy * 0.45) {
          const transfer = 0.4 * dt;
          org.energy -= transfer;
          nearestCompanion.energy += transfer;
          org.symbioticExchanges = (org.symbioticExchanges || 0) + 1;
          nearestCompanion.symbioticExchanges = (nearestCompanion.symbioticExchanges || 0) + 1;
          org.glowIntensity = Math.min(1.0, (org.glowIntensity || 0) + 0.2);

          if (strain) {
            strain.harmonyScore = Math.min(100, strain.harmonyScore + 0.02);
            strain.vitality = Math.min(100, strain.vitality + 0.01);
          }
          if (Math.random() < 0.02) {
            soundEngine.playChime(520);
          }
        }

        org.vx += Math.cos(org.angle) * baseSpeed * 0.08 * dt;
        org.vy += Math.sin(org.angle) * baseSpeed * 0.08 * dt;
        return;
      }
    }

    // 2. DIDINIUM HYDRO-ACROBATIC GLIDER (Vortex Aerator & Spore Scout)
    if (org.species === 'didinium') {
      org.targetAngle += 0.12 * dt; // Spiraling acrobatic circles
      org.vx += Math.cos(org.angle) * baseSpeed * 0.14 * dt;
      org.vy += Math.sin(org.angle) * baseSpeed * 0.14 * dt;

      // Aerate water and gently disperse stardust
      if (Math.random() < 0.05 * dt && this.nutrients.length < 180) {
        this.nutrients.push({
          id: 'nut_' + Math.random().toString(36).substring(2, 9),
          x: org.x - Math.cos(org.angle) * 20,
          y: org.y - Math.sin(org.angle) * 20,
          vx: -Math.cos(org.angle) * 0.8,
          vy: -Math.sin(org.angle) * 0.8,
          amount: 14,
          type: 'glucose',
        });
      }
      return;
    }

    // 3. GRAZING ON BACTERIA & BACILLI
    let nearestBacteria: Organism | null = null;
    let minBacDist = 170;
    if (org.species !== 'bacterium' && org.species !== 'phage') {
      for (let j = 0; j < this.organisms.length; j++) {
        const other = this.organisms[j];
        if (other.species === 'bacterium') {
          const dx = other.x - org.x;
          const dy = other.y - org.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minBacDist) {
            minBacDist = dist;
            nearestBacteria = other;
          }
        }
      }
    }

    if (nearestBacteria) {
      org.state = 'grazing';
      const dx = nearestBacteria.x - org.x;
      const dy = nearestBacteria.y - org.y;
      org.targetAngle = Math.atan2(dy, dx);
      org.vx += Math.cos(org.angle) * baseSpeed * 0.12 * dt;
      org.vy += Math.sin(org.angle) * baseSpeed * 0.12 * dt;

      if (minBacDist < org.baseRadius * org.size + 8) {
        const idx = this.organisms.indexOf(nearestBacteria);
        if (idx !== -1) {
          org.energy = Math.min(org.maxEnergy, org.energy + 20);
          org.ingestedCount++;
          this.killOrganism(idx);
          if (Math.random() < 0.25) soundEngine.playBubblePop(480);
        }
      }
      return;
    }

    // 4. STARDUST / NUTRIENT CHEMOTAXIS
    let nearestNutrient: NutrientParticle | null = null;
    let minNutDist = 160;
    for (let j = 0; j < this.nutrients.length; j++) {
      const nut = this.nutrients[j];
      const dx = nut.x - org.x;
      const dy = nut.y - org.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minNutDist) {
        minNutDist = dist;
        nearestNutrient = nut;
      }
    }

    if (nearestNutrient) {
      org.state = 'grazing';
      const dx = nearestNutrient.x - org.x;
      const dy = nearestNutrient.y - org.y;
      org.targetAngle = Math.atan2(dy, dx);
      org.vx += Math.cos(org.angle) * baseSpeed * 0.1 * dt;
      org.vy += Math.sin(org.angle) * baseSpeed * 0.1 * dt;

      if (minNutDist < org.baseRadius * org.size + 6) {
        const idx = this.nutrients.indexOf(nearestNutrient);
        if (idx !== -1) {
          org.energy = Math.min(org.maxEnergy, org.energy + nearestNutrient.amount);
          org.ingestedCount++;
          this.nutrients.splice(idx, 1);
          if (Math.random() < 0.2) soundEngine.playBubblePop(420);
        }
      }
      return;
    }

    // 5. PHOTOTAXIS & SOLAR BASKING
    if (org.species === 'euglena' || org.traits.includes('red_eyespot')) {
      const ldx = this.lightSpot.x - org.x;
      const ldy = this.lightSpot.y - org.y;
      const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
      if (ldist < this.lightSpot.radius) {
        org.state = 'basking';
        org.energy = Math.min(org.maxEnergy, org.energy + 0.15 * dt);

        // Starlight Nectar Bloom from Euglena
        if (this.worldLaws.starlightNectarBlooms && Math.random() < 0.03 * dt && this.nutrients.length < 180) {
          this.nutrients.push({
            id: 'nut_' + Math.random().toString(36).substring(2, 9),
            x: org.x + (Math.random() - 0.5) * 16,
            y: org.y + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            amount: 16,
            type: 'glucose',
          });
        }
      } else {
        org.targetAngle = Math.atan2(ldy, ldx) + (Math.random() - 0.5) * 0.4;
        org.vx += Math.cos(org.angle) * baseSpeed * 0.09 * dt;
        org.vy += Math.sin(org.angle) * baseSpeed * 0.09 * dt;
        return;
      }
    }

    // 6. NATURAL GENTLE SWIMMING
    if (Math.random() < 0.04 * dt) {
      org.targetAngle += (Math.random() - 0.5) * 1.6;
    }
    org.vx += Math.cos(org.angle) * baseSpeed * 0.08 * dt;
    org.vy += Math.sin(org.angle) * baseSpeed * 0.08 * dt;
  }

  public executeBinaryFission(parent: Organism) {
    parent.energy *= 0.48;
    parent.reproductionCooldown = SPECIES_CONFIGS[parent.species]?.reproductionCooldownTicks || 300;

    const angle = parent.angle + Math.PI / 2;
    const offset = parent.baseRadius * parent.size * 0.9;
    const childX = parent.x + Math.cos(angle) * offset;
    const childY = parent.y + Math.sin(angle) * offset;

    // Inherit traits with potential mutation
    const childTraits = [...parent.traits.filter((t) => t !== 'sanctuary_guide')]; // Guide role is earned or appointed
    if (this.worldLaws.spontaneousMutations && Math.random() < 0.15 && childTraits.length < 8) {
      const available = Object.keys(ALL_TRAITS).filter((t) => !childTraits.includes(t) && t !== 'sanctuary_guide');
      if (available.length > 0) {
        const newTrait = available[Math.floor(Math.random() * available.length)];
        childTraits.push(newTrait);
      }
    }

    const child = this.spawnOrganism(parent.species, childX, childY, parent.strainId, childTraits, parent.generation + 1);
    if (child) {
      child.energy = parent.energy;
      soundEngine.playMitosisSplit();
    }
  }

  public mutateOrganism(org: Organism) {
    const available = Object.keys(ALL_TRAITS).filter((t) => !org.traits.includes(t));
    if (available.length > 0) {
      const traitKey = available[Math.floor(Math.random() * available.length)];
      org.traits.push(traitKey);
      this.applyTraitStats(org);
      this.logEvent(`Cosmic mutation bestowed [${ALL_TRAITS[traitKey]?.name || traitKey}] on ${org.name}!`, 'mutation', org.species);
      soundEngine.playLaserHum();
    }
  }

  public killOrganism(index: number) {
    const org = this.organisms[index];
    if (!org) return;

    const strain = this.strains.get(org.strainId);
    if (strain) {
      strain.population = Math.max(0, strain.population - 1);
    }

    // Release stardust nutrients upon lysis
    const nutrientCount = Math.min(8, Math.max(2, Math.floor(org.size * 3)));
    for (let i = 0; i < nutrientCount; i++) {
      this.nutrients.push({
        id: 'nut_' + Math.random().toString(36).substring(2, 9),
        x: org.x + (Math.random() - 0.5) * 20,
        y: org.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        amount: 8 + Math.random() * 8,
        type: 'detritus',
      });
    }

    if (this.selectedOrganismId === org.id) {
      this.selectedOrganismId = null;
    }
    if (this.followedOrganismId === org.id) {
      this.followedOrganismId = null;
    }

    this.organisms.splice(index, 1);
  }

  // STEWARDSHIP & SANCTUARY METHODS
  public honorSanctuaryGuide(organismId: string): Organism | null {
    const org = this.organisms.find((o) => o.id === organismId);
    if (!org) return null;

    org.isGuide = true;
    org.title = `Sanctuary Guide of ${org.strainName}`;
    if (!org.traits.includes('sanctuary_guide')) {
      org.traits.push('sanctuary_guide');
    }
    if (!org.traits.includes('immortal')) {
      org.traits.push('immortal');
    }
    if (!org.traits.includes('symbiotic_communion')) {
      org.traits.push('symbiotic_communion');
    }
    org.health = org.maxHealth;
    org.blessed = true;
    this.applyTraitStats(org);

    soundEngine.playChime(650);
    this.logEvent(`🌿 ${org.name} honored as Elder Sanctuary Guide of ${org.strainName}!`, 'realm', org.species);
    return org;
  }

  public honorSanctuaryGuideAt(worldX: number, worldY: number): Organism | null {
    const org = this.getOrganismAt(worldX, worldY);
    if (!org) return null;
    return this.honorSanctuaryGuide(org.id);
  }

  public forgeSymbiosis(strainA: string, strainB: string) {
    const sA = this.strains.get(strainA);
    const sB = this.strains.get(strainB);
    if (!sA || !sB || strainA === strainB) return;

    if (!sA.symbioticWith.includes(strainB)) sA.symbioticWith.push(strainB);
    if (!sB.symbioticWith.includes(strainA)) sB.symbioticWith.push(strainA);

    sA.harmonyScore = Math.min(100, sA.harmonyScore + 10);
    sB.harmonyScore = Math.min(100, sB.harmonyScore + 10);

    soundEngine.playChime(580);
    this.logEvent(`🤝 Mutualist Symbiosis forged between ${sA.name} and ${sB.name}!`, 'symbiosis');
  }

  public dissolveSymbiosis(strainA: string, strainB: string) {
    const sA = this.strains.get(strainA);
    const sB = this.strains.get(strainB);
    if (!sA || !sB) return;

    sA.symbioticWith = sA.symbioticWith.filter((id) => id !== strainB);
    sB.symbioticWith = sB.symbioticWith.filter((id) => id !== strainA);

    this.logEvent(`Symbiotic covenant between ${sA.name} and ${sB.name} dissolved amicably.`, 'realm');
  }

  public harmonizeCosmos() {
    this.strains.forEach((s) => {
      s.harmonyScore = 100;
      s.vitality = 100;
    });
    this.organisms.forEach((org) => {
      org.health = org.maxHealth;
      org.energy = org.maxEnergy;
      org.glowIntensity = 1.0;
      org.symbioticResonance = 1.0;
      org.state = 'communing';
    });
    soundEngine.playChime(520);
    this.logEvent('✨ Universal Harmony resonated across all clades! Cosmic vitality restored.', 'blessing');
  }

  public nurtureStrain(strainId: string) {
    const target = this.strains.get(strainId);
    if (!target) return;
    target.harmonyScore = Math.min(100, target.harmonyScore + 15);
    target.vitality = Math.min(100, target.vitality + 15);

    let count = 0;
    this.organisms.forEach((org) => {
      if (org.strainId === strainId) {
        org.health = org.maxHealth;
        org.energy = org.maxEnergy;
        org.glowIntensity = 1.0;
        count++;
      }
    });

    soundEngine.playChime(600);
    this.logEvent(`💖 Clade Nurtured: ${count} members of ${target.name} fully invigorated!`, 'blessing');
  }

  public releaseToStardust(organismId: string) {
    const idx = this.organisms.findIndex((o) => o.id === organismId);
    if (idx === -1) return;
    const org = this.organisms[idx];
    this.logEvent(`✨ ${org.name} peacefully dissolved into radiant cosmic stardust.`, 'milestone', org.species);
    this.killOrganism(idx);
    soundEngine.playBubblePop(340);
  }

  public triggerStarlightNectarBloom() {
    this.spawnNutrientCluster(this.lightSpot.x, this.lightSpot.y, 12, this.lightSpot.radius * 0.8);
    this.logEvent('🌸 Starlight Nectar Bloom: celestial glucose dew showered the photic zone!', 'blessing');
    soundEngine.playChime(620);
  }

  // WORLDBOX COIN OF FATE (50% SNAP)
  public snapCoinOfFate() {
    this.snapFlash = 1.0;
    const living = [...this.organisms];
    const totalToEliminate = Math.floor(living.length / 2);

    // Shuffle and pick 50%
    const shuffled = living.sort(() => Math.random() - 0.5);
    const toKill = shuffled.slice(0, totalToEliminate);

    toKill.forEach((org) => {
      const idx = this.organisms.indexOf(org);
      if (idx !== -1) {
        this.killOrganism(idx);
      }
    });

    soundEngine.playLaserHum();
    this.logEvent(`🪙 Coin of Fate flipped: Exactly half of all living souls (${totalToEliminate} entities) dissolved into cosmic stardust!`, 'milestone');
  }

  // GOD POWER APPLICATION (Stewardship & Paramecian Interactions)
  public applyGodPower(toolId: string, worldX: number, worldY: number, brushRadius: number) {
    // 1. STEWARDSHIP
    if (toolId === 'whisper_of_harmony') {
      this.harmonizeCosmos();
      return;
    }
    if (toolId === 'forge_symbiosis') {
      const strainKeys = Array.from(this.strains.keys());
      if (strainKeys.length >= 2) {
        const s1 = strainKeys[Math.floor(Math.random() * strainKeys.length)];
        let s2 = strainKeys[Math.floor(Math.random() * strainKeys.length)];
        while (s2 === s1) s2 = strainKeys[Math.floor(Math.random() * strainKeys.length)];
        this.forgeSymbiosis(s1, s2);
      }
      return;
    }
    if (toolId === 'nurture_all') {
      let count = 0;
      this.organisms.forEach((org) => {
        if (Math.hypot(org.x - worldX, org.y - worldY) < brushRadius * 1.5) {
          org.health = org.maxHealth;
          org.energy = org.maxEnergy;
          org.glowIntensity = 1.0;
          count++;
        }
      });
      soundEngine.playChime(640);
      this.logEvent(`💖 Nurture Radiance: ${count} protozoa healed and replenished!`, 'blessing');
      return;
    }
    if (toolId === 'shepherd_current') {
      this.organisms.forEach((org) => {
        const dx = worldX - org.x;
        const dy = worldY - org.y;
        const dist = Math.hypot(dx, dy);
        if (dist < brushRadius * 2.5 && dist > 10) {
          org.vx += (dx / dist) * 1.8;
          org.vy += (dy / dist) * 1.8;
          org.targetAngle = Math.atan2(dy, dx);
        }
      });
      soundEngine.playBubblePop(500);
      return;
    }
    if (toolId === 'sanctuary_dome') {
      this.chemicals.push({
        id: 'chem_' + Math.random().toString(36).substring(2, 9),
        x: worldX,
        y: worldY,
        radius: brushRadius * 1.4,
        type: 'heal',
        intensity: 1.5,
        duration: 240,
        maxDuration: 240,
        color: 'rgba(56, 189, 248, 0.45)',
      });
      soundEngine.playChime(600);
      this.logEvent('🛡️ Sanctuary Dome erected: peaceful healing refuge established.', 'blessing');
      return;
    }
    if (toolId === 'purify_waters') {
      for (let i = this.chemicals.length - 1; i >= 0; i--) {
        if (Math.hypot(this.chemicals[i].x - worldX, this.chemicals[i].y - worldY) < brushRadius * 1.5) {
          this.chemicals.splice(i, 1);
        }
      }
      this.nutrients.forEach((nut) => {
        if (Math.hypot(nut.x - worldX, nut.y - worldY) < brushRadius * 1.5) {
          nut.type = 'glucose';
          nut.amount = Math.max(nut.amount, 20);
        }
      });
      soundEngine.playChemicalFizz();
      this.logEvent('💧 Purified Waters: cleared impediments and enriched nutrient balance.', 'blessing');
      return;
    }

    // 2. MIRACLES
    if (toolId === 'hero_inspiration') {
      const clicked = this.getOrganismAt(worldX, worldY);
      if (clicked) {
        this.honorSanctuaryGuide(clicked.id);
      }
      return;
    }
    if (toolId === 'starlight_dew') {
      this.spawnNutrientCluster(worldX, worldY, 18, brushRadius);
      soundEngine.playChime(600);
      return;
    }
    if (toolId === 'god_hand_magnet') {
      const clicked = this.getOrganismAt(worldX, worldY);
      if (clicked) {
        clicked.vx = (Math.random() - 0.5) * 5;
        clicked.vy = (Math.random() - 0.5) * 5;
        soundEngine.playBubblePop(520);
      }
      return;
    }
    if (toolId === 'divine_light') {
      this.chemicals.push({
        id: 'chem_' + Math.random().toString(36).substring(2, 9),
        x: worldX,
        y: worldY,
        radius: brushRadius * 1.5,
        type: 'heal',
        intensity: 1.2,
        duration: 120,
        maxDuration: 120,
        color: 'rgba(52, 211, 153, 0.45)',
      });
      this.organisms.forEach((org) => {
        if (Math.hypot(org.x - worldX, org.y - worldY) < brushRadius * 1.5) {
          org.blessed = true;
          org.health = org.maxHealth;
          org.energy = org.maxEnergy;
          org.glowIntensity = 1.0;
        }
      });
      soundEngine.playChime(650);
      this.logEvent('✨ Divine Light bathed the slide in warm vitalizing rays.', 'blessing');
      return;
    }
    if (toolId === 'divine_shield') {
      let shielded = 0;
      this.organisms.forEach((org) => {
        if (Math.hypot(org.x - worldX, org.y - worldY) < brushRadius) {
          org.shieldHealth = 120;
          if (!org.traits.includes('bubble_shield')) org.traits.push('bubble_shield');
          shielded++;
        }
      });
      soundEngine.playChime(580);
      this.logEvent(`🛡️ Celestial Bubble Shield granted to ${shielded} specimens!`, 'blessing');
      return;
    }
    if (toolId === 'hermes_coffee') {
      let boosted = 0;
      this.organisms.forEach((org) => {
        if (Math.hypot(org.x - worldX, org.y - worldY) < brushRadius) {
          org.coffeeBoostTicks = 300;
          if (!org.traits.includes('hermes_haste')) org.traits.push('hermes_haste');
          org.energy = org.maxEnergy;
          boosted++;
        }
      });
      soundEngine.playBubblePop(600);
      this.logEvent(`☕ Hermes Nectar injected: ${boosted} organisms energised at high speed!`, 'blessing');
      return;
    }
    if (toolId === 'divine_eraser') {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        if (Math.hypot(this.obstacles[i].x - worldX, this.obstacles[i].y - worldY) < brushRadius) {
          this.obstacles.splice(i, 1);
        }
      }
      for (let i = this.chemicals.length - 1; i >= 0; i--) {
        if (Math.hypot(this.chemicals[i].x - worldX, this.chemicals[i].y - worldY) < brushRadius) {
          this.chemicals.splice(i, 1);
        }
      }
      for (let i = this.nutrients.length - 1; i >= 0; i--) {
        if (Math.hypot(this.nutrients[i].x - worldX, this.nutrients[i].y - worldY) < brushRadius) {
          this.nutrients.splice(i, 1);
        }
      }
      soundEngine.playBubblePop(300);
      return;
    }

    // 3. COSMIC LIFE
    if (toolId === 'spawn_paramecium') {
      const count = brushRadius > 30 ? 3 : 1;
      for (let i = 0; i < count; i++) {
        this.spawnOrganism('paramecium', worldX + (Math.random() - 0.5) * brushRadius, worldY + (Math.random() - 0.5) * brushRadius, 'strain_azure');
      }
      soundEngine.playBubblePop(440);
      return;
    }
    if (toolId === 'spawn_amoeba') {
      this.spawnOrganism('amoeba', worldX, worldY, 'strain_amethyst');
      soundEngine.playBubblePop(360);
      return;
    }
    if (toolId === 'spawn_didinium') {
      this.spawnOrganism('didinium', worldX, worldY, 'strain_crimson');
      soundEngine.playBubblePop(520);
      return;
    }
    if (toolId === 'spawn_stentor') {
      this.spawnOrganism('stentor', worldX, worldY, 'strain_cyan');
      soundEngine.playBubblePop(300);
      return;
    }
    if (toolId === 'spawn_euglena') {
      const count = brushRadius > 25 ? 4 : 2;
      for (let i = 0; i < count; i++) {
        this.spawnOrganism('euglena', worldX + (Math.random() - 0.5) * brushRadius, worldY + (Math.random() - 0.5) * brushRadius, 'strain_emerald');
      }
      soundEngine.playBubblePop(480);
      return;
    }
    if (toolId === 'spawn_rotifer') {
      this.spawnOrganism('rotifer', worldX, worldY, 'strain_gold');
      soundEngine.playBubblePop(260);
      return;
    }
    if (toolId === 'spawn_bacterium') {
      this.spawnBacteriaSwarm(worldX, worldY, 16, brushRadius);
      soundEngine.playBubblePop(600);
      return;
    }
    if (toolId === 'spawn_phage') {
      for (let i = 0; i < 6; i++) {
        this.spawnOrganism('phage', worldX + (Math.random() - 0.5) * brushRadius, worldY + (Math.random() - 0.5) * brushRadius);
      }
      soundEngine.playBubblePop(680);
      return;
    }

    // 4. ELEMENTS
    if (toolId === 'drop_glucose') {
      this.spawnNutrientCluster(worldX, worldY, 15, brushRadius);
      soundEngine.playBubblePop(420);
      return;
    }
    if (toolId === 'drop_detritus') {
      for (let i = 0; i < 8; i++) {
        this.nutrients.push({
          id: 'nut_' + Math.random().toString(36).substring(2, 9),
          x: worldX + (Math.random() - 0.5) * brushRadius,
          y: worldY + (Math.random() - 0.5) * brushRadius,
          vx: 0,
          vy: 0,
          amount: 24,
          type: 'detritus',
        });
      }
      soundEngine.playBubblePop(380);
      return;
    }
    if (toolId === 'env_light_spot') {
      this.lightSpot.x = worldX;
      this.lightSpot.y = worldY;
      this.lightSpot.radius = brushRadius * 2.2;
      soundEngine.playChime(580);
      return;
    }
    if (toolId === 'env_algae_rock') {
      this.obstacles.push({
        id: 'obs_' + Math.random().toString(36).substring(2, 9),
        x: worldX,
        y: worldY,
        radius: brushRadius * 0.8,
        type: 'algae_clump',
      });
      soundEngine.playBubblePop(300);
      return;
    }
    if (toolId === 'env_heat_thermal') {
      this.chemicals.push({
        id: 'chem_' + Math.random().toString(36).substring(2, 9),
        x: worldX,
        y: worldY,
        radius: brushRadius * 1.4,
        type: 'uv',
        intensity: 1.2,
        duration: 160,
        maxDuration: 160,
        color: 'rgba(251, 146, 60, 0.45)',
      });
      soundEngine.playChemicalFizz();
      return;
    }
    if (toolId === 'env_cryo_freeze') {
      this.chemicals.push({
        id: 'chem_' + Math.random().toString(36).substring(2, 9),
        x: worldX,
        y: worldY,
        radius: brushRadius * 1.5,
        type: 'heal',
        intensity: 0.8,
        duration: 160,
        maxDuration: 160,
        color: 'rgba(147, 197, 253, 0.45)',
      });
      soundEngine.playChime(480);
      return;
    }
    if (toolId === 'pipette_suction') {
      for (let i = this.organisms.length - 1; i >= 0; i--) {
        if (Math.hypot(this.organisms[i].x - worldX, this.organisms[i].y - worldY) < brushRadius) {
          this.killOrganism(i);
        }
      }
      for (let i = this.nutrients.length - 1; i >= 0; i--) {
        if (Math.hypot(this.nutrients[i].x - worldX, this.nutrients[i].y - worldY) < brushRadius) {
          this.nutrients.splice(i, 1);
        }
      }
      soundEngine.playBubblePop(280);
      return;
    }

    // 5. INSPECTION
    if (toolId === 'inspect_organism') {
      const clicked = this.getOrganismAt(worldX, worldY);
      if (clicked) {
        this.selectedOrganismId = clicked.id;
        soundEngine.playChime(520);
      }
    }
  }

  public getOrganismAt(worldX: number, worldY: number): Organism | null {
    for (let i = this.organisms.length - 1; i >= 0; i--) {
      const org = this.organisms[i];
      const dist = Math.hypot(org.x - worldX, org.y - worldY);
      if (dist < org.baseRadius * org.size + 12) {
        return org;
      }
    }
    return null;
  }

  public refreshStrainStats() {
    this.strains.forEach((s) => (s.population = 0));
    this.organisms.forEach((org) => {
      const s = this.strains.get(org.strainId);
      if (s) s.population++;
    });
  }

  public getStats(): SimulationStats {
    let dominantSpecies: SpeciesType | 'none' = 'none';
    let maxCount = 0;
    const counts: Record<string, number> = {};

    this.organisms.forEach((org) => {
      counts[org.species] = (counts[org.species] || 0) + 1;
      if (counts[org.species] > maxCount) {
        maxCount = counts[org.species];
        dominantSpecies = org.species;
      }
    });

    const bacteriaCount = counts['bacterium'] || 0;
    const protozoaCount = this.organisms.length - bacteriaCount;

    let totalSymbioses = 0;
    this.strains.forEach((s) => {
      totalSymbioses += s.symbioticWith.length;
    });
    totalSymbioses = Math.floor(totalSymbioses / 2);

    return {
      population: protozoaCount,
      totalBacteria: bacteriaCount,
      totalNutrients: this.nutrients.length,
      generationLeader: this.maxGeneration,
      dominantSpecies,
      ecosystemHealth: Math.min(100, Math.round(protozoaCount * 4 + this.nutrients.length * 0.5 + totalSymbioses * 8)),
      fps: 60,
      ticks: this.tickCount,
      totalSymbioses,
      totalCommunities: this.strains.size,
    };
  }
}
