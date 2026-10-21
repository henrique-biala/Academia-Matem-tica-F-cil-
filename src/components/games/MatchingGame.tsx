import React, { useState, useEffect } from 'react';
import { MatchingQuestion } from '../../types';
import { Check, Link2 } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: MatchingQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const MatchingGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [leftId: string]: string }>({});
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);
  const [wrongMatch, setWrongMatch] = useState<{ leftId: string; rightId: string } | null>(null);

  useEffect(() => {
    // Shuffle the right side items initially
    const rights = question.pairs.map(p => ({ id: p.id, text: p.right }));
    rights.sort(() => Math.random() - 0.5);
    setShuffledRights(rights);
    setMatchedPairs({});
  }, [question]);

  const handleSelectLeft = (pairId: string) => {
    if (answered || matchedPairs[pairId]) return;
    soundService.playClick();
    setSelectedLeft(pairId);
    if (selectedRight) {
      checkMatch(pairId, selectedRight);
    }
  };

  const handleSelectRight = (pairId: string) => {
    if (answered || Object.values(matchedPairs).includes(pairId)) return;
    soundService.playClick();
    setSelectedRight(pairId);
    if (selectedLeft) {
      checkMatch(selectedLeft, pairId);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct match!
      soundService.playCorrect();
      const updated = { ...matchedPairs, [leftId]: rightId };
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all pairs are matched
      if (Object.keys(updated).length === question.pairs.length) {
        onAnswer(true, `Associou todos os ${question.pairs.length} pares corretamente`);
      }
    } else {
      // Wrong match
      soundService.playIncorrect();
      setWrongMatch({ leftId, rightId });
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Toque num item de cada lado para associar</span>
        <span className="text-blue-600 dark:text-blue-400">
          {Object.keys(matchedPairs).length} de {question.pairs.length} pares
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conceito / Termo</p>
          {question.pairs.map(pair => {
            const isMatched = !!matchedPairs[pair.id];
            const isSelected = selectedLeft === pair.id;
            const isWrong = wrongMatch?.leftId === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => handleSelectLeft(pair.id)}
                disabled={isMatched || answered}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-bold transition-all shadow-sm flex items-center justify-between ${
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-90'
                    : isWrong
                    ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-700 animate-shake'
                    : isSelected
                    ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{pair.left}</span>
                {isMatched && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Definição / Papel</p>
          {shuffledRights.map(item => {
            const isMatched = Object.values(matchedPairs).includes(item.id);
            const isSelected = selectedRight === item.id;
            const isWrong = wrongMatch?.rightId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectRight(item.id)}
                disabled={isMatched || answered}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-medium transition-all shadow-sm flex items-center justify-between ${
                  isMatched
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-90'
                    : isWrong
                    ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-700 animate-shake'
                    : isSelected
                    ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{item.text}</span>
                {isMatched && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
