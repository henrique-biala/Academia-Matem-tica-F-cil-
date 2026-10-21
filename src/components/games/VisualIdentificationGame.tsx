import React, { useState } from 'react';
import { VisualIdentificationQuestion } from '../../types';
import { Check, X, Search, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: VisualIdentificationQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const VisualIdentificationGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const handleHotspotClick = (hotspotId: string, label: string) => {
    if (answered) return;
    soundService.playClick();
    setSelectedHotspotId(hotspotId);
    const isCorrect = hotspotId === question.targetHotspotId;
    onAnswer(isCorrect, label);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
        <Search className="w-4 h-4 flex-shrink-0" />
        <span>Toque diretamente no elemento visual correspondente na imagem abaixo:</span>
      </div>

      {/* Interactive Mockup Container */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border-4 border-slate-700 overflow-hidden shadow-2xl select-none">
        
        {/* Visual Mockup: Windows 11 Desktop Style */}
        {question.visualType === 'windows_desktop' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-cover bg-center p-3">
            {/* Desktop Wallpaper Graphic */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600 via-indigo-900 to-slate-950 opacity-90" />

            {/* Desktop Icons */}
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col items-center w-16 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="text-2xl">💻</span>
                <span className="text-[10px] text-white font-medium text-center shadow-black drop-shadow-md">Este PC</span>
              </div>
              <div className="flex flex-col items-center w-16 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="text-2xl">🗑️</span>
                <span className="text-[10px] text-white font-medium text-center shadow-black drop-shadow-md">Reciclagem</span>
              </div>
            </div>

            {/* Bottom Taskbar */}
            <div className="relative z-10 w-full h-12 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between px-3">
              {/* Left/Center Icons */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 font-black">
                  🪟
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md text-[11px] text-slate-400">
                  <Search className="w-3 h-3" />
                  <span>Pesquisar...</span>
                </div>
                <span className="text-lg">📁</span>
                <span className="text-lg">🌐</span>
                <span className="text-lg">📝</span>
              </div>

              {/* System Tray */}
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold bg-slate-800/40 px-2 py-1 rounded-lg">
                <span>ENG</span>
                <span>🔊</span>
                <span>📶</span>
                <span>14:30</span>
              </div>
            </div>
          </div>
        )}

        {/* Clickable Hotspots Overlay */}
        {question.hotspots.map(spot => {
          const isSelected = selectedHotspotId === spot.id;
          const isTarget = spot.id === question.targetHotspotId;

          let badgeStyle = 'bg-blue-500/80 hover:bg-blue-400 text-white ring-2 ring-white/80 animate-pulse';

          if (answered) {
            if (isTarget) {
              badgeStyle = 'bg-emerald-500 text-white ring-4 ring-emerald-300 scale-110';
            } else if (isSelected) {
              badgeStyle = 'bg-rose-500 text-white ring-4 ring-rose-300';
            } else {
              badgeStyle = 'opacity-30 bg-slate-600 text-white';
            }
          }

          return (
            <button
              key={spot.id}
              onClick={() => handleHotspotClick(spot.id, spot.label)}
              disabled={answered}
              style={{
                left: `${spot.xPercent}%`,
                top: `${spot.yPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-30 p-2 sm:px-3 sm:py-1.5 rounded-full font-black text-xs transition-all shadow-xl flex items-center gap-1.5 ${badgeStyle}`}
            >
              {answered && isTarget ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : answered && isSelected && !isTarget ? (
                <X className="w-4 h-4 stroke-[3]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="whitespace-nowrap">{spot.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
