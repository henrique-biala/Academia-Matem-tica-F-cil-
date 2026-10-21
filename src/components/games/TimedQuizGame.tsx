import React, { useState, useEffect } from 'react';
import { TimedQuizQuestion } from '../../types';
import { Timer, Zap, CheckCircle2, Circle } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: TimedQuizQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const TimedQuizGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const duration = question.durationSeconds || 15;
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
    setSelectedIndex(null);
  }, [question, duration]);

  useEffect(() => {
    if (answered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired!
          soundService.playIncorrect();
          onAnswer(false, 'Tempo esgotado');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, timeLeft, onAnswer]);

  const handleSelect = (idx: number) => {
    if (answered || timeLeft <= 0) return;
    setSelectedIndex(idx);
    const isCorrect = idx === question.correctAnswerIndex;
    const speedBonus = timeLeft > duration / 2 ? ' (+Bónus de Velocidade!)' : '';
    onAnswer(isCorrect, `${question.options[idx]}${isCorrect ? speedBonus : ''}`);
  };

  const percentLeft = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="space-y-5">
      {/* Timer Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={`flex items-center gap-1 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
            <Timer className="w-4 h-4" />
            Tempo Restante: {timeLeft}s
          </span>
          {timeLeft > duration / 2 && (
            <span className="flex items-center gap-1 text-emerald-500 text-[11px]">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" /> Bónus ativo
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          let style = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-400';

          if (answered) {
            if (idx === question.correctAnswerIndex) {
              style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500';
            } else if (idx === selectedIndex) {
              style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
            } else {
              style = 'opacity-40 border-slate-200 dark:border-slate-700';
            }
          } else if (selectedIndex === idx) {
            style = 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered || timeLeft <= 0}
              className={`w-full p-4 rounded-2xl border-2 text-left font-semibold text-base transition-all flex items-center justify-between shadow-sm active:scale-[0.99] ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {answered && idx === question.correctAnswerIndex ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : selectedIndex === idx ? (
                <Circle className="w-6 h-6 text-amber-500 fill-amber-500" />
              ) : (
                <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
