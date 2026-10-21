import React, { useState, useEffect } from 'react';
import { MemoryGameQuestion } from '../../types';
import { soundService } from '../../services/sound';
import { Check, HelpCircle } from 'lucide-react';

interface Props {
  question: MemoryGameQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

interface CardItem {
  id: string; // unique card id
  pairId: string;
  content: string;
}

export const MemoryGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);

  useEffect(() => {
    // Generate two cards per pair: one for concept, one for definitionOrIcon
    const deck: CardItem[] = [];
    question.pairs.forEach((pair, idx) => {
      deck.push({ id: `card-${idx}-a`, pairId: pair.id, content: pair.concept });
      deck.push({ id: `card-${idx}-b`, pairId: pair.id, content: pair.definitionOrIcon });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMovesCount(0);
  }, [question]);

  const handleCardClick = (index: number) => {
    if (
      answered ||
      flippedIndices.includes(index) ||
      matchedPairIds.includes(cards[index].pairId) ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    soundService.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount(prev => prev + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.pairId === card2.pairId) {
        // Matched!
        soundService.playCorrect();
        const updatedMatches = [...matchedPairIds, card1.pairId];
        setMatchedPairIds(updatedMatches);
        setFlippedIndices([]);

        if (updatedMatches.length === question.pairs.length) {
          onAnswer(true, `Encontrou todos os pares em ${movesCount + 1} tentativas`);
        }
      } else {
        // Mismatch - flip back after brief delay
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Toque nas cartas para encontrar os pares correspondentes:</span>
        <span className="text-blue-600 dark:text-blue-400">
          Pares: {matchedPairIds.length} / {question.pairs.length} | Tentativas: {movesCount}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isMatched || answered}
              className={`h-24 sm:h-28 rounded-2xl border-2 transition-all duration-300 font-bold text-xs sm:text-sm p-3 flex flex-col items-center justify-center text-center shadow-md select-none active:scale-95 ${
                isMatched
                  ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                  : isFlipped
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
                  : 'border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:border-blue-400 text-slate-400'
              }`}
            >
              {isFlipped ? (
                <div className="animate-in zoom-in-75 space-y-1">
                  <p>{card.content}</p>
                  {isMatched && <Check className="w-4 h-4 text-emerald-600 mx-auto" />}
                </div>
              ) : (
                <HelpCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
