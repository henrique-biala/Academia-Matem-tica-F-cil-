import React, { useState } from 'react';
import { PracticalSimulatorQuestion } from '../../types';
import { CheckCircle2, Circle, Sparkles, FolderPlus, Bold, Italic, AlignCenter, Calculator } from 'lucide-react';
import { soundService } from '../../services/sound';

interface Props {
  question: PracticalSimulatorQuestion;
  onAnswer: (isCorrect: boolean, summary: string) => void;
  answered: boolean;
}

export const PracticalSimulatorGame: React.FC<Props> = ({ question, onAnswer, answered }) => {
  // Simulator states
  // For Excel:
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [c5CalculatedValue, setC5CalculatedValue] = useState<string>('');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  // For Word:
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  // For Windows:
  const [folders, setFolders] = useState<string[]>(['Documentos', 'Transferências']);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Handle cell click in Excel simulator
  const handleCellClick = (cellId: string) => {
    if (answered) return;
    soundService.playClick();
    setSelectedCell(cellId);

    if (cellId === 'C5') {
      if (!completedTaskIds.includes('t1')) {
        setCompletedTaskIds(prev => [...prev, 't1']);
      }
    }
  };

  // Insert formula in Excel
  const handleInsertSum = () => {
    if (answered || selectedCell !== 'C5') return;
    soundService.playClick();
    setFormulaInput('=SOMA(C2:C4)');
    if (!completedTaskIds.includes('t2')) {
      setCompletedTaskIds(prev => [...prev, 't2']);
    }
  };

  // Press Enter to confirm calculation
  const handleConfirmExcelFormula = () => {
    if (answered) return;
    const cleanFormula = formulaInput.trim().toUpperCase();

    if (cleanFormula === '=SOMA(C2:C4)' || cleanFormula === '=SUM(C2:C4)' || cleanFormula === '=C2+C3+C4') {
      soundService.playCorrect();
      setC5CalculatedValue('50');
      const finalTasks = [...new Set([...completedTaskIds, 't1', 't2', 't3'])];
      setCompletedTaskIds(finalTasks);
      onAnswer(true, 'Fórmula =SOMA(C2:C4) calculada com sucesso (Total: 50)');
    } else {
      soundService.playIncorrect();
      alert('Fórmula inválida! Utilize: =SOMA(C2:C4)');
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist of Tasks to Complete */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Tarefas do Simulador:
        </p>
        <div className="space-y-1.5">
          {question.tasks.map(task => {
            const isDone = completedTaskIds.includes(task.id) || answered;
            return (
              <div key={task.id} className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span className={isDone ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-slate-700 dark:text-slate-200'}>
                  {task.instruction}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- EXCEL SIMULATOR ENVIRONMENT --- */}
      {question.appEnvironment === 'excel_sheet' && (
        <div className="rounded-2xl border-2 border-emerald-600 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {/* Excel Ribbon Top Bar */}
          <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-800 px-2 py-0.5 rounded">Excel</span>
              <span>Notas_Turma_AMEF.xlsx</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInsertSum}
                disabled={selectedCell !== 'C5' || answered}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-all"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>AutoSoma (Σ)</span>
              </button>
            </div>
          </div>

          {/* Formula Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-mono font-bold w-10 text-center bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">
              {selectedCell || 'A1'}
            </span>
            <span className="font-bold text-slate-400">fx</span>
            <input
              type="text"
              value={formulaInput}
              onChange={e => setFormulaInput(e.target.value)}
              placeholder="Digite a fórmula aqui (ex: =SOMA(C2:C4))..."
              disabled={answered}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmExcelFormula();
              }}
              className="flex-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={handleConfirmExcelFormula}
              disabled={answered || !formulaInput}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
            >
              Enter ↵
            </button>
          </div>

          {/* Spreadsheet Table */}
          <div className="overflow-x-auto p-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                  <th className="w-8 border border-slate-300 dark:border-slate-700 p-1"></th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1">A</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1">B (Matemática)</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-1">C (Informática)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-slate-100 dark:bg-slate-800 text-center font-mono border border-slate-300 dark:border-slate-700 text-slate-400">1</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold">Aluno</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-center">Nota 1</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-center">Nota 2</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 dark:bg-slate-800 text-center font-mono border border-slate-300 dark:border-slate-700 text-slate-400">2</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2">Manuel Domingos</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">15</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center bg-blue-50/50 dark:bg-blue-950/20">16</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 dark:bg-slate-800 text-center font-mono border border-slate-300 dark:border-slate-700 text-slate-400">3</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2">Teresa Kissonde</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">18</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center bg-blue-50/50 dark:bg-blue-950/20">19</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 dark:bg-slate-800 text-center font-mono border border-slate-300 dark:border-slate-700 text-slate-400">4</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2">António Biala</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">14</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center bg-blue-50/50 dark:bg-blue-950/20">15</td>
                </tr>
                <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 font-bold">
                  <td className="bg-slate-100 dark:bg-slate-800 text-center font-mono border border-slate-300 dark:border-slate-700 text-slate-400">5</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-emerald-800 dark:text-emerald-300">TOTAL DA TURMA</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">47</td>
                  {/* Target Cell C5 */}
                  <td
                    onClick={() => handleCellClick('C5')}
                    className={`border-2 p-2 text-center cursor-pointer transition-all ${
                      selectedCell === 'C5'
                        ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/60 ring-2 ring-emerald-400'
                        : 'border-dashed border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {c5CalculatedValue ? (
                      <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
                        {c5CalculatedValue}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Clique aqui (C5)</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
