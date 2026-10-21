import React, { useState } from 'react';
import { OpenQuestion } from '../../types';
import { PenLine, Sparkles, BookOpenCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  question: OpenQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const OpenQuestionGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [userText, setUserText] = useState('');

  const wordCount = userText.trim() === '' ? 0 : userText.trim().split(/\s+/).length;
  const minWords = question.minWords || 8;

  const handleSubmit = () => {
    if (answered || wordCount < minWords) return;

    // Check how many of the required keywords were included
    const textLower = userText.toLowerCase();
    const matchedKeywords = question.requiredKeywords.filter(kw => textLower.includes(kw.toLowerCase()));

    // If at least 2 keywords or 50% matched, consider it successful
    const isPassing = matchedKeywords.length >= Math.min(2, question.requiredKeywords.length);
    onAnswer(isPassing, `Resposta escrita (${wordCount} palavras, conceitos: ${matchedKeywords.join(', ') || 'Nenhum detetado'})`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1.5">
            <PenLine className="w-4 h-4 text-blue-500" />
            Escreva a sua resposta com as suas próprias palavras:
          </span>
          <span className={wordCount >= minWords ? 'text-emerald-500' : 'text-slate-400'}>
            {wordCount} / mín. {minWords} palavras
          </span>
        </div>

        <textarea
          rows={4}
          value={userText}
          onChange={e => setUserText(e.target.value)}
          disabled={answered}
          placeholder="Comece a redigir aqui a sua explicação..."
          className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-inner"
        />
      </div>

      {/* Model Answer Box when answered */}
      {answered && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
            <BookOpenCheck className="w-4 h-4" />
            <span>Resposta Exemplar Recomendada pela AMEF:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic font-medium">
            "{question.sampleIdealAnswer}"
          </p>
        </div>
      )}

      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={wordCount < minWords}
          className={`w-full py-4 rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 transition-all ${
            wordCount >= minWords
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:translate-y-0.5'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Submeter Resposta
        </button>
      )}
    </div>
  );
};
