import React, { useState, useEffect } from 'react';
import { StepOrderingQuestion, StepItem } from '../../types';
import { ChevronUp, ChevronDown, Check, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: StepOrderingQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const StepOrderingGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [currentSteps, setCurrentSteps] = useState<StepItem[]>([]);

  useEffect(() => {
    // Shuffle steps initially so they are out of order
    const shuffled = [...question.steps].sort(() => Math.random() - 0.5);
    setCurrentSteps(shuffled);
  }, [question]);

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (answered) return;
    soundService.playClick();
    const newSteps = [...currentSteps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    setCurrentSteps(newSteps);
  };

  const handleVerify = () => {
    // Correct order is steps with order 1, 2, 3, 4
    const isCorrect = currentSteps.every((step, idx) => step.order === idx + 1);
    const summary = currentSteps.map(s => s.text).join(' -> ');
    onAnswer(isCorrect, summary);
  };

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Utilize as setas para colocar os passos na sequência cronológica correta:
      </p>

      <div className="space-y-3">
        {currentSteps.map((step, idx) => {
          const isCorrectPosition = step.order === idx + 1;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 shadow-sm ${
                answered
                  ? isCorrectPosition
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center flex-shrink-0">
                  {idx + 1}º
                </span>
                <span className="text-sm sm:text-base font-semibold">{step.text}</span>
              </div>

              {!answered ? (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveStep(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(idx, 'down')}
                    disabled={idx === currentSteps.length - 1}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                isCorrectPosition && <Check className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {!answered && (
        <button
          onClick={handleVerify}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-md flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
        >
          <Sparkles className="w-5 h-5" />
          Confirmar Ordem dos Passos
        </button>
      )}
    </div>
  );
};
