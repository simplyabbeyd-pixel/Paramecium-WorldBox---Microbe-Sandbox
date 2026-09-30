import React, { useState } from 'react';
import {
  Crown,
  Split,
  Scroll,
  Hand,
  Coins,
  Sparkles,
  Shield,
  Coffee,
  Award,
  Eraser,
  Zap,
  Disc,
  Flame,
  Bomb,
  Eye,
  Skull,
  Snowflake,
  Fish,
  Bug,
  CircleDot,
  Compass,
  Activity,
  Droplet,
  Sun,
  Layers,
  Search,
  Scale,
  Sliders,
  BookOpen,
  Swords,
  Dna,
  CloudLightning,
  HeartHandshake,
  Heart,
  Flower2,
  Wind,
} from 'lucide-react';
import { ToolCategory, GodTool } from '../types';
import { GOD_TOOLS } from '../data/godPowersAndBiomes';
import { soundEngine } from '../audio/soundEffects';

interface GodToolbarProps {
  selectedToolId: string;
  onSelectTool: (toolId: string) => void;
  brushRadius: number;
  onChangeBrushRadius: (radius: number) => void;
  currentZoom: number;
  onChangeZoom: (newZoom: number) => void;
  onOpenLedger?: () => void;
  onOpenWorldLaws?: () => void;
  onOpenCodex?: () => void;
}

// Icon mapping helper with rich Lucide icons
const TOOL_ICONS: Record<string, React.ReactNode> = {
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Flower2: <Flower2 className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Split: <Split className="w-5 h-5" />,
  Scroll: <Scroll className="w-5 h-5" />,
  Hand: <Hand className="w-5 h-5" />,
  Coins: <Coins className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Eraser: <Eraser className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Disc: <Disc className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Bomb: <Bomb className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Skull: <Skull className="w-5 h-5" />,
  Snowflake: <Snowflake className="w-5 h-5" />,
  Fish: <Fish className="w-5 h-5" />,
  Bug: <Bug className="w-5 h-5" />,
  CircleDot: <CircleDot className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Droplet: <Droplet className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  Sliders: <Sliders className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Swords: <Swords className="w-5 h-5" />,
  Dna: <Dna className="w-5 h-5" />,
  CloudLightning: <CloudLightning className="w-5 h-5" />,
};

const CATEGORIES: { id: ToolCategory; label: string; icon: string }[] = [
  { id: 'stewardship', label: 'Stewardship', icon: 'HeartHandshake' },
  { id: 'miracles', label: 'Miracles', icon: 'Sparkles' },
  { id: 'cosmic_life', label: 'Cosmic Life', icon: 'Fish' },
  { id: 'elements', label: 'Elements', icon: 'Droplet' },
  { id: 'inspect', label: 'Inspect & Laws', icon: 'Search' },
];

export const GodToolbar: React.FC<GodToolbarProps> = ({
  selectedToolId,
  onSelectTool,
  brushRadius,
  onChangeBrushRadius,
  currentZoom,
  onChangeZoom,
  onOpenLedger,
  onOpenWorldLaws,
  onOpenCodex,
}) => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('stewardship');

  const activeTool = GOD_TOOLS.find((t) => t.id === selectedToolId) || GOD_TOOLS[0];
  const toolsInCategory = GOD_TOOLS.filter((t) => t.category === activeCategory);

  const brushSizes = [
    { label: '1x', radius: 15 },
    { label: '3x', radius: 30 },
    { label: '5x', radius: 55 },
    { label: '10x', radius: 90 },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-3 pointer-events-none z-20">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl pointer-events-auto flex flex-col space-y-2">
        {/* Active Tool Info Bar */}
        <div className="flex items-center justify-between px-2 text-xs border-b border-slate-800 pb-1.5">
          <div className="flex items-center space-x-2 truncate pr-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: activeTool.cursorColor }}
            />
            <span className="font-semibold text-slate-100 shrink-0">{activeTool.name}</span>
            <span className="text-slate-400 hidden sm:inline truncate">— {activeTool.description}</span>
          </div>

          {/* Quick Brush Size & Zoom Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Brush radius selector */}
            <div className="flex items-center space-x-1 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Brush:</span>
              {brushSizes.map((b) => (
                <button
                  key={b.label}
                  id={`brush-size-${b.label}`}
                  onClick={() => onChangeBrushRadius(b.radius)}
                  className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                    brushRadius === b.radius
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Ocular Zoom buttons */}
            <div className="flex items-center space-x-1 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Lens:</span>
              {[
                { label: '40x', zoom: 0.8 },
                { label: '100x', zoom: 1.2 },
                { label: '400x', zoom: 2.0 },
              ].map((z) => (
                <button
                  key={z.label}
                  id={`zoom-${z.label}`}
                  onClick={() => onChangeZoom(z.zoom)}
                  className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                    Math.abs(currentZoom - z.zoom) < 0.1
                      ? 'bg-sky-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Selection Tabs (WorldBox styled) */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => {
                  soundEngine.playLensClick();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {TOOL_ICONS[cat.icon]}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tools in Current Category */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
          {toolsInCategory.map((tool) => {
            const isSelected = selectedToolId === tool.id;

            return (
              <button
                key={tool.id}
                id={`tool-${tool.id}`}
                onClick={() => {
                  soundEngine.playToolSelect();
                  onSelectTool(tool.id);

                  // Handle direct modal shortcuts
                  if (tool.id === 'ledger_of_realms' && onOpenLedger) {
                    onOpenLedger();
                  } else if (tool.id === 'world_laws' && onOpenWorldLaws) {
                    onOpenWorldLaws();
                  } else if (tool.id === 'codex' && onOpenCodex) {
                    onOpenCodex();
                  }
                }}
                className={`relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all shrink-0 w-16 h-16 border ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400/80 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-850'
                }`}
                title={`${tool.name} — ${tool.description}`}
              >
                <div className="text-slate-200 group-hover:scale-110 transition-transform">
                  {TOOL_ICONS[tool.icon] || <Sparkles className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-medium mt-1 truncate max-w-[56px] text-center">
                  {tool.name}
                </span>

                {/* Tool Color indicator dot */}
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tool.cursorColor }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
