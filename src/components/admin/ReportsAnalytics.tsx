import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Users,
  Search,
} from 'lucide-react';
import { AttemptRecord, UserProfile, ModuleItem, ActivityItem } from '../../types';
import { dbService } from '../../services/db';
import { soundService } from '../../services/sound';

export const ReportsAnalytics: React.FC = () => {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      const [atts, stds, mods, acts] = await Promise.all([
        dbService.getAttempts(),
        dbService.getStudents(),
        dbService.getModules(),
        dbService.getActivities(),
      ]);
      setAttempts(atts);
      setStudents(stds);
      setModules(mods);
      setActivities(acts);
    };
    fetchData();
  }, []);

  // Filtered attempts
  const filteredAttempts = attempts.filter(att => {
    const matchStudent = selectedStudentFilter === 'all' || att.userId === selectedStudentFilter;
    const matchModule = selectedModuleFilter === 'all' || att.moduleId === selectedModuleFilter;
    return matchStudent && matchModule;
  });

  // Calculate statistics
  const totalAttempts = filteredAttempts.length;
  const passedCount = filteredAttempts.filter(a => a.passed).length;
  const avgScore = totalAttempts > 0 ? Math.round(filteredAttempts.reduce((acc, a) => acc + a.scorePercent, 0) / totalAttempts) : 0;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  // Inactive students (no attempts recorded)
  const studentAttemptIds = new Set(attempts.map(a => a.userId));
  const inactiveStudents = students.filter(s => !studentAttemptIds.has(s.uid));

  // Hardest questions: analyze wrong answers
  const wrongQuestionsMap: { [prompt: string]: number } = {};
  attempts.forEach(att => {
    (att.answersSummary || []).forEach(ans => {
      if (!ans.isCorrect) {
        wrongQuestionsMap[ans.prompt] = (wrongQuestionsMap[ans.prompt] || 0) + 1;
      }
    });
  });

  const hardestQuestions = Object.entries(wrongQuestionsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Export to CSV functionality
  const handleExportCSV = () => {
    soundService.playClick();
    if (filteredAttempts.length === 0) {
      alert('Não existem registos de tentativas para exportar com os filtros atuais.');
      return;
    }

    const headers = ['Data', 'Aluno', 'Modulo ID', 'Atividade', 'Aproveitamento (%)', 'Resultado', 'Tempo (s)', 'XP Ganho'];
    const rows = filteredAttempts.map(a => [
      new Date(a.createdAt).toLocaleString('pt-AO'),
      `"${a.studentName.replace(/"/g, '""')}"`,
      a.moduleId,
      `"${a.activityTitle.replace(/"/g, '""')}"`,
      a.scorePercent,
      a.passed ? 'Aprovado' : 'Não Aprovado',
      a.timeSpentSeconds,
      a.xpEarned,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AMEF_Relatorio_Desempenho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Relatórios de Desempenho & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o rendimento real dos alunos, taxas de aprovação e exporte relatórios
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" /> Exportar para CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Tentativas Realizadas</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalAttempts}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Média de Aproveitamento</span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{avgScore}%</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Taxa de Sucesso</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{passRate}%</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Alunos Inativos</span>
          <p className="text-3xl font-black text-amber-500 mt-1">{inactiveStudents.length}</p>
        </div>
      </div>

      {/* Hardest Questions & Inactive Students Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hardest Questions List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              Perguntas com Maior Taxa de Erro
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Identifique os conceitos onde os alunos necessitam de mais apoio pedagógico
          </p>

          <div className="space-y-2 pt-2">
            {hardestQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Sem erros registados ainda.</p>
            ) : (
              hardestQuestions.map(([prompt, count], idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs gap-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{prompt}</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-black whitespace-nowrap">
                    {count} {count === 1 ? 'erro' : 'erros'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inactive Students Alert */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="font-black text-base text-slate-900 dark:text-white">
              Alunos que Ainda Não Jogaram
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Contas criadas pelo administrador com 0 tentativas concluídas
          </p>

          <div className="space-y-2 pt-2">
            {inactiveStudents.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Excelente! Todos os alunos registados já concluíram atividades.
              </p>
            ) : (
              inactiveStudents.map(std => (
                <div key={std.uid} className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span>{std.avatar}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{std.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{std.email}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filterable Attempts History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tabela de Tentativas ({filteredAttempts.length})
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStudentFilter}
              onChange={e => setSelectedStudentFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="all">Todos os Alunos</option>
              {students.map(s => (
                <option key={s.uid} value={s.uid}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedModuleFilter}
              onChange={e => setSelectedModuleFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="all">Todos os Módulos</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Aluno</th>
                <th className="p-3.5">Atividade</th>
                <th className="p-3.5">Nota</th>
                <th className="p-3.5">Resultado</th>
                <th className="p-3.5 text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredAttempts.map(att => (
                <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {new Date(att.createdAt).toLocaleDateString('pt-AO')} {new Date(att.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-white">{att.studentName}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{att.activityTitle}</td>
                  <td className="p-3.5 font-bold">{att.scorePercent}%</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      att.passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {att.passed ? 'Aprovado' : 'Não Aprovado'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-black text-blue-600">+{att.xpEarned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
