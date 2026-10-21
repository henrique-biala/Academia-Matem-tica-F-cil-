import React, { useState } from 'react';
import { ErrorCorrectionQuestion } from '../../types';
import { AlertTriangle, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  question: ErrorCorrectionQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const ErrorCorrectionGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (optionId: string, text: string) => {
    if (answered) return;
    setSelectedId(optionId);
    const isCorrect = optionId === question.correctOptionId;
    onAnswer(isCorrect, text);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Box with warning accent */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-900/60 space-y-2">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4" />
          <span>Cenário com Erro / Conduta de Risco:</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 italic">
          "{question.scenarioText}"
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-300 font-bold pt-1">
          ⚠️ Problema: {question.mistakeDescription}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Qual é a conduta correta e segura para resolver esta situação?
        </p>

        {question.options.map(option => {
          let style = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-400';

          if (answered) {
            if (option.id === question.correctOptionId) {
              style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500';
            } else if (option.id === selectedId) {
              style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
            } else {
              style = 'opacity-40 border-slate-200 dark:border-slate-700';
            }
          } else if (selectedId === option.id) {
            style = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.text)}
              disabled={answered}
              className={`w-full p-4 rounded-2xl border-2 text-left font-semibold text-sm sm:text-base transition-all flex items-center justify-between gap-3 shadow-sm active:scale-[0.99] ${style}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <span>{option.text}</span>
              </div>
              <div>
                {answered && option.id === question.correctOptionId ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                ) : selectedId === option.id ? (
                  <Circle className="w-6 h-6 text-emerald-500 fill-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
