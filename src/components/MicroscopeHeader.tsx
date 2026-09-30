import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  BookOpen,
  Users,
  RotateCcw,
  Crown,
  Scale,
} from 'lucide-react';
import { MicroscopeFilter, BiomeType, SimulationStats } from '../types';
import { BIOME_CONFIGS, WORLD_PRESETS, UNIVERSE_SEEDS } from '../data/godPowersAndBiomes';
import { soundEngine } from '../audio/soundEffects';

interface MicroscopeHeaderProps {
  stats: SimulationStats;
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  filter: MicroscopeFilter;
  onChangeFilter: (filter: MicroscopeFilter) => void;
  currentBiome: BiomeType;
  onSelectPreset: (presetId: string) => void;
  onOpenStrains: () => void;
  onOpenCodex: () => void;
  onOpenWorldLaws: () => void;
  onResetSlide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MicroscopeHeader: React.FC<MicroscopeHeaderProps> = ({
  stats,
  isPaused,
  onTogglePause,
  speed,
  onChangeSpeed,
  filter,
  onChangeFilter,
  currentBiome,
  onSelectPreset,
  onOpenStrains,
  onOpenCodex,
  onOpenWorldLaws,
  onResetSlide,
  isMuted,
  onToggleMute,
}) => {
  const currentBiomeData = BIOME_CONFIGS[currentBiome];

  return (
    <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 select-none z-20">
      {/* Brand & Universe Realm Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-sm">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm tracking-tight text-white leading-none">Paramecia</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-semibold">
                Fantasy Universe
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              {currentBiomeData?.name || 'Cosmic Slide'} • pH {currentBiomeData?.pH} • {currentBiomeData?.temperature}°C
            </p>
          </div>
        </div>

        {/* Universe Seeds & Presets Dropdown */}
        <div className="hidden md:flex items-center ml-2">
          <select
            id="universe-seed-selector"
            className="bg-slate-800/90 text-xs text-slate-200 border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
            onChange={(e) => {
              if (e.target.value) {
                onSelectPreset(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Choose Universe Seed / Preset...</option>
            <optgroup label="✨ Fantasy Universe Seeds">
              {Object.values(UNIVERSE_SEEDS).map((s) => (
                <option key={s.seed} value={s.seed}>
                  Seed: {s.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🔬 Ecosystem Presets">
              {WORLD_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Live Universe Stats Pill */}
      <div className="hidden lg:flex items-center space-x-4 bg-slate-950/70 border border-slate-800/80 rounded-full px-4 py-1 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-400">Entities:</span>
          <span className="font-semibold text-slate-100">{stats.population}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span className="text-slate-400">Bacilli:</span>
          <span className="font-semibold text-slate-100">{stats.totalBacteria}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span className="text-slate-400">Stardust:</span>
          <span className="font-semibold text-slate-100">{stats.totalNutrients}</span>
        </div>
        <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-3">
          <span className="text-slate-400">Peak Clade:</span>
          <span className="font-semibold text-amber-400">Gen {stats.generationLeader}</span>
        </div>
      </div>

      {/* Center/Right Controls: Time, Filters, Modals */}
      <div className="flex items-center space-x-2">
        {/* Play/Pause & Speed Buttons */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
          <button
            id="btn-play-pause"
            onClick={onTogglePause}
            className={`p-1.5 rounded-md transition-colors ${
              isPaused ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-700 text-slate-200'
            }`}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
          <div className="flex items-center space-x-0.5 px-1 border-l border-slate-700">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                id={`btn-speed-${s}`}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 text-[11px] rounded font-medium transition-colors ${
                  speed === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Optical Lens Mode Filter */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
          {[
            { id: 'brightfield', label: 'Cosmic' },
            { id: 'darkfield', label: 'Darkfield' },
            { id: 'phase_contrast', label: 'Phase' },
            { id: 'fluorescent', label: 'Mana GFP' },
          ].map((f) => (
            <button
              key={f.id}
              id={`filter-${f.id}`}
              onClick={() => {
                soundEngine.playLensClick();
                onChangeFilter(f.id as MicroscopeFilter);
              }}
              className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                filter === f.id ? 'bg-slate-700 text-amber-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`${f.label} Optical Lens`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Modals & Tools buttons */}
        <button
          id="btn-open-world-laws"
          onClick={onOpenWorldLaws}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-amber-300 hover:text-amber-200 transition-colors"
          title="World Laws & Universal Statutes"
        >
          <Scale className="w-4 h-4" />
        </button>

        <button
          id="btn-open-strains"
          onClick={onOpenStrains}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-indigo-300 hover:text-indigo-200 transition-colors"
          title="Ledger of Realms & Kingdoms"
        >
          <Crown className="w-4 h-4" />
        </button>

        <button
          id="btn-open-codex"
          onClick={onOpenCodex}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Microscope Guide & Codex"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-sound"
          onClick={onToggleMute}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          id="btn-reset-slide"
          onClick={onResetSlide}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
          title="Reset Universe to Starter Seed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
