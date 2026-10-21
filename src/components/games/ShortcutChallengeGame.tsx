import React, { useState, useEffect } from 'react';
import { ShortcutQuestion } from '../../types';
import { Keyboard, Sparkles, Check, RotateCcw } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: ShortcutQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const ShortcutChallengeGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  // Keyboard layout keys to display
  const keyRows = [
    ['Esc', 'F1', 'F2', 'F5', 'F12'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Win', 'Shift'],
    ['Ctrl', 'Alt', 'Espaço', 'Alt Gr', 'Ctrl', 'Delete'],
  ];

  // Listen to physical keyboard events as well!
  useEffect(() => {
    if (answered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts during game so user can press Ctrl+S without saving HTML
      if (e.ctrlKey || e.metaKey || e.key === 'Tab') {
        e.preventDefault();
      }

      const active: string[] = [];
      if (e.ctrlKey || e.metaKey) active.push('Ctrl');
      if (e.altKey) active.push('Alt');
      if (e.shiftKey) active.push('Shift');

      const keyChar = e.key.toUpperCase();
      if (keyChar !== 'CONTROL' && keyChar !== 'ALT' && keyChar !== 'SHIFT') {
        active.push(keyChar);
      }

      if (active.length > 0) {
        setPressedKeys(active);
        checkKeys(active);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answered, question]);

  const handleVirtualKeyClick = (key: string) => {
    if (answered) return;
    soundService.playClick();

    let updated: string[];
    if (pressedKeys.includes(key)) {
      updated = pressedKeys.filter(k => k !== key);
    } else {
      updated = [...pressedKeys, key];
    }

    setPressedKeys(updated);
  };

  const handleReset = () => {
    if (answered) return;
    setPressedKeys([]);
  };

  const checkKeys = (keys: string[]) => {
    const required = question.requiredKeys.map(k => k.toUpperCase());
    const entered = keys.map(k => k.toUpperCase());

    const isMatch =
      required.length === entered.length &&
      required.every(k => entered.includes(k));

    if (isMatch) {
      onAnswer(true, keys.join(' + '));
    }
  };

  const handleVerify = () => {
    const required = question.requiredKeys.map(k => k.toUpperCase());
    const entered = pressedKeys.map(k => k.toUpperCase());

    const isMatch =
      required.length === entered.length &&
      required.every(k => entered.includes(k));

    onAnswer(isMatch, pressedKeys.join(' + '));
  };

  return (
    <div className="space-y-6">
      {/* Target Action Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-extrabold">
              Ação a executar:
            </p>
            <p className="font-black text-base sm:text-lg text-slate-800 dark:text-white">
              {question.actionName}
            </p>
          </div>
        </div>

        {/* Current Keys Display */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner min-w-[110px] justify-center">
          {pressedKeys.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Pressione as teclas...</span>
          ) : (
            pressedKeys.map((k, i) => (
              <React.Fragment key={k}>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-black text-xs shadow-sm">
                  {k}
                </span>
                {i < pressedKeys.length - 1 && <span className="text-slate-400 font-bold text-xs">+</span>}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Interactive Keyboard */}
      <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
          <span>Pode clicar nas teclas ou premir no teclado do seu computador:</span>
          {!answered && pressedKeys.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>

        {keyRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((keyName, kIdx) => {
              const isPressed = pressedKeys.map(k => k.toUpperCase()).includes(keyName.toUpperCase());
              const isTargetKey = question.requiredKeys.map(k => k.toUpperCase()).includes(keyName.toUpperCase());

              let keyStyle = 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-b-4 border-slate-300 dark:border-slate-900 active:border-b-0 active:translate-y-1';

              if (answered) {
                if (isTargetKey) {
                  keyStyle = 'bg-emerald-500 text-white border-b-4 border-emerald-700';
                } else {
                  keyStyle = 'opacity-30 bg-slate-200 dark:bg-slate-800 text-slate-400';
                }
              } else if (isPressed) {
                keyStyle = 'bg-blue-600 text-white border-b-4 border-blue-800 translate-y-0.5 shadow-md shadow-blue-500/30';
              }

              // Width sizing for special keys
              const isWide = ['Ctrl', 'Shift', 'Caps', 'Tab', 'Enter', 'Espaço'].includes(keyName);
              const widthClass = keyName === 'Espaço' ? 'flex-1 max-w-xs' : isWide ? 'px-3 sm:px-4' : 'w-8 sm:w-11';

              return (
                <button
                  key={`${keyName}-${kIdx}`}
                  type="button"
                  onClick={() => handleVirtualKeyClick(keyName)}
                  disabled={answered}
                  className={`h-9 sm:h-11 rounded-lg font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all select-none ${widthClass} ${keyStyle}`}
                >
                  {keyName}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Verify Button */}
      {!answered && (
        <button
          onClick={handleVerify}
          disabled={pressedKeys.length === 0}
          className={`w-full py-4 rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 transition-all ${
            pressedKeys.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:translate-y-0.5'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Testar Atalho
        </button>
      )}
    </div>
  );
};
