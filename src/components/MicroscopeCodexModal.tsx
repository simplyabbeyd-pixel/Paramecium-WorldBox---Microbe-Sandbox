import React from 'react';
import { X, BookOpen, Fish, Zap, Award, Sun, Layers } from 'lucide-react';
import { SPECIES_CONFIGS } from '../data/speciesAndTraits';

interface MicroscopeCodexModalProps {
  onClose: () => void;
}

export const MicroscopeCodexModal: React.FC<MicroscopeCodexModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-bold text-base text-slate-100">Microscope Biology Codex & Guide</h2>
              <p className="text-xs text-slate-400">Biological mechanics, food webs, and god powers</p>
            </div>
          </div>
          <button
            id="btn-close-codex"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto text-xs text-slate-300">
          {/* Section 1: The Microscopic Food Web */}
          <div>
            <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Fish className="w-4 h-4 text-sky-400" />
              <span>1. The Microscopic Food Web & Mechanics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(SPECIES_CONFIGS).map((sp) => (
                <div key={sp.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                    <strong className="text-slate-100">{sp.name}</strong>
                    <span className="text-[10px] text-slate-400 italic">({sp.category})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{sp.description}</p>
                  <p className="text-[10px] text-sky-400"><strong>Diet:</strong> {sp.diet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Paramecium Anatomy */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Paramecium Caudatum Anatomy</span>
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
              <li><strong>Cilia Fringe:</strong> Thousands of coordinated hair-like organelles producing spiral propulsion and avoidance reactions when bumping into barriers.</li>
              <li><strong>Contractile Vacuoles:</strong> Pulsating star-like hydraulic pumps (visible at both poles) expelling hypoosmotic water so the cell doesn't burst.</li>
              <li><strong>Oral Groove (Cytostome):</strong> Ciliated funnel drawing in bacteria and nutrients into food vacuoles.</li>
              <li><strong>Binary Fission:</strong> When ATP energy exceeds the threshold, Paramecia pinch transversely across the middle and divide into daughter cells!</li>
              <li><strong>Trichocysts:</strong> Defensive barbed protein harpoons fired when attacked by predators like Didinium.</li>
            </ul>
          </div>

          {/* Section 3: God Powers & Disasters */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-rose-400" />
              <span>3. God Powers & Disasters</span>
            </h3>
            <p className="text-[11px]">
              Just like WorldBox, you hold omnipotent microscopic authority over the slide:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
              <li><strong>UV Mutation Laser:</strong> Induces rare genetic traits (e.g. Gigantism, Deinococcus Shield) or bursts cells if over-exposed.</li>
              <li><strong>Penicillin Pipette:</strong> Drops bactericidal antibiotic clouds that wipe out bacterial colonies and stress protozoan membranes.</li>
              <li><strong>Hydrogen Peroxide:</strong> Releases violent bubbling oxidation fizzes that rupture cell membranes.</li>
              <li><strong>Ultrasonic Vortex:</strong> Spawns a hydrodynamic vortex cyclonically drawing all swimming creatures to the center.</li>
              <li><strong>Coverslip Press:</strong> Slams the glass coverslip down, instantly squishing specimens in the impact zone!</li>
              <li><strong>Vitality Elixir:</strong> Instantly heals cell membranes and restores maximum ATP energy.</li>
            </ul>
          </div>

          {/* Section 4: Optical Lens Modes */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>4. Microscope Optical Filters</span>
            </h3>
            <p className="text-[11px]">
              Switch filters in the top bar to inspect specimens with real scientific microscopy modes:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900 rounded-lg">
                <strong className="text-slate-200">Brightfield:</strong> Classic standard light transmission slide with natural translucency.
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <strong className="text-slate-200">Darkfield:</strong> Deep black backdrop with dazzling edge diffraction and glowing cilia.
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <strong className="text-slate-200">Phase Contrast:</strong> Inverts refractive indexes to reveal sharp cell boundaries and halo reliefs.
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <strong className="text-slate-200">GFP Fluorescent:</strong> Ultraviolet excitation causing cellular organs, green chloroplasts, and cyan nuclei to glow in the dark!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
