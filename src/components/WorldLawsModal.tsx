import React from 'react';
import {
  X,
  Scale,
  Utensils,
  Hourglass,
  Dna,
  Sparkles,
  Zap,
  ShieldCheck,
  Flower2,
  HeartHandshake,
} from 'lucide-react';
import { WorldLaws } from '../types';
import { soundEngine } from '../audio/soundEffects';

interface WorldLawsModalProps {
  laws: WorldLaws;
  onUpdateLaw: (key: keyof WorldLaws, value: boolean) => void;
  onClose: () => void;
}

export const WorldLawsModal: React.FC<WorldLawsModalProps> = ({
  laws,
  onUpdateLaw,
  onClose,
}) => {
  const LAW_DEFINITIONS: {
    key: keyof WorldLaws;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'hungerEnabled',
      title: 'Creature Sustenance',
      description: 'Entities consume metabolic energy over time and nourish themselves on nutrients or bacterial flora.',
      icon: <Utensils className="w-5 h-5" />,
      color: 'text-amber-400',
    },
    {
      key: 'agingEnabled',
      title: 'Life Cycles & Gentle Aging',
      description: 'Mortal entities age and peacefully dissolve into stardust when their journey concludes.',
      icon: <Hourglass className="w-5 h-5" />,
      color: 'text-rose-400',
    },
    {
      key: 'communitySymbiosis',
      title: 'Inter-Clade Symbiosis',
      description: 'Communities form mutualistic covenants, share glucose nectar, and appoint Elder Sanctuary Guides.',
      icon: <HeartHandshake className="w-5 h-5" />,
      color: 'text-sky-400',
    },
    {
      key: 'spontaneousMutations',
      title: 'Spontaneous Adaptations',
      description: 'Offspring occasionally develop beneficial metabolic traits during gentle binary fission.',
      icon: <Dna className="w-5 h-5" />,
      color: 'text-emerald-400',
    },
    {
      key: 'gravitationalDrift',
      title: 'Celestial Water Currents',
      description: 'Micro-currents and gentle convective eddies carry wandering protozoa and nourishment gracefully.',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-indigo-400',
    },
    {
      key: 'superMitosis',
      title: 'Flourishing Fission & Rapid Growth',
      description: 'Cells replenish energy at accelerated rates and split into thriving descendant generations.',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-400',
    },
    {
      key: 'sanctuaryBlessing',
      title: 'Sanctuary Harmony Covenant',
      description: 'Maintains universal peaceful coexistence, preventing friction and empowering mutual aid.',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-teal-400',
    },
    {
      key: 'starlightNectarBlooms',
      title: 'Celestial Nectar Showers',
      description: 'Spontaneous starlight blooms shower the photic zone with energizing nutrient dew.',
      icon: <Flower2 className="w-5 h-5" />,
      color: 'text-pink-400',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">World Laws of Paramecia</h2>
              <p className="text-xs text-slate-400">Enforce universal statutes and cosmological rules</p>
            </div>
          </div>
          <button
            id="btn-close-world-laws"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Laws List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {LAW_DEFINITIONS.map((law) => {
            const isEnabled = laws[law.key];

            return (
              <div
                key={law.key}
                id={`law-${law.key}`}
                onClick={() => {
                  soundEngine.playLensClick();
                  onUpdateLaw(law.key, !isEnabled);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isEnabled
                    ? 'bg-slate-800/60 border-slate-700 shadow-sm'
                    : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start space-x-3 pr-4">
                  <div className={`mt-0.5 ${law.color}`}>{law.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100 flex items-center space-x-2">
                      <span>{law.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{law.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                    isEnabled ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Universe rules apply in real time to all living entities.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
          >
            Confirm Laws
          </button>
        </div>
      </div>
    </div>
  );
};
