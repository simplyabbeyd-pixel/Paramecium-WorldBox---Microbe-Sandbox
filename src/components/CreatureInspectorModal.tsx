import React, { useState } from 'react';
import {
  X,
  Heart,
  Zap,
  Award,
  Sparkles,
  Eye,
  Trash2,
  Plus,
  Shield,
  HeartHandshake,
  Wind,
} from 'lucide-react';
import { Organism, MicrobeTrait } from '../types';
import { SPECIES_CONFIGS, ALL_TRAITS } from '../data/speciesAndTraits';
import { soundEngine } from '../audio/soundEffects';

interface CreatureInspectorModalProps {
  organism: Organism | null;
  onClose: () => void;
  onBless: (orgId: string) => void;
  onReleaseToStardust: (orgId: string) => void;
  onFollow: (orgId: string) => void;
  isFollowing: boolean;
  onAddTrait: (orgId: string, traitId: string) => void;
  onRemoveTrait: (orgId: string, traitId: string) => void;
  onRename: (orgId: string, newName: string) => void;
  onHonorGuide: (orgId: string) => void;
}

export const CreatureInspectorModal: React.FC<CreatureInspectorModalProps> = ({
  organism,
  onClose,
  onBless,
  onReleaseToStardust,
  onFollow,
  isFollowing,
  onAddTrait,
  onRemoveTrait,
  onRename,
  onHonorGuide,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showTraitPicker, setShowTraitPicker] = useState(false);

  if (!organism) return null;

  const speciesInfo = SPECIES_CONFIGS[organism.species];
  const healthPct = Math.max(0, Math.min(100, Math.round((organism.health / organism.maxHealth) * 100)));
  const energyPct = Math.max(0, Math.min(100, Math.round((organism.energy / organism.maxEnergy) * 100)));

  const rarityColor = (rarity: MicrobeTrait['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/80 bg-amber-950/40 text-amber-300';
      case 'epic':
        return 'border-purple-500/80 bg-purple-950/40 text-purple-300';
      case 'rare':
        return 'border-sky-500/80 bg-sky-950/40 text-sky-300';
      default:
        return 'border-slate-700 bg-slate-800/60 text-slate-300';
    }
  };

  const availableTraitsToAdd = Object.values(ALL_TRAITS).filter(
    (t) => !organism.traits.includes(t.id)
  );

  return (
    <div className="fixed top-20 right-6 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-30 flex flex-col max-h-[80vh]">
      {/* Header with Species & Close */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: organism.strainColor }}
            />
            {isEditingName ? (
              <input
                id="edit-organism-name-input"
                type="text"
                className="bg-slate-800 text-sm font-bold text-white px-2 py-0.5 rounded border border-teal-500 focus:outline-none"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={() => {
                  if (nameInput.trim()) onRename(organism.id, nameInput.trim());
                  setIsEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (nameInput.trim()) onRename(organism.id, nameInput.trim());
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <h2
                onClick={() => {
                  setNameInput(organism.name);
                  setIsEditingName(true);
                }}
                className="font-bold text-base text-slate-100 cursor-pointer hover:text-teal-300 transition-colors flex items-center space-x-1"
                title="Click to rename"
              >
                <span>{organism.name}</span>
                <span className="text-[10px] text-slate-400">✎</span>
              </h2>
            )}
            {organism.isGuide && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/50 flex items-center space-x-1 font-bold">
                <Award className="w-3 h-3 text-teal-400" />
                <span>Sanctuary Guide</span>
              </span>
            )}
            {organism.blessed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                Blessed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 italic mt-0.5">{speciesInfo.scientificName}</p>
          <p className="text-[11px] text-teal-400/90 font-medium">{organism.strainName}</p>
        </div>

        <button
          id="btn-close-inspector"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Health & Energy Bars */}
        <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Membrane Integrity</span>
              </span>
              <span className="font-semibold text-rose-300">
                {Math.round(organism.health)} / {organism.maxHealth} ({healthPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-300"
                style={{ width: `${healthPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ATP Cellular Energy</span>
              </span>
              <span className="font-semibold text-amber-300">
                {Math.round(organism.energy)} / {organism.maxEnergy} ({energyPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vital Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Generation</span>
            <p className="font-bold text-sky-400 text-sm">Gen {organism.generation}</p>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Nutrients</span>
            <p className="font-bold text-emerald-400 text-sm">{organism.ingestedCount}</p>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Mutual Aid</span>
            <p className="font-bold text-teal-300 text-sm">
              {Math.round((organism.symbioticResonance ?? 0.5) * 100)}%
            </p>
          </div>
        </div>

        {/* Current State / Behavior */}
        <div className="text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Current Behavior:</span>
          <span className="capitalize font-semibold text-teal-300 px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800">
            {organism.state === 'conjugating'
              ? 'Conjugating / Communing 🤝'
              : organism.state === 'dividing'
              ? 'Cellular Fission 🌱'
              : organism.state === 'basking'
              ? 'Basking in Photons ☀️'
              : 'Grazing on Flora 🍃'}
          </span>
        </div>

        {/* Genetic Traits / Genome Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Genome & Symbiotic Adaptations ({organism.traits.length})</span>
            </h3>
            <button
              id="btn-toggle-trait-picker"
              onClick={() => setShowTraitPicker(!showTraitPicker)}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center space-x-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Splice Trait</span>
            </button>
          </div>

          {/* Splicer Dropdown */}
          {showTraitPicker && (
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 mb-2 space-y-1.5 max-h-44 overflow-y-auto">
              <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase">Choose Trait to Splice:</p>
              {availableTraitsToAdd.length === 0 ? (
                <p className="text-xs text-slate-500 italic">All traits active!</p>
              ) : (
                availableTraitsToAdd.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onAddTrait(organism.id, t.id);
                      soundEngine.playChime(600);
                      setShowTraitPicker(false);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 ml-2">Add</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Active traits chips */}
          <div className="space-y-1.5">
            {organism.traits.map((traitId) => {
              const trait = ALL_TRAITS[traitId];
              if (!trait) return null;
              return (
                <div
                  key={traitId}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${rarityColor(trait.rarity)}`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold">{trait.name}</span>
                      <span className="text-[9px] uppercase px-1 rounded bg-black/40 font-semibold">
                        {trait.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">{trait.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      onRemoveTrait(organism.id, traitId);
                      soundEngine.playBubblePop(300);
                    }}
                    className="opacity-40 hover:opacity-100 text-rose-400 p-1 rounded hover:bg-rose-950/40 ml-2"
                    title="Remove trait"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stewardship Actions Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-1.5">
        <button
          id="btn-honor-guide"
          onClick={() => {
            onHonorGuide(organism.id);
            soundEngine.playChime(880);
          }}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors border ${
            organism.isGuide
              ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
              : 'bg-teal-500/15 hover:bg-teal-500/25 border-teal-500/40 text-teal-300'
          }`}
          title="Honor as Elder Sanctuary Guide of this community"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{organism.isGuide ? 'Sanctuary Guide' : 'Honor Guide'}</span>
        </button>

        <button
          id="btn-bless-creature"
          onClick={() => {
            onBless(organism.id);
            soundEngine.playChime(700);
          }}
          className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bless</span>
        </button>

        <button
          id="btn-follow-creature"
          onClick={() => {
            onFollow(organism.id);
            soundEngine.playLensClick();
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors border ${
            isFollowing
              ? 'bg-sky-500 text-white border-sky-400'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isFollowing ? 'Tracking' : 'Follow'}</span>
        </button>

        <button
          id="btn-release-stardust"
          onClick={() => {
            onReleaseToStardust(organism.id);
          }}
          className="py-1.5 px-2.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
          title="Peacefully release entity into radiant stardust nutrients"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Release</span>
        </button>
      </div>
    </div>
  );
};
