import React, { useState, useEffect } from 'react';
import { FillInBlanksQuestion } from '../../types';
import { soundService } from '../../services/sound';
import { Sparkles, RotateCcw } from 'lucide-react';

interface Props {
  question: FillInBlanksQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const FillInTheBlanksGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  // Parse sentence to identify parts and blanks
  // sentenceWithGaps has words in [word]
  const [selectedWords, setSelectedWords] = useState<{ [index: number]: string }>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Split sentence by [words]
  const regex = /\[(.*?)\]/g;
  const sentenceSegments = question.sentenceWithGaps.split(regex);
  const correctBlanks = question.blanks.map(b => b.word.toLowerCase().trim());
  const blankCount = question.blanks.length;

  useEffect(() => {
    setSelectedWords({});
    // Shuffle options pool
    const pool = [...question.optionsPool].sort(() => Math.random() - 0.5);
    setAvailableWords(pool);
  }, [question]);

  const handleWordClick = (word: string) => {
    if (answered) return;
    soundService.playClick();

    // Find first empty blank slot
    for (let i = 0; i < blankCount; i++) {
      if (!selectedWords[i]) {
        setSelectedWords(prev => ({ ...prev, [i]: word }));
        setAvailableWords(prev => {
          const idx = prev.indexOf(word);
          if (idx !== -1) {
            const next = [...prev];
            next.splice(idx, 1);
            return next;
          }
          return prev;
        });
        return;
      }
    }
  };

  const handleBlankClick = (slotIndex: number) => {
    if (answered) return;
    const word = selectedWords[slotIndex];
    if (!word) return;

    soundService.playClick();
    const updated = { ...selectedWords };
    delete updated[slotIndex];
    setSelectedWords(updated);
    setAvailableWords(prev => [...prev, word]);
  };

  const handleReset = () => {
    if (answered) return;
    setSelectedWords({});
    setAvailableWords([...question.optionsPool].sort(() => Math.random() - 0.5));
  };

  const handleVerify = () => {
    const isAllCorrect = question.blanks.every((blank, idx) => {
      const userWord = (selectedWords[idx] || '').toLowerCase().trim();
      return userWord === blank.word.toLowerCase().trim();
    });

    const summary = Object.values(selectedWords).join(', ');
    onAnswer(isAllCorrect, `Preencheu com: ${summary}`);
  };

  const allFilled = Object.keys(selectedWords).length === blankCount;

  return (
    <div className="space-y-6">
      {/* Interactive Sentence Container */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 leading-relaxed text-lg font-medium text-slate-800 dark:text-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {sentenceSegments.map((segment, idx) => {
            // Even segments are regular text, odd segments are blanks
            if (idx % 2 === 0) {
              return <span key={idx}>{segment}</span>;
            } else {
              const blankIndex = Math.floor(idx / 2);
              const filledWord = selectedWords[blankIndex];
              const isCorrectSlot = filledWord && filledWord.toLowerCase().trim() === correctBlanks[blankIndex];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBlankClick(blankIndex)}
                  disabled={answered}
                  className={`min-w-[100px] h-10 px-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center shadow-sm ${
                    answered
                      ? isCorrectSlot
                        ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : filledWord
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 animate-in zoom-in-95'
                      : 'border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  {filledWord || '_______'}
                </button>
              );
            }
          })}
        </div>
      </div>

      {/* Word Options Pool */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Banco de Palavras (Toque para preencher)
          </p>
          {!answered && Object.keys(selectedWords).length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recomeçar
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[70px]">
          {availableWords.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              onClick={() => handleWordClick(word)}
              disabled={answered}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm border border-slate-200 dark:border-slate-600 transition-all active:scale-95"
            >
              {word}
            </button>
          ))}
          {availableWords.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">Todas as palavras foram posicionadas!</p>
          )}
        </div>
      </div>

      {/* Verify Action Button */}
      {!answered && (
        <button
          onClick={handleVerify}
          disabled={!allFilled}
          className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-md ${
            allFilled
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:translate-y-0.5'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Verificar Frase
        </button>
      )}
    </div>
  );
};
