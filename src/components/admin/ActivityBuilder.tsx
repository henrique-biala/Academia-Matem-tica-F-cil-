import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Save,
  Archive,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import {
  ActivityItem,
  ModuleItem,
  GameType,
  ActivityDifficulty,
  ActivityStatus,
  AnyQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
  ShortcutQuestion,
} from '../../types';
import { dbService } from '../../services/db';
import { soundService } from '../../services/sound';
import { ActivityPlayer } from '../student/ActivityPlayer';

const GAME_TYPE_LABELS: { [key in GameType]: string } = {
  multiple_choice: '1. Escolha Múltipla',
  true_false: '2. Verdadeiro ou Falso',
  matching: '3. Associação de Pares',
  fill_in_blanks: '4. Completar Frases',
  step_ordering: '5. Ordenar Passos',
  visual_identification: '6. Identificar Elementos em Imagens',
  timed_quiz: '7. Quiz Cronometrado',
  error_correction: '8. Corrigir Erros',
  shortcut_challenge: '9. Desafio de Atalhos',
  practical_simulator: '10. Simuladores Práticos',
  open_question: '11. Perguntas Abertas',
  memory_game: '12. Jogo da Memória',
  final_boss: '13. Desafio Final do Módulo',
};

export const ActivityBuilder: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<ActivityItem | null>(null);

  // Form State
  const [currentAct, setCurrentAct] = useState<Partial<ActivityItem>>({
    id: '',
    title: '',
    topic: '',
    description: '',
    instructions: '',
    moduleId: 'mod-1',
    difficulty: 'Fácil',
    gameType: 'multiple_choice',
    xpReward: 35,
    minPassScore: 70,
    timeLimitSeconds: 0,
    maxAttempts: 0,
    status: 'published',
    order: 1,
    questions: [],
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const loadData = async () => {
    const [acts, mods] = await Promise.all([
      dbService.getActivities(),
      dbService.getModules(),
    ]);
    setActivities(acts);
    setModules(mods);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    soundService.playClick();
    const newId = `act-${Date.now()}`;
    const defaultQ: MultipleChoiceQuestion = {
      id: `q-${Date.now()}-1`,
      gameType: 'multiple_choice',
      prompt: 'Qual é a função do atalho Ctrl+C?',
      explanation: 'O atalho Ctrl+C copia o texto ou ficheiro selecionado para a Área de Transferência.',
      options: ['Copiar', 'Colar', 'Cortar', 'Cancelar'],
      correctAnswerIndex: 0,
    };

    setCurrentAct({
      id: newId,
      title: 'Nova Atividade Interativa',
      topic: 'Conceito Fundamental',
      description: 'Pratique este exercício para reforçar a aprendizagem.',
      instructions: 'Selecione a opção correta para avançar.',
      moduleId: modules[0]?.id || 'mod-1',
      difficulty: 'Fácil',
      gameType: 'multiple_choice',
      xpReward: 35,
      minPassScore: 70,
      timeLimitSeconds: 0,
      maxAttempts: 0,
      status: 'published',
      order: activities.length + 1,
      questions: [defaultQ],
    });
    setActiveQuestionIndex(0);
    setIsEditing(true);
  };

  const handleEdit = (act: ActivityItem) => {
    soundService.playClick();
    setCurrentAct(JSON.parse(JSON.stringify(act)));
    setActiveQuestionIndex(0);
    setIsEditing(true);
  };

  const handleDuplicate = async (act: ActivityItem) => {
    soundService.playClick();
    const duplicated: ActivityItem = {
      ...JSON.parse(JSON.stringify(act)),
      id: `act-${Date.now()}`,
      title: `${act.title} (Cópia)`,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveActivity(duplicated);
    await loadData();
    alert('Atividade duplicada com sucesso!');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem a certeza de que deseja eliminar esta atividade?')) {
      soundService.playClick();
      await dbService.deleteActivity(id);
      await loadData();
    }
  };

  const handleSave = async () => {
    if (!currentAct.title || !currentAct.moduleId) {
      alert('Por favor, preencha o título e selecione o módulo.');
      return;
    }

    if (!currentAct.questions || currentAct.questions.length === 0) {
      alert('A atividade deve conter pelo menos uma pergunta.');
      return;
    }

    soundService.playCorrect();
    const fullAct = {
      ...currentAct,
      updatedAt: new Date().toISOString(),
    } as ActivityItem;

    await dbService.saveActivity(fullAct);
    await loadData();
    setIsEditing(false);
  };

  const addQuestion = () => {
    soundService.playClick();
    const gType = currentAct.gameType || 'multiple_choice';
    let newQ: AnyQuestion;

    if (gType === 'true_false') {
      newQ = {
        id: `q-${Date.now()}`,
        gameType: 'true_false',
        prompt: 'Nova afirmação para o aluno avaliar:',
        statement: 'A memória RAM é volátil.',
        isTrue: true,
        explanation: 'Explicação detalhada da afirmação.',
      } as TrueFalseQuestion;
    } else if (gType === 'matching') {
      newQ = {
        id: `q-${Date.now()}`,
        gameType: 'matching',
        prompt: 'Associe os conceitos correspondentes:',
        explanation: 'Explicação pedagógica dos pares.',
        pairs: [
          { id: 'p1', left: 'CPU', right: 'Processador' },
          { id: 'p2', left: 'RAM', right: 'Memória de Trabalho' },
        ],
      } as MatchingQuestion;
    } else if (gType === 'shortcut_challenge') {
      newQ = {
        id: `q-${Date.now()}`,
        gameType: 'shortcut_challenge',
        prompt: 'Qual o atalho para colar?',
        actionName: 'Colar Ficheiro',
        requiredKeys: ['Ctrl', 'V'],
        description: 'Cola o conteúdo copiado',
        explanation: 'Ctrl+V é a combinação universal para colar.',
      } as ShortcutQuestion;
    } else {
      newQ = {
        id: `q-${Date.now()}`,
        gameType: 'multiple_choice',
        prompt: 'Escreva o enunciado da pergunta aqui...',
        explanation: 'Explicação pedagógica após responder.',
        options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
        correctAnswerIndex: 0,
      } as MultipleChoiceQuestion;
    }

    const updatedQuestions = [...(currentAct.questions || []), newQ];
    setCurrentAct({ ...currentAct, questions: updatedQuestions });
    setActiveQuestionIndex(updatedQuestions.length - 1);
  };

  const removeQuestion = (idx: number) => {
    if ((currentAct.questions?.length || 0) <= 1) {
      alert('A atividade precisa de ter no mínimo uma pergunta.');
      return;
    }
    const nextQ = [...(currentAct.questions || [])];
    nextQ.splice(idx, 1);
    setCurrentAct({ ...currentAct, questions: nextQ });
    setActiveQuestionIndex(Math.max(0, idx - 1));
  };

  // Preview Modal
  if (previewActivity) {
    return (
      <ActivityPlayer
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
      />
    );
  }

  // --- FORM EDITOR VIEW ---
  if (isEditing) {
    const qList = currentAct.questions || [];
    const activeQ = qList[activeQuestionIndex];

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à Lista
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewActivity(currentAct as ActivityItem)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <Eye className="w-4 h-4" /> Pré-visualizar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Guardar Atividade
            </button>
          </div>
        </div>

        {/* General Activity Metadata */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-black text-lg text-slate-900 dark:text-white">
            1. Definições Gerais da Atividade
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Título da Atividade *
              </label>
              <input
                type="text"
                value={currentAct.title || ''}
                onChange={e => setCurrentAct({ ...currentAct, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-blue-500"
                placeholder="Ex: Mestria dos Atalhos de Cópia e Cola"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Módulo Pedagógico *
              </label>
              <select
                value={currentAct.moduleId || ''}
                onChange={e => setCurrentAct({ ...currentAct, moduleId: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tema Específico
              </label>
              <input
                type="text"
                value={currentAct.topic || ''}
                onChange={e => setCurrentAct({ ...currentAct, topic: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-blue-500"
                placeholder="Ex: Teclado & Agilidade"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tipo de Jogo Interativo *
              </label>
              <select
                value={currentAct.gameType || 'multiple_choice'}
                onChange={e => {
                  const newType = e.target.value as GameType;
                  setCurrentAct({ ...currentAct, gameType: newType });
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {Object.entries(GAME_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Dificuldade
                </label>
                <select
                  value={currentAct.difficulty || 'Fácil'}
                  onChange={e => setCurrentAct({ ...currentAct, difficulty: e.target.value as ActivityDifficulty })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Recompensa XP
                </label>
                <input
                  type="number"
                  value={currentAct.xpReward || 30}
                  onChange={e => setCurrentAct({ ...currentAct, xpReward: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Aprovação Mínima (%)
                </label>
                <input
                  type="number"
                  value={currentAct.minPassScore || 70}
                  onChange={e => setCurrentAct({ ...currentAct, minPassScore: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descrição Pedagógica
              </label>
              <textarea
                rows={2}
                value={currentAct.description || ''}
                onChange={e => setCurrentAct({ ...currentAct, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:border-blue-500"
                placeholder="Breve resumo para os alunos..."
              />
            </div>
          </div>
        </div>

        {/* Question Editor */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-slate-900 dark:text-white">
              2. Banco de Perguntas ({qList.length})
            </h2>
            <button
              onClick={addQuestion}
              className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-extrabold text-xs flex items-center gap-1 hover:bg-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
            </button>
          </div>

          {/* Question Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {qList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuestionIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Pergunta {idx + 1}
              </button>
            ))}
          </div>

          {/* Current Question Form */}
          {activeQ && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  A editar Pergunta {activeQuestionIndex + 1} ({GAME_TYPE_LABELS[activeQ.gameType] || activeQ.gameType})
                </span>
                <button
                  onClick={() => removeQuestion(activeQuestionIndex)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Enunciado / Pergunta *
                </label>
                <input
                  type="text"
                  value={activeQ.prompt || ''}
                  onChange={e => {
                    const updated = [...qList];
                    updated[activeQuestionIndex] = { ...activeQ, prompt: e.target.value };
                    setCurrentAct({ ...currentAct, questions: updated });
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              {/* Multiple Choice specific options */}
              {activeQ.gameType === 'multiple_choice' && 'options' in activeQ && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Alternativas (Marque o círculo da resposta correta):
                  </label>
                  {(activeQ as MultipleChoiceQuestion).options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={(activeQ as MultipleChoiceQuestion).correctAnswerIndex === optIdx}
                        onChange={() => {
                          const updated = [...qList];
                          (updated[activeQuestionIndex] as MultipleChoiceQuestion).correctAnswerIndex = optIdx;
                          setCurrentAct({ ...currentAct, questions: updated });
                        }}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...qList];
                          (updated[activeQuestionIndex] as MultipleChoiceQuestion).options[optIdx] = e.target.value;
                          setCurrentAct({ ...currentAct, questions: updated });
                        }}
                        className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* True or False specific options */}
              {activeQ.gameType === 'true_false' && 'statement' in activeQ && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Afirmação a ser julgada:
                  </label>
                  <input
                    type="text"
                    value={(activeQ as TrueFalseQuestion).statement || ''}
                    onChange={e => {
                      const updated = [...qList];
                      (updated[activeQuestionIndex] as TrueFalseQuestion).statement = e.target.value;
                      setCurrentAct({ ...currentAct, questions: updated });
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={(activeQ as TrueFalseQuestion).isTrue === true}
                        onChange={() => {
                          const updated = [...qList];
                          (updated[activeQuestionIndex] as TrueFalseQuestion).isTrue = true;
                          setCurrentAct({ ...currentAct, questions: updated });
                        }}
                      />
                      Verdadeiro
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-rose-600">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={(activeQ as TrueFalseQuestion).isTrue === false}
                        onChange={() => {
                          const updated = [...qList];
                          (updated[activeQuestionIndex] as TrueFalseQuestion).isTrue = false;
                          setCurrentAct({ ...currentAct, questions: updated });
                        }}
                      />
                      Falso
                    </label>
                  </div>
                </div>
              )}

              {/* Explanation Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Explicação Pedagógica (Feedback apresentado após responder)
                </label>
                <textarea
                  rows={2}
                  value={activeQ.explanation || ''}
                  onChange={e => {
                    const updated = [...qList];
                    updated[activeQuestionIndex] = { ...activeQ, explanation: e.target.value };
                    setCurrentAct({ ...currentAct, questions: updated });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="Explique porque esta resposta está correta..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- ACTIVITIES LIST VIEW ---
  return (
    <div className="space-y-6">
      {/* Top Banner & New Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Criador de Atividades & Desafios
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Crie, publique e configure atividades interativas sem escrever código
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Atividade
        </button>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(act => {
          const mod = modules.find(m => m.id === act.moduleId);

          return (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {mod?.title?.split('.')[0] || 'Módulo'}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    act.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {act.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {act.description}
                </p>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-slate-400">
                  <span>{GAME_TYPE_LABELS[act.gameType] || act.gameType}</span>
                  <span>•</span>
                  <span>{act.questions.length} perguntas</span>
                  <span>•</span>
                  <span className="text-amber-500">+{act.xpReward} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewActivity(act)}
                    title="Pré-visualizar como aluno"
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(act)}
                    title="Duplicar atividade"
                    className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(act.id)}
                    title="Eliminar atividade"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleEdit(act)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
