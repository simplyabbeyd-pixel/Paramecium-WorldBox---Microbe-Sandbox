import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Activity, Sparkles, HeartHandshake, Heart, Shield, Award } from 'lucide-react';
import { WorldEvent } from '../types';

interface EventLogTickerProps {
  events: WorldEvent[];
}

export const EventLogTicker: React.FC<EventLogTickerProps> = ({ events }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (events.length === 0) return null;

  const latestEvent = events[0];

  const getEventIcon = (type: WorldEvent['type']) => {
    switch (type) {
      case 'symbiosis':
        return <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />;
      case 'mutation':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'realm':
        return <Award className="w-3.5 h-3.5 text-teal-400" />;
      case 'blessing':
        return <Heart className="w-3.5 h-3.5 text-emerald-400" />;
      case 'milestone':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="absolute top-16 right-4 z-20 max-w-sm w-full select-none">
      {/* Minimized or Top Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg cursor-pointer flex items-center justify-between text-xs text-slate-300 hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center space-x-2 truncate mr-2">
          {getEventIcon(latestEvent.type)}
          <span className="text-[10px] text-slate-400">{latestEvent.timestamp}</span>
          <span className="truncate font-medium text-slate-200">{latestEvent.text}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-200">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded History List */}
      {isExpanded && (
        <div className="mt-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 shadow-2xl text-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">Chronicle Log</p>
          {events.slice(0, 15).map((evt) => (
            <div
              key={evt.id}
              className="flex items-start space-x-2 px-2 py-1 rounded hover:bg-slate-850/60 text-slate-300"
            >
              <span className="mt-0.5 flex-shrink-0">{getEventIcon(evt.type)}</span>
              <div className="leading-tight">
                <span className="text-[10px] text-slate-400 mr-1.5">{evt.timestamp}</span>
                <span className="text-slate-200">{evt.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
