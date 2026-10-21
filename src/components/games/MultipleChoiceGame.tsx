import React, { useState } from 'react';
import { MultipleChoiceQuestion } from '../../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  question: MultipleChoiceQuestion;
  onAnswer: (isCorrect: boolean, chosenText: string) => void;
  answered: boolean;
}

export const MultipleChoiceGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);
    const isCorrect = idx === question.correctAnswerIndex;
    onAnswer(isCorrect, question.options[idx]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          let optionStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20';

          if (answered) {
            if (idx === question.correctAnswerIndex) {
              optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500';
            } else if (idx === selectedIndex) {
              optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
            } else {
              optionStyle = 'opacity-50 border-slate-200 dark:border-slate-700';
            }
          } else if (selectedIndex === idx) {
            optionStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-base font-semibold shadow-sm active:scale-[0.99] ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              <div>
                {answered && idx === question.correctAnswerIndex ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : selectedIndex === idx ? (
                  <Circle className="w-6 h-6 text-blue-500 fill-blue-500" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
