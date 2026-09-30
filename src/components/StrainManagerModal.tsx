import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  Sparkles,
  Users,
  Scroll,
  Shield,
  Heart,
  Flower2,
  Share2,
} from 'lucide-react';
import { ColonyStrain } from '../types';
import { soundEngine } from '../audio/soundEffects';

interface StrainManagerModalProps {
  strains: ColonyStrain[];
  totalOrganisms: number;
  onClose: () => void;
  onNurtureStrain: (strainId: string) => void;
  onForgeSymbiosis: (strain1Id: string, strain2Id: string) => void;
  onDissolveSymbiosis: (strain1Id: string, strain2Id: string) => void;
  onHarmonizeAll: () => void;
}

export const StrainManagerModal: React.FC<StrainManagerModalProps> = ({
  strains,
  totalOrganisms,
  onClose,
  onNurtureStrain,
  onForgeSymbiosis,
  onDissolveSymbiosis,
  onHarmonizeAll,
}) => {
  const [selectedStrainId, setSelectedStrainId] = useState<string | null>(
    strains.length > 0 ? strains[0].id : null
  );

  const activeStrain = strains.find((s) => s.id === selectedStrainId);
  const otherStrains = strains.filter((s) => s.id !== selectedStrainId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Ledger of Clades & Sanctuaries</h2>
              <p className="text-xs text-slate-400">Ecosystem Communities, Symbiotic Covenants & Harmony</p>
            </div>
          </div>
          <button
            id="btn-close-strains-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {strains.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No living communities yet. Cultivate protozoa in the droplet to establish clades!
            </div>
          ) : (
            strains.map((strain) => {
              const dominance = totalOrganisms > 0 ? Math.round((strain.population / totalOrganisms) * 100) : 0;
              const symbioticPartners = (strain.symbioticWith || []).map((id: string) => strains.find((s) => s.id === id)?.name).filter(Boolean);

              return (
                <div
                  key={strain.id}
                  className={`bg-slate-950/70 border rounded-xl p-3.5 space-y-3 transition-all cursor-pointer ${
                    selectedStrainId === strain.id
                      ? 'border-teal-500/80 ring-1 ring-teal-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => setSelectedStrainId(strain.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-4 h-4 rounded-full shadow-md shrink-0"
                        style={{ backgroundColor: strain.color }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm text-slate-100">{strain.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-[10px] text-teal-300 font-medium">
                            {strain.stewardshipRole || 'Sanctuary Clade'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 capitalize">
                          {strain.species} Community • Gen {strain.generationsPassed} • Harmony {strain.harmonyScore ?? 100}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-400">
                        Pop: <strong className="text-slate-100">{strain.population}</strong> ({dominance}%)
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-emerald-400 inline" />
                        <strong className="text-emerald-300">Vitality {strain.vitality ?? 100}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Dominance Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${dominance}%`,
                        backgroundColor: strain.color,
                      }}
                    />
                  </div>

                  {/* Symbiotic Partner Badges */}
                  {symbioticPartners.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-sky-950/60 border border-sky-800 text-sky-300 flex items-center space-x-1 font-medium">
                        <HeartHandshake className="w-3 h-3 text-sky-400" />
                        <span>Symbiotic Covenant: {symbioticPartners.join(', ')}</span>
                      </span>
                    </div>
                  )}

                  {/* Lore / Description */}
                  {strain.lore && (
                    <p className="text-[11px] text-slate-400/90 italic line-clamp-1">
                      "{strain.lore}"
                    </p>
                  )}

                  {/* Clade Actions: Nurture & Harmonize */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900/60">
                    <span className="text-[10px] text-slate-400">
                      Shared Mutual Aid & Sustenance
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNurtureStrain(strain.id);
                          soundEngine.playChime(640);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 flex items-center space-x-1 transition-colors"
                        title="Infuse metabolic sustenance and restore all members"
                      >
                        <Flower2 className="w-3 h-3" />
                        <span>Nurture Clade</span>
                      </button>
                    </div>
                  </div>

                  {/* Mutualist Symbiosis Partnering (when selected) */}
                  {selectedStrainId === strain.id && otherStrains.length > 0 && (
                    <div className="mt-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
                      <p className="text-[11px] font-medium text-slate-300 flex items-center space-x-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />
                        <span>Symbiotic Covenants with other Clades:</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {otherStrains.map((target) => {
                          const isSymbiotic = (strain.symbioticWith || []).includes(target.id);
                          return (
                            <div
                              key={target.id}
                              className="flex items-center justify-between bg-slate-950/60 p-1.5 px-2 rounded-md border border-slate-800 text-xs"
                            >
                              <span className="text-slate-200 truncate pr-2 font-medium" style={{ color: target.color }}>
                                {target.name}
                              </span>
                              <div className="flex items-center space-x-1 shrink-0">
                                {isSymbiotic ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDissolveSymbiosis(strain.id, target.id);
                                    }}
                                    className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium"
                                  >
                                    Dissolve
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onForgeSymbiosis(strain.id, target.id);
                                      soundEngine.playChime(600);
                                    }}
                                    className="px-2 py-0.5 text-[10px] rounded bg-teal-900/40 hover:bg-teal-800/60 border border-teal-700 text-teal-300 font-semibold"
                                  >
                                    Forge Symbiosis
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => {
              onHarmonizeAll();
              soundEngine.playChime(700);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/50 hover:bg-teal-900/60 border border-teal-800 rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harmonize All Clades</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
