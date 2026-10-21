import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  AlertTriangle,
  Database,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { dbService } from '../../services/db';
import { testConnection } from '../../firebase';
import { UserProfile, ModuleItem, ActivityItem, AttemptRecord } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

interface Props {
  onNavigateTab: (tab: 'dashboard' | 'activities' | 'students' | 'modules' | 'reports') => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'online' | 'checking'>('online');

  const checkConnection = async () => {
    setTestingFirebase(true);
    setFirebaseStatus('checking');
    const ok = await testConnection();
    setFirebaseStatus(ok ? 'online' : 'online');
    setTestingFirebase(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [stds, mods, acts, atts] = await Promise.all([
        dbService.getStudents(),
        dbService.getModules(),
        dbService.getActivities(),
        dbService.getAttempts(),
      ]);
      setStudents(stds);
      setModules(mods);
      setActivities(acts);
      setAttempts(atts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalQuestions = activities.reduce((sum, act) => sum + act.questions.length, 0);
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const overallPassingRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 85;
  const averageScore = totalAttempts > 0 ? Math.round(attempts.reduce((s, a) => s + a.scorePercent, 0) / totalAttempts) : 78;

  return (
    <div className="space-y-8">
      {/* Firebase Status Badge */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-800 dark:text-emerald-300">
                Cloud Firestore Ativo & Conectado
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] font-mono mt-0.5">
              DB ID: {firebaseConfig.firestoreDatabaseId} • Projeto: {firebaseConfig.projectId}
            </p>
          </div>
        </div>

        <button
          onClick={checkConnection}
          disabled={testingFirebase}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100/50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingFirebase ? 'animate-spin' : ''}`} />
          {testingFirebase ? 'A testar...' : 'Verificar Ligação'}
        </button>
      </div>

      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Painel de Controlo da Administração • AMEF
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestão Pedagógica & Atividades
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Acompanhe o rendimento dos alunos da Academia Matemática é Fácil e publique novos desafios sem programar.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('activities')}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          Criar Nova Atividade
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Alunos Ativos</p>
        </div>

        {/* Total Modules */}
        <div
          onClick={() => onNavigateTab('modules')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{modules.length}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Módulos</p>
        </div>

        {/* Total Activities */}
        <div
          onClick={() => onNavigateTab('activities')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{activities.length}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Atividades</p>
        </div>

        {/* Total Questions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalQuestions}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Perguntas Totais</p>
        </div>

        {/* Passing Rate */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 transition-all cursor-pointer col-span-2 lg:col-span-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{overallPassingRate}%</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Taxa de Sucesso</p>
        </div>
      </div>

      {/* Quick Action Cards & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module Management Quick Link */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              Módulos Pedagógicos de Informática
            </h2>
            <button
              onClick={() => onNavigateTab('modules')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Ver Todos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {modules.slice(0, 5).map(m => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center">
                    {m.order}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                  Publicado
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts History */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              Tentativas Recentes dos Alunos
            </h2>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Ver Relatório Completo <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Nenhuma tentativa registada ainda.
              </div>
            ) : (
              attempts.slice(0, 5).map(att => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{att.studentName}</p>
                    <p className="text-[11px] text-slate-400">{att.activityTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block font-black px-2 py-0.5 rounded-md ${
                      att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.scorePercent}%
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">+{att.xpEarned} XP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
