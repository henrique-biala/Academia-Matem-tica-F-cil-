import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { ActivityBuilder } from './ActivityBuilder';
import { StudentManagement } from './StudentManagement';
import { ModuleManagement } from './ModuleManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { soundService } from '../../services/sound';

export const AdminPortal: React.FC = () => {
  const [subTab, setSubTab] = useState<'dashboard' | 'activities' | 'students' | 'modules' | 'reports'>('dashboard');

  const switchTab = (tab: typeof subTab) => {
    soundService.playClick();
    setSubTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => switchTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            subTab === 'dashboard'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Visão Geral
        </button>

        <button
          onClick={() => switchTab('activities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            subTab === 'activities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Criador de Atividades
        </button>

        <button
          onClick={() => switchTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            subTab === 'students'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Gestão de Alunos
        </button>

        <button
          onClick={() => switchTab('modules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            subTab === 'modules'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Gestão de Módulos
        </button>

        <button
          onClick={() => switchTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
            subTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Relatórios & CSV
        </button>
      </div>

      {/* Render active subtab */}
      <div>
        {subTab === 'dashboard' && <AdminDashboard onNavigateTab={setSubTab} />}
        {subTab === 'activities' && <ActivityBuilder />}
        {subTab === 'students' && <StudentManagement />}
        {subTab === 'modules' && <ModuleManagement />}
        {subTab === 'reports' && <ReportsAnalytics />}
      </div>
    </div>
  );
};
