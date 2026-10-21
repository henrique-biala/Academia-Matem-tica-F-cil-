import React, { useState } from 'react';
import { TrueFalseQuestion } from '../../types';
import { Check, X } from 'lucide-react';

interface Props {
  question: TrueFalseQuestion;
  onAnswer: (isCorrect: boolean, chosenText: string) => void;
  answered: boolean;
}

export const TrueFalseGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleChoose = (choice: boolean) => {
    if (answered) return;
    setSelected(choice);
    const isCorrect = choice === question.isTrue;
    onAnswer(isCorrect, choice ? 'Verdadeiro' : 'Falso');
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 italic">
          "{question.statement}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Verdadeiro */}
        <button
          onClick={() => handleChoose(true)}
          disabled={answered}
          className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 transition-all font-black text-lg shadow-md active:translate-y-1 ${
            answered
              ? question.isTrue
                ? 'border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-300 dark:ring-emerald-900'
                : selected === true
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'opacity-40 border-slate-200 dark:border-slate-700 text-slate-400'
              : selected === true
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
              : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/70 hover:border-emerald-400'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span>VERDADEIRO</span>
        </button>

        {/* Falso */}
        <button
          onClick={() => handleChoose(false)}
          disabled={answered}
          className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 transition-all font-black text-lg shadow-md active:translate-y-1 ${
            answered
              ? !question.isTrue
                ? 'border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-300 dark:ring-emerald-900'
                : selected === false
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'opacity-40 border-slate-200 dark:border-slate-700 text-slate-400'
              : selected === false
              ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100/70 hover:border-rose-400'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300">
            <X className="w-8 h-8 stroke-[3]" />
          </div>
          <span>FALSO</span>
        </button>
      </div>
    </div>
  );
};
