import {
  Organism,
  NutrientParticle,
  ChemicalZone,
  SlideObstacle,
  MicroscopeFilter,
  BlackHole,
  CosmicMeteor,
} from '../types';
import { SimulationEngine, ViewportState } from './engine';
import { BIOME_CONFIGS } from '../data/godPowersAndBiomes';

export class MicroscopeRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    sim: SimulationEngine,
    viewport: ViewportState,
    filter: MicroscopeFilter,
    activeToolColor: string | null,
    mousePos: { x: number; y: number; isHovering: boolean } | null,
    brushRadius: number
  ) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Save canvas state for camera zoom & pan
    ctx.save();

    // Camera transform
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(viewport.zoom, viewport.zoom);
    ctx.translate(-viewport.x, -viewport.y);

    const biomeConfig = BIOME_CONFIGS[sim.biome];

    // 1. Draw Slide Base & Grid
    this.drawSlideBackground(ctx, sim, biomeConfig, filter);

    // 2. Draw Obstacles (air bubbles, algae detritus)
    this.drawObstacles(ctx, sim.obstacles, filter);

    // 3. Draw Nutrients
    this.drawNutrients(ctx, sim.nutrients, filter);

    // 4. Draw Chemical zones & Disasters
    this.drawChemicals(ctx, sim.chemicals, filter);

    // 4b. Draw Cosmic Black Holes
    this.drawBlackHoles(ctx, sim.blackHoles);

    // 4c. Draw Cosmic Meteors
    this.drawMeteors(ctx, sim.meteors);

    // 5. Draw Light Spotlight
    this.drawLightSpot(ctx, sim.lightSpot, filter);

    // 6. Draw Organisms (sorted so selected/followed or large ones render nicely)
    this.drawOrganisms(ctx, sim.organisms, filter, sim.selectedOrganismId);

    // 7. Draw God Tool Brush Cursor in World Space
    if (mousePos && mousePos.isHovering && activeToolColor) {
      this.drawBrushCursor(ctx, mousePos.x, mousePos.y, brushRadius, activeToolColor);
    }

    ctx.restore();

    // 8. Screen-Space Overlays (Microscope Lens Vignette, Ocular Ring, Reticle, Scale Bar)
    this.drawMicroscopeOverlays(ctx, canvasWidth, canvasHeight, viewport.zoom, filter);

    // 9. Coin of Fate Celestial Snap Flash
    if (sim.snapFlash > 0) {
      this.drawSnapFlash(ctx, canvasWidth, canvasHeight, sim.snapFlash);
    }
  }

  private drawSlideBackground(
    ctx: CanvasRenderingContext2D,
    sim: SimulationEngine,
    biome: typeof BIOME_CONFIGS[keyof typeof BIOME_CONFIGS],
    filter: MicroscopeFilter
  ) {
    // Fill slide dish circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(900, 600, sim.slideRadius, 0, Math.PI * 2);

    if (filter === 'darkfield') {
      ctx.fillStyle = '#050912';
    } else if (filter === 'fluorescent') {
      ctx.fillStyle = '#030712';
    } else if (filter === 'phase_contrast') {
      ctx.fillStyle = '#1e293b';
    } else {
      // Brightfield
      const grad = ctx.createRadialGradient(900, 600, 50, 900, 600, sim.slideRadius);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.7, '#f1f5f9');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
    }
    ctx.fill();

    // Water biome tint
    ctx.fillStyle = biome.waterTint;
    ctx.fill();

    // Microscopic grid lines (hemocytometer counting grid)
    ctx.strokeStyle = filter === 'brightfield' ? biome.gridLineColor : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 80;
    const minX = 900 - sim.slideRadius;
    const maxX = 900 + sim.slideRadius;
    const minY = 600 - sim.slideRadius;
    const maxY = 600 + sim.slideRadius;

    ctx.beginPath();
    for (let x = minX; x <= maxX; x += step) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let y = minY; y <= maxY; y += step) {
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();

    // Slide boundary rim
    ctx.strokeStyle = filter === 'darkfield' ? '#1e293b' : '#94a3b8';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D, obstacles: SlideObstacle[], filter: MicroscopeFilter) {
    obstacles.forEach((obs) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);

      if (obs.type === 'air_bubble') {
        // High refractive index ring
        ctx.strokeStyle = filter === 'brightfield' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.fillStyle = filter === 'brightfield' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(15, 23, 42, 0.4)';
        ctx.fill();
        ctx.stroke();
        // Inner highlight
        ctx.beginPath();
        ctx.arc(obs.x - obs.radius * 0.3, obs.y - obs.radius * 0.3, obs.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      } else {
        // Debris / plant detritus
        ctx.fillStyle = filter === 'darkfield' ? '#475569' : 'rgba(120, 53, 15, 0.25)';
        ctx.strokeStyle = filter === 'darkfield' ? '#64748b' : 'rgba(120, 53, 15, 0.45)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  private drawNutrients(ctx: CanvasRenderingContext2D, nutrients: NutrientParticle[], filter: MicroscopeFilter) {
    nutrients.forEach((nut) => {
      ctx.save();
      ctx.beginPath();
      const r = Math.max(2, Math.min(6, nut.amount * 0.3));
      ctx.arc(nut.x, nut.y, r, 0, Math.PI * 2);

      if (filter === 'fluorescent') {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 6;
      } else if (filter === 'darkfield') {
        ctx.fillStyle = nut.type === 'glucose' ? '#38bdf8' : '#fbbf24';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = nut.type === 'glucose' ? 'rgba(14, 165, 233, 0.7)' : 'rgba(217, 119, 6, 0.7)';
      }
      ctx.fill();
      ctx.restore();
    });
  }

  private drawChemicals(ctx: CanvasRenderingContext2D, chemicals: ChemicalZone[], filter: MicroscopeFilter) {
    chemicals.forEach((chem) => {
      ctx.save();
      const alpha = (chem.duration / chem.maxDuration) * 0.55;
      ctx.beginPath();
      ctx.arc(chem.x, chem.y, chem.radius, 0, Math.PI * 2);

      if (chem.type === 'vortex') {
        // Draw rotating spiral arms
        ctx.strokeStyle = filter === 'darkfield' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(14, 165, 233, 0.5)';
        ctx.lineWidth = 3;
        for (let a = 0; a < 3; a++) {
          ctx.beginPath();
          const baseA = (chem.duration * 0.1) + (a * (Math.PI * 2 / 3));
          for (let r = 5; r < chem.radius; r += 6) {
            const angle = baseA + r * 0.08;
            const px = chem.x + Math.cos(angle) * r;
            const py = chem.y + Math.sin(angle) * r;
            if (r === 5) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = chem.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Pulsing border
        ctx.strokeStyle = chem.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  private drawLightSpot(
    ctx: CanvasRenderingContext2D,
    light: { x: number; y: number; radius: number; intensity: number },
    filter: MicroscopeFilter
  ) {
    ctx.save();
    const grad = ctx.createRadialGradient(light.x, light.y, 20, light.x, light.y, light.radius);
    if (filter === 'darkfield' || filter === 'fluorescent') {
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.18)');
      grad.addColorStop(0.7, 'rgba(253, 224, 71, 0.06)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    } else {
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      grad.addColorStop(0.7, 'rgba(254, 240, 138, 0.12)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawOrganisms(
    ctx: CanvasRenderingContext2D,
    organisms: Organism[],
    filter: MicroscopeFilter,
    selectedId: string | null
  ) {
    organisms.forEach((org) => {
      const isSelected = org.id === selectedId;

      ctx.save();
      ctx.translate(org.x, org.y);
      ctx.rotate(org.angle);

      // Render selection highlight ring
      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, org.baseRadius * org.size + 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Organism specific rendering
      switch (org.species) {
        case 'paramecium':
          this.renderParamecium(ctx, org, filter);
          break;
        case 'amoeba':
          this.renderAmoeba(ctx, org, filter);
          break;
        case 'didinium':
          this.renderDidinium(ctx, org, filter);
          break;
        case 'stentor':
          this.renderStentor(ctx, org, filter);
          break;
        case 'euglena':
          this.renderEuglena(ctx, org, filter);
          break;
        case 'rotifer':
          this.renderRotifer(ctx, org, filter);
          break;
        case 'bacterium':
          this.renderBacterium(ctx, org, filter);
          break;
        case 'phage':
          this.renderPhage(ctx, org, filter);
          break;
      }

      // WorldBox Visual Overlays (Crown, Shield, Electrified, Madness, Champion)
      this.renderWorldBoxOverlays(ctx, org);

      ctx.restore();
    });
  }

  // PARAMECIUM CAUDATUM: Slipper shape, beating cilia fringe, oral groove, contractile vacuoles, macronucleus
  private renderParamecium(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const length = 26 * scale;
    const width = 12 * scale;

    // 1. Synchronized beating cilia wave along the border
    ctx.save();
    ctx.strokeStyle = filter === 'darkfield' ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1;
    const ciliaCount = 28;
    for (let i = 0; i < ciliaCount; i++) {
      const t = (i / ciliaCount) * Math.PI * 2;
      const wave = Math.sin(org.ciliaPhase + i * 0.45) * 3.5;
      const px = Math.cos(t) * length;
      const py = Math.sin(t) * width;
      const nx = Math.cos(t);
      const ny = Math.sin(t);
      const ciliaLen = 5 * scale + wave;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + nx * ciliaLen, py + ny * ciliaLen);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Slipper-shaped pellicle body with oral groove indentation
    ctx.beginPath();
    // Anterior rounded end
    ctx.moveTo(length, 0);
    // Upper contour
    ctx.bezierCurveTo(length * 0.7, -width * 0.95, -length * 0.5, -width * 1.05, -length * 0.95, -width * 0.4);
    // Posterior tapered end
    ctx.bezierCurveTo(-length * 1.1, 0, -length * 0.95, width * 0.4, -length * 0.5, width * 0.95);
    // Oral groove notch (cytostome) on lower flank
    ctx.bezierCurveTo(-length * 0.1, width * 1.1, length * 0.1, width * 0.4, length * 0.3, width * 0.6);
    ctx.bezierCurveTo(length * 0.6, width * 0.9, length * 0.9, width * 0.5, length, 0);
    ctx.closePath();

    // Shading based on optical filter
    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // 3. Oral Groove / Cytostome cilia vortex
    ctx.save();
    ctx.strokeStyle = filter === 'darkfield' ? '#38bdf8' : 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(length * 0.1, width * 0.55, width * 0.35, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // 4. Large Kidney-shaped Macronucleus & tiny Micronucleus
    ctx.save();
    ctx.fillStyle = filter === 'fluorescent' ? '#38bdf8' : filter === 'darkfield' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(3, 105, 161, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-length * 0.05, -width * 0.15, width * 0.55, width * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Micronucleus
    ctx.fillStyle = filter === 'fluorescent' ? '#f43f5e' : 'rgba(190, 18, 60, 0.7)';
    ctx.beginPath();
    ctx.arc(-length * 0.05 + width * 0.4, -width * 0.15, width * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Pulsating Contractile Vacuoles (Anterior & Posterior)
    this.renderContractileVacuole(ctx, -length * 0.5, 0, width * 0.4, org.vacuoles[0]?.phase || 0, filter);
    this.renderContractileVacuole(ctx, length * 0.5, 0, width * 0.4, org.vacuoles[1]?.phase || 0, filter);

    // 6. Food Vacuoles circulating inside cytoplasm
    ctx.save();
    ctx.fillStyle = filter === 'darkfield' ? '#a3e635' : 'rgba(101, 163, 13, 0.65)';
    [-length * 0.25, length * 0.25, 0].forEach((vx, idx) => {
      ctx.beginPath();
      ctx.arc(vx, (idx % 2 === 0 ? 1 : -1) * (width * 0.4), 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // AMOEBA PROTEUS: Dynamic morphing pseudopodia, granular streaming cytoplasm
  private renderAmoeba(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const pseudopods = org.pseudopods || [];

    ctx.beginPath();
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      let radius = 18 * scale;

      // Deform by nearest pseudopod
      pseudopods.forEach((p) => {
        let diff = Math.abs(angle - p.angle);
        while (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < 0.8) {
          const factor = 1 - diff / 0.8;
          radius += p.length * factor * scale;
        }
      });

      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // Endoplasm granular stippling
    ctx.save();
    ctx.fillStyle = filter === 'darkfield' ? 'rgba(192, 132, 252, 0.5)' : 'rgba(126, 34, 206, 0.3)';
    for (let g = 0; g < 6; g++) {
      const ga = (g / 6) * Math.PI * 2 + org.ciliaPhase * 0.1;
      const gr = 8 * scale;
      ctx.beginPath();
      ctx.arc(Math.cos(ga) * gr, Math.sin(ga) * gr, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Large spherical nucleus
    ctx.fillStyle = filter === 'fluorescent' ? '#c084fc' : 'rgba(147, 51, 234, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // DIDINIUM NASUTUM: Barrel shape, conical apical proboscis, 2 cilia bands
  private renderDidinium(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const r = 14 * scale;

    // Body barrel
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.25, r * 0.95, 0, 0, Math.PI * 2);
    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // Conical Apical Snout / Proboscis at head (+X)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r * 1.15, -r * 0.35);
    ctx.lineTo(r * 1.85, 0); // sharp proboscis tip!
    ctx.lineTo(r * 1.15, r * 0.35);
    ctx.closePath();
    ctx.fillStyle = filter === 'darkfield' ? '#fda4af' : '#e11d48';
    ctx.fill();
    ctx.restore();

    // 2 Equatorial Ciliary Girdles (bands of beating cilia)
    [-r * 0.4, r * 0.4].forEach((gx) => {
      ctx.save();
      ctx.strokeStyle = filter === 'darkfield' ? '#fb7185' : 'rgba(225, 29, 72, 0.7)';
      ctx.lineWidth = 1.5;
      for (let s = -1; s <= 1; s += 2) {
        ctx.beginPath();
        ctx.moveTo(gx, s * r * 0.9);
        ctx.lineTo(gx - 3, s * (r * 0.9 + 6 * scale));
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // STENTOR COERULEUS: Giant trumpet, crown vortex
  private renderStentor(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const len = 34 * scale;
    const crownR = 18 * scale;

    // Trumpet horn contour
    ctx.beginPath();
    ctx.moveTo(-len * 0.7, 0); // holdfast stalk tip
    ctx.quadraticCurveTo(0, -crownR * 0.3, len * 0.6, -crownR);
    ctx.lineTo(len * 0.6, crownR);
    ctx.quadraticCurveTo(0, crownR * 0.3, -len * 0.7, 0);
    ctx.closePath();
    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // Cilia crown vortex rim
    ctx.save();
    ctx.strokeStyle = filter === 'darkfield' ? '#22d3ee' : '#0891b2';
    ctx.lineWidth = 2;
    for (let c = -crownR; c <= crownR; c += 3) {
      const wave = Math.sin(org.ciliaPhase + c * 0.3) * 4;
      ctx.beginPath();
      ctx.moveTo(len * 0.6, c);
      ctx.lineTo(len * 0.6 + 6 * scale + wave, c);
      ctx.stroke();
    }

    // Moniliform bead nucleus (string of beads)
    ctx.fillStyle = filter === 'fluorescent' ? '#67e8f9' : 'rgba(6, 182, 212, 0.6)';
    for (let b = -3; b <= 3; b++) {
      ctx.beginPath();
      ctx.arc(b * 5 * scale, 0, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // EUGLENA GRACILIS: Spindle, red eyespot (stigma), undulating anterior flagellum
  private renderEuglena(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const len = 18 * scale;
    const wid = 7 * scale;

    // Whipping flagellum at anterior (+X)
    ctx.save();
    ctx.strokeStyle = filter === 'darkfield' ? '#4ade80' : 'rgba(22, 163, 74, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(len, 0);
    for (let f = 1; f <= 16; f++) {
      const wave = Math.sin(org.flagellumPhase + f * 0.5) * 4 * (f / 16);
      ctx.lineTo(len + f * 1.5 * scale, wave);
    }
    ctx.stroke();
    ctx.restore();

    // Spindle body
    ctx.beginPath();
    ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // Red eyespot (stigma) near anterior
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(len * 0.65, -wid * 0.35, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Chloroplast disks
    ctx.fillStyle = filter === 'darkfield' ? '#86efac' : 'rgba(21, 128, 61, 0.6)';
    [-len * 0.4, 0, len * 0.3].forEach((cx) => {
      ctx.beginPath();
      ctx.ellipse(cx, 0, 3 * scale, 2 * scale, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // BDELLOID ROTIFER: Rotating twin corona wheels, mastax jaw
  private renderRotifer(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const scale = org.size;
    const len = 30 * scale;
    const wid = 14 * scale;

    // Body cuticle
    ctx.beginPath();
    ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
    this.applyCellBodyStyles(ctx, org.strainColor, filter, org.blessed);

    // Telescopic foot at posterior (-X)
    ctx.save();
    ctx.strokeStyle = filter === 'darkfield' ? '#fde047' : '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(-len - 10 * scale, -3 * scale);
    ctx.moveTo(-len, 0);
    ctx.lineTo(-len - 10 * scale, 3 * scale);
    ctx.stroke();

    // Twin Rotating Corona wheels at anterior (+X)
    [-wid * 0.55, wid * 0.55].forEach((wy) => {
      ctx.beginPath();
      ctx.arc(len * 0.95, wy, 5 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = filter === 'darkfield' ? '#fef08a' : '#eab308';
      ctx.stroke();

      // Spinning spoke cilia
      for (let s = 0; s < 4; s++) {
        const sa = org.ciliaPhase * 2 + (s * Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(len * 0.95, wy);
        ctx.lineTo(len * 0.95 + Math.cos(sa) * 6 * scale, wy + Math.sin(sa) * 6 * scale);
        ctx.stroke();
      }
    });

    // Internal grinding mastax jaw
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(len * 0.25, 0, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // BACTERIUM (Bacillus rod)
  private renderBacterium(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const r = 3.5 * org.size;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.8, r, 0, 0, Math.PI * 2);
    if (filter === 'fluorescent') {
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 4;
    } else if (filter === 'darkfield') {
      ctx.fillStyle = '#bef264';
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(101, 163, 13, 0.75)';
    }
    ctx.fill();
  }

  // BACTERIOPHAGE VIRUS (Geometric icosahedron + legs)
  private renderPhage(ctx: CanvasRenderingContext2D, org: Organism, filter: MicroscopeFilter) {
    const r = 3.5 * org.size;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = filter === 'darkfield' ? '#f472b6' : '#db2777';
    ctx.fill();
    // Tail fiber
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 1.8, 0);
    ctx.stroke();
  }

  private renderContractileVacuole(
    ctx: CanvasRenderingContext2D,
    vx: number,
    vy: number,
    maxRadius: number,
    phase: number,
    filter: MicroscopeFilter
  ) {
    ctx.save();
    // Phase 0 -> 1 swells, then collapses instantly at 1
    const swell = Math.sin(phase * 0.5) * maxRadius;
    const r = Math.max(1.5, swell);

    // Radial collecting canals (star-like tentacles)
    ctx.strokeStyle = filter === 'darkfield' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(14, 165, 233, 0.5)';
    ctx.lineWidth = 1;
    const canals = 6;
    for (let c = 0; c < canals; c++) {
      const ca = (c / canals) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(vx + Math.cos(ca) * r, vy + Math.sin(ca) * r);
      ctx.lineTo(vx + Math.cos(ca) * (r + 4), vy + Math.sin(ca) * (r + 4));
      ctx.stroke();
    }

    // Central bubble
    ctx.fillStyle = filter === 'darkfield' ? 'rgba(186, 230, 253, 0.8)' : 'rgba(224, 242, 254, 0.85)';
    ctx.beginPath();
    ctx.arc(vx, vy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private applyCellBodyStyles(
    ctx: CanvasRenderingContext2D,
    color: string,
    filter: MicroscopeFilter,
    blessed: boolean
  ) {
    if (filter === 'darkfield') {
      // Glowing diffraction rim with translucent interior
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = blessed ? 14 : 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (filter === 'fluorescent') {
      ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
      ctx.fill();
      ctx.strokeStyle = blessed ? '#fde047' : color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (filter === 'phase_contrast') {
      // DIC halo effect (crisp bright border with dark interior)
      ctx.fillStyle = 'rgba(51, 65, 85, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Brightfield (soft natural translucency)
      ctx.fillStyle = color + '33'; // ~20% alpha
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private drawBrushCursor(
    ctx: CanvasRenderingContext2D,
    worldX: number,
    worldY: number,
    brushRadius: number,
    color: string
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(worldX, worldY, brushRadius, 0, Math.PI * 2);
    ctx.fillStyle = color + '22';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    // Center crosshair
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(worldX - 6, worldY);
    ctx.lineTo(worldX + 6, worldY);
    ctx.moveTo(worldX, worldY - 6);
    ctx.lineTo(worldX, worldY + 6);
    ctx.stroke();
    ctx.restore();
  }

  private drawMicroscopeOverlays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    zoom: number,
    filter: MicroscopeFilter
  ) {
    ctx.save();

    // Subtle lens vignette around the screen perimeter
    const grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.45, width / 2, height / 2, Math.max(width, height) * 0.7);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Scale Bar in bottom-left corner
    // e.g. 50 micrometers
    const barWidthInWorldUnits = 60;
    const barWidthInPixels = barWidthInWorldUnits * zoom;
    const barX = 24;
    const barY = height - 24;

    ctx.fillStyle = filter === 'brightfield' ? '#334155' : '#f8fafc';
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barWidthInPixels, barY);
    ctx.moveTo(barX, barY - 4);
    ctx.lineTo(barX, barY + 4);
    ctx.moveTo(barX + barWidthInPixels, barY - 4);
    ctx.lineTo(barX + barWidthInPixels, barY + 4);
    ctx.stroke();

    ctx.font = '11px monospace';
    ctx.fillText(`${barWidthInWorldUnits} µm`, barX + barWidthInPixels + 8, barY + 4);

    ctx.restore();
  }

  // STEWARDSHIP VISUAL OVERLAYS: Sanctuary Guide Halo, Symbiosis Resonance, Shield, Blessed Aura
  private renderWorldBoxOverlays(ctx: CanvasRenderingContext2D, org: Organism) {
    const r = org.baseRadius * org.size;

    // 1. Elder Sanctuary Guide Halo / Circlet
    if (org.isGuide || org.traits.includes('sanctuary_guide')) {
      ctx.save();
      const haloY = -r - 8;

      // Radiant emerald/gold halo
      ctx.beginPath();
      ctx.arc(0, haloY, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner golden pearl
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, haloY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Leaf / starlight flares on either side
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-7, haloY + 1, 3, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(7, haloY + 1, 3, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();

      ctx.restore();
    }

    // 2. Symbiotic Communion Harmonic Wave
    if ((org.symbioticResonance ?? 0) > 0.2 || org.traits.includes('symbiotic_communion')) {
      ctx.save();
      const ringRadius = r + 6 + Math.sin(Date.now() * 0.004) * 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Celestial Bubble Shield
    if ((org.shieldHealth && org.shieldHealth > 0) || org.traits.includes('bubble_shield')) {
      ctx.save();
      const shieldR = r + 8;
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.stroke();

      // Shimmer highlight
      ctx.beginPath();
      ctx.arc(-shieldR * 0.35, -shieldR * 0.35, shieldR * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.restore();
    }

    // 4. Hermes Haste Speed Trails / Energy Spark
    if ((org.coffeeBoostTicks ?? 0) > 0 || org.traits.includes('hermes_haste')) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Blessed Golden Aura / Luminescence
    if (org.blessed || org.glowIntensity > 0.4) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // BLACK HOLES RENDERING
  private drawBlackHoles(ctx: CanvasRenderingContext2D, blackHoles: BlackHole[]) {
    blackHoles.forEach((bh) => {
      ctx.save();
      ctx.translate(bh.x, bh.y);

      // Gravitational lensing outer glow
      const outerGrad = ctx.createRadialGradient(0, 0, bh.radius * 0.4, 0, 0, bh.radius * 2.2);
      outerGrad.addColorStop(0, 'rgba(147, 51, 234, 0.45)');
      outerGrad.addColorStop(0.5, 'rgba(79, 70, 229, 0.25)');
      outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk swirl
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, bh.radius * 1.3, bh.radius * 0.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Absolute dark event horizon
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Event horizon edge ring
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    });
  }

  // COSMIC METEORS RENDERING
  private drawMeteors(ctx: CanvasRenderingContext2D, meteors: CosmicMeteor[]) {
    meteors.forEach((m) => {
      ctx.save();
      ctx.translate(m.x, m.y);

      // Fire tail
      const tailLength = 60;
      const angle = Math.atan2(m.targetY - m.startY, m.targetX - m.startX);
      const tailX = -Math.cos(angle) * tailLength;
      const tailY = -Math.sin(angle) * tailLength;

      const grad = ctx.createLinearGradient(tailX, tailY, 0, 0);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.6)');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0.9)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = m.radius * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Fiery meteor core
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, m.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, m.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // COIN OF FATE CELESTIAL SNAP FLASH
  private drawSnapFlash(ctx: CanvasRenderingContext2D, width: number, height: number, flashAlpha: number) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, flashAlpha)})`;
    ctx.fillRect(0, 0, width, height);

    // Celestial golden shimmer
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6);
    grad.addColorStop(0, `rgba(250, 204, 21, ${Math.min(0.6, flashAlpha * 0.7)})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
