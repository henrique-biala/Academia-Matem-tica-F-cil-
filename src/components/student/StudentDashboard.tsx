import React, { useState, useEffect } from 'react';
import {
  Flame,
  Gem,
  Trophy,
  Play,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Award,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';
import { ModuleItem, ActivityItem, UserProfile } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/sound';
import { ActivityPlayer } from './ActivityPlayer';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('mod-1');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [mods, acts] = await Promise.all([
        dbService.getModules(),
        dbService.getActivities(),
      ]);
      setModules(mods);
      setActivities(acts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartActivity = (act: ActivityItem) => {
    soundService.playClick();
    setSelectedActivity(act);
  };

  // Next level progress
  const xp = currentUser?.xp || 0;
  const nextLevelXp = xp < 250 ? 250 : xp < 600 ? 600 : xp < 1100 ? 1100 : xp < 1800 ? 1800 : 3000;
  const levelProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  // Daily Challenge Activity (picks the shortcut challenge or first active)
  const dailyChallenge = activities.find(a => a.id === 'act-sh-01') || activities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* If an activity is currently active, render full-screen ActivityPlayer */}
      {selectedActivity && (
        <ActivityPlayer
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onFinish={() => {
            loadData();
            setSelectedActivity(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Learning Path / Modules */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Hero / Daily Challenge Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                Desafio do Dia • AMEF
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Olá, {currentUser?.name?.split(' ')[0] || 'Aluno'}! Pronto para aprender?
              </h1>
              <p className="text-sm sm:text-base text-blue-100 font-medium">
                Complete as lições de Informática na Ótica do Utilizador, ganhe pontos XP e domine o teclado, Windows, Office e Internet!
              </p>

              {dailyChallenge && (
                <div className="pt-2">
                  <button
                    onClick={() => handleStartActivity(dailyChallenge)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-slate-900" />
                    Jogar Desafio do Dia (+{dailyChallenge.xpReward} XP)
                  </button>
                </div>
              )}
            </div>

            {/* Decorative background circle */}
            <div className="absolute -right-8 -bottom-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          </div>

          {/* Module Trail (Duolingo Style) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Trilha de Formação em Informática
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  10 Módulos progressivos para dominar a informática no dia a dia
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60">
                {modules.length} Módulos Disponíveis
              </span>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {modules.map((mod, modIdx) => {
                const moduleActs = activities.filter(a => a.moduleId === mod.id);
                const isExpanded = expandedModuleId === mod.id;

                return (
                  <div
                    key={mod.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Module Accordion Header */}
                    <div
                      onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color || 'from-blue-600 to-indigo-600'} text-white flex items-center justify-center font-black text-base shadow-md`}>
                          {modIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {mod.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {moduleActs.length} {moduleActs.length === 1 ? 'atividade' : 'atividades'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Activities Inside Module */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
                        {moduleActs.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Nenhuma atividade publicada para este módulo ainda.
                          </div>
                        ) : (
                          moduleActs.map((act, actIdx) => (
                            <div
                              key={act.id}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                  {actIdx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                                      {act.title}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                      act.difficulty === 'Fácil'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : act.difficulty === 'Médio'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    }`}>
                                      {act.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {act.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="hidden sm:inline text-xs font-extrabold text-amber-600 dark:text-amber-400">
                                  +{act.xpReward} XP
                                </span>
                                <button
                                  onClick={() => handleStartActivity(act)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap"
                                >
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  Jogar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Student Status Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl">{currentUser?.avatar || '🧑🏾‍💻'}</span>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {currentUser?.name || 'Aluno AMEF'}
                </h3>
                <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  {currentUser?.level || 'Iniciante Digital'}
                </span>
              </div>
            </div>

            {/* Level XP Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400">Progresso para o próximo nível</span>
                <span className="text-blue-600 dark:text-blue-400">{xp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center">
                <span className="flex items-center justify-center gap-1 font-black text-lg text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {currentUser?.streakDays || 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Dias Seguidos</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-center">
                <span className="flex items-center justify-center gap-1 font-black text-lg text-blue-600 dark:text-blue-400">
                  <Gem className="w-4 h-4 fill-blue-500 text-blue-500" />
                  {currentUser?.xp || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Total XP</span>
              </div>
            </div>
          </div>

          {/* Angola Educational Motivation Box */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Dica da Academia Matemática é Fácil</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              "A Informática é como a Matemática: aprende-se fazendo! Pratique os atalhos como <strong className="text-white">Ctrl+C</strong> e <strong className="text-white">Ctrl+V</strong> todos os dias para se tornar um utilizador veloz e autónomo."
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
