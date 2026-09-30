import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationEngine, ViewportState } from './simulation/engine';
import { MicroscopeRenderer } from './simulation/renderer';
import { MicroscopeHeader } from './components/MicroscopeHeader';
import { GodToolbar } from './components/GodToolbar';
import { CreatureInspectorModal } from './components/CreatureInspectorModal';
import { StrainManagerModal } from './components/StrainManagerModal';
import { MicroscopeCodexModal } from './components/MicroscopeCodexModal';
import { WorldLawsModal } from './components/WorldLawsModal';
import { EventLogTicker } from './components/EventLogTicker';
import { MicroscopeFilter, BiomeType, SimulationStats, ColonyStrain, WorldLaws } from './types';
import { GOD_TOOLS } from './data/godPowersAndBiomes';
import { soundEngine } from './audio/soundEffects';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Engine and Renderer instances
  const simRef = useRef<SimulationEngine>(new SimulationEngine());
  const rendererRef = useRef<MicroscopeRenderer>(new MicroscopeRenderer());

  // Camera Viewport
  const [viewport, setViewport] = useState<ViewportState>({ x: 900, y: 600, zoom: 1.0 });

  // Simulation controls state
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [filter, setFilter] = useState<MicroscopeFilter>('brightfield');
  const [currentBiome, setCurrentBiome] = useState<BiomeType>('pond_drop');
  const [selectedToolId, setSelectedToolId] = useState<string>('inspect_organism');
  const [brushRadius, setBrushRadius] = useState<number>(30);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);

  // Modal Dialogs
  const [showStrainsModal, setShowStrainsModal] = useState(false);
  const [showCodexModal, setShowCodexModal] = useState(false);
  const [showWorldLawsModal, setShowWorldLawsModal] = useState(false);

  // Selection & Tracking state
  const [selectedOrganismId, setSelectedOrganismId] = useState<string | null>(null);
  const [followedOrganismId, setFollowedOrganismId] = useState<string | null>(null);

  // Live simulation stats & events
  const [stats, setStats] = useState<SimulationStats>({
    population: 0,
    totalBacteria: 0,
    totalNutrients: 0,
    generationLeader: 1,
    dominantSpecies: 'none',
    ecosystemHealth: 100,
    fps: 60,
    ticks: 0,
    totalSymbioses: 0,
    totalCommunities: 0,
  });
  const [events, setEvents] = useState(simRef.current.events);

  // Mouse Interaction state
  const isMouseDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number; isHovering: boolean } | null>(null);

  // Helper to map Screen coordinate to Simulation World coordinate
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: screenX, y: screenY };

      const rect = canvas.getBoundingClientRect();
      const localX = screenX - rect.left;
      const localY = screenY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const worldX = (localX - centerX) / viewport.zoom + viewport.x;
      const worldY = (localY - centerY) / viewport.zoom + viewport.y;

      return { x: worldX, y: worldY };
    },
    [viewport]
  );

  // Initialize Paramecia Fantasy Universe on mount
  useEffect(() => {
    simRef.current.generateUniverseFromSeed('seed_paramecia');
    setCurrentBiome(simRef.current.biome);
  }, []);

  // Sync Pause & Speed with engine
  useEffect(() => {
    simRef.current.isPaused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    simRef.current.speedMultiplier = speed;
  }, [speed]);

  // Main Animation & Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let statsTimer = 0;

    const renderLoop = (time: number) => {
      const deltaSec = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const sim = simRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      // Update simulation physics & biology
      sim.update(deltaSec * 60);

      // Camera Follow behavior
      if (followedOrganismId) {
        const followed = sim.organisms.find((o) => o.id === followedOrganismId);
        if (followed) {
          setViewport((prev) => ({
            ...prev,
            x: prev.x + (followed.x - prev.x) * 0.08,
            y: prev.y + (followed.y - prev.y) * 0.08,
          }));
        } else {
          setFollowedOrganismId(null);
        }
      }

      // Render Canvas
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const activeTool = GOD_TOOLS.find((t) => t.id === selectedToolId);
          renderer.render(
            ctx,
            canvas.width,
            canvas.height,
            sim,
            viewport,
            filter,
            activeTool ? activeTool.cursorColor : null,
            mouseWorldPos,
            brushRadius
          );
        }
      }

      // Update React state periodically (every 120ms to keep UI silky smooth)
      statsTimer += deltaSec;
      if (statsTimer > 0.12) {
        statsTimer = 0;
        setStats(sim.getStats());
        setEvents([...sim.events]);
        if (sim.selectedOrganismId !== selectedOrganismId) {
          setSelectedOrganismId(sim.selectedOrganismId);
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewport, filter, selectedToolId, mouseWorldPos, brushRadius, followedOrganismId, selectedOrganismId]);

  // ResizeObserver on canvas container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(container);
    handleResize();

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handlers for Mouse Actions on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Check if middle click or right click (or alt key) for panning
    if (e.button === 1 || e.button === 2 || e.altKey) {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 0) {
      isMouseDownRef.current = true;
      const worldPos = screenToWorld(e.clientX, e.clientY);

      // If inspect tool is active, attempt selection
      if (selectedToolId === 'inspect_organism') {
        const clicked = simRef.current.getOrganismAt(worldPos.x, worldPos.y);
        if (clicked) {
          setSelectedOrganismId(clicked.id);
          simRef.current.selectedOrganismId = clicked.id;
          soundEngine.playChime(520);
        } else {
          setSelectedOrganismId(null);
          simRef.current.selectedOrganismId = null;
        }
      } else if (selectedToolId === 'open_world_laws') {
        setShowWorldLawsModal(true);
      } else if (selectedToolId === 'ledger_of_realms') {
        setShowStrainsModal(true);
      } else if (selectedToolId === 'codex') {
        setShowCodexModal(true);
      } else {
        // Apply active god power
        simRef.current.applyGodPower(selectedToolId, worldPos.x, worldPos.y, brushRadius);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos({ x: worldPos.x, y: worldPos.y, isHovering: true });

    // Panning canvas
    if (isPanningRef.current) {
      const dx = (e.clientX - lastMousePosRef.current.x) / viewport.zoom;
      const dy = (e.clientY - lastMousePosRef.current.y) / viewport.zoom;
      setViewport((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Continuous painting with god powers
    if (
      isMouseDownRef.current &&
      selectedToolId !== 'inspect_organism' &&
      selectedToolId !== 'open_world_laws' &&
      selectedToolId !== 'ledger_of_realms' &&
      selectedToolId !== 'codex'
    ) {
      simRef.current.applyGodPower(selectedToolId, worldPos.x, worldPos.y, brushRadius);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
    setMouseWorldPos(null);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setViewport((prev) => {
      const nextZoom = Math.max(0.5, Math.min(3.8, prev.zoom * zoomFactor));
      return { ...prev, zoom: nextZoom };
    });
  };

  // Selected Organism Object
  const selectedOrganism = simRef.current.organisms.find((o) => o.id === selectedOrganismId) || null;

  // Strains array for modal
  const strainsList: ColonyStrain[] = Array.from(simRef.current.strains.values());

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col select-none font-sans">
      {/* Top Header */}
      <MicroscopeHeader
        stats={stats}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        speed={speed}
        onChangeSpeed={(newSpeed) => setSpeed(newSpeed)}
        filter={filter}
        onChangeFilter={(newFilter) => setFilter(newFilter)}
        currentBiome={currentBiome}
        onSelectPreset={(presetId) => {
          if (presetId.startsWith('seed_')) {
            simRef.current.generateUniverseFromSeed(presetId);
          } else {
            simRef.current.loadPreset(presetId);
          }
          setCurrentBiome(simRef.current.biome);
          setSelectedOrganismId(null);
          setFollowedOrganismId(null);
          setViewport({ x: 900, y: 600, zoom: 1.0 });
        }}
        onOpenStrains={() => setShowStrainsModal(true)}
        onOpenCodex={() => setShowCodexModal(true)}
        onOpenWorldLaws={() => setShowWorldLawsModal(true)}
        onResetSlide={() => {
          simRef.current.generateUniverseFromSeed('seed_paramecia');
          setCurrentBiome(simRef.current.biome);
          setSelectedOrganismId(null);
          setFollowedOrganismId(null);
          setViewport({ x: 900, y: 600, zoom: 1.0 });
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = soundEngine.toggleMute();
          setIsMuted(next);
        }}
      />

      {/* Canvas Viewport Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Live Chronicle / Events Ticker */}
        <EventLogTicker events={events} />

        {/* Bottom God Powers Toolbar (WorldBox style) */}
        <GodToolbar
          selectedToolId={selectedToolId}
          onSelectTool={(id) => {
            setSelectedToolId(id);
            const tool = GOD_TOOLS.find((t) => t.id === id);
            if (tool) setBrushRadius(tool.defaultBrushRadius);
          }}
          brushRadius={brushRadius}
          onChangeBrushRadius={(radius) => setBrushRadius(radius)}
          currentZoom={viewport.zoom}
          onChangeZoom={(zoom) => setViewport((prev) => ({ ...prev, zoom }))}
          onOpenLedger={() => setShowStrainsModal(true)}
          onOpenWorldLaws={() => setShowWorldLawsModal(true)}
          onOpenCodex={() => setShowCodexModal(true)}
        />

        {/* Selected Creature Inspector Card */}
        {selectedOrganism && (
          <CreatureInspectorModal
            organism={selectedOrganism}
            onClose={() => {
              setSelectedOrganismId(null);
              simRef.current.selectedOrganismId = null;
              if (followedOrganismId === selectedOrganism.id) {
                setFollowedOrganismId(null);
              }
            }}
            onBless={(orgId) => {
              const org = simRef.current.organisms.find((o) => o.id === orgId);
              if (org) {
                org.blessed = true;
                org.health = org.maxHealth * 1.5;
                org.maxHealth = Math.round(org.maxHealth * 1.5);
                org.size *= 1.3;
                simRef.current.logEvent(`${org.name} was touched with divine blessing!`, 'blessing', org.species);
              }
            }}
            onHonorGuide={(orgId) => {
              simRef.current.honorSanctuaryGuide(orgId);
            }}
            onReleaseToStardust={(orgId) => {
              simRef.current.releaseToStardust(orgId);
              setSelectedOrganismId(null);
            }}
            onFollow={(orgId) => {
              if (followedOrganismId === orgId) {
                setFollowedOrganismId(null);
              } else {
                setFollowedOrganismId(orgId);
              }
            }}
            isFollowing={followedOrganismId === selectedOrganism.id}
            onAddTrait={(orgId, traitId) => {
              const org = simRef.current.organisms.find((o) => o.id === orgId);
              if (org && !org.traits.includes(traitId)) {
                org.traits.push(traitId);
                simRef.current.applyTraitStats(org);
                simRef.current.logEvent(`Spliced [${traitId}] into ${org.name}!`, 'mutation', org.species);
              }
            }}
            onRemoveTrait={(orgId, traitId) => {
              const org = simRef.current.organisms.find((o) => o.id === orgId);
              if (org) {
                org.traits = org.traits.filter((t) => t !== traitId);
                simRef.current.applyTraitStats(org);
              }
            }}
            onRename={(orgId, newName) => {
              const org = simRef.current.organisms.find((o) => o.id === orgId);
              if (org) {
                org.name = newName;
              }
            }}
          />
        )}
      </div>

      {/* Clades & Sanctuaries Ledger Modal */}
      {showStrainsModal && (
        <StrainManagerModal
          strains={strainsList}
          totalOrganisms={simRef.current.organisms.length}
          onClose={() => setShowStrainsModal(false)}
          onNurtureStrain={(strainId) => {
            simRef.current.nurtureStrain(strainId);
          }}
          onForgeSymbiosis={(s1, s2) => {
            simRef.current.forgeSymbiosis(s1, s2);
          }}
          onDissolveSymbiosis={(s1, s2) => {
            simRef.current.dissolveSymbiosis(s1, s2);
          }}
          onHarmonizeAll={() => {
            simRef.current.harmonizeCosmos();
          }}
        />
      )}

      {/* World Laws Modal */}
      {showWorldLawsModal && (
        <WorldLawsModal
          laws={simRef.current.worldLaws}
          onUpdateLaw={(key, val) => {
            simRef.current.worldLaws[key] = val;
            simRef.current.logEvent(
              `Statute [${key}] was ${val ? 'ENACTED' : 'REPEALED'} by divine decree.`,
              'blessing'
            );
          }}
          onClose={() => setShowWorldLawsModal(false)}
        />
      )}

      {/* Microscope Biology & God Powers Codex Modal */}
      {showCodexModal && <MicroscopeCodexModal onClose={() => setShowCodexModal(false)} />}
    </div>
  );
}
