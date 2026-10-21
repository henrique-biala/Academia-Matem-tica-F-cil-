import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  History,
  X,
  Flame,
  Gem,
  Lock,
  Unlock,
} from 'lucide-react';
import { UserProfile, AttemptRecord } from '../../types';
import { dbService } from '../../services/db';
import { soundService } from '../../services/sound';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<UserProfile | null>(null);
  const [studentAttempts, setStudentAttempts] = useState<AttemptRecord[]>([]);

  // New Student Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '🧑🏾‍💻',
    level: 'Iniciante Digital',
    xp: 0,
    role: 'student' as const,
  });

  const loadStudents = async () => {
    const list = await dbService.getStudents();
    setStudents(list);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Preencha o nome e o email do aluno.');
      return;
    }

    soundService.playCorrect();
    const newStudent: UserProfile = {
      uid: `std-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar,
      role: 'student',
      status: 'active',
      xp: formData.xp,
      level: formData.level,
      streakDays: 1,
      lastActiveDate: 'Hoje',
      badges: ['badge-first-step'],
      hearts: 5,
      createdAt: new Date().toISOString(),
    };

    await dbService.saveStudent(newStudent);
    await loadStudents();
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      avatar: '🧑🏾‍💻',
      level: 'Iniciante Digital',
      xp: 0,
      role: 'student',
    });
  };

  const handleToggleStatus = async (student: UserProfile) => {
    soundService.playClick();
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    await dbService.updateStudentStatus(student.uid, newStatus);
    await loadStudents();
  };

  const handleDeleteStudent = async (uid: string) => {
    if (confirm('Tem a certeza de que deseja eliminar esta conta de aluno?')) {
      soundService.playClick();
      await dbService.deleteStudent(uid);
      await loadStudents();
    }
  };

  const handleViewHistory = async (student: UserProfile) => {
    soundService.playClick();
    setSelectedStudentForHistory(student);
    const atts = await dbService.getAttempts(student.uid);
    setStudentAttempts(atts);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Gestão de Alunos & Utilizadores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Crie contas para alunos, consulte o progresso e faça a gestão de acessos
          </p>
        </div>

        <button
          onClick={() => { soundService.playClick(); setIsModalOpen(true); }}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Criar Conta de Aluno
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'active' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'suspended' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Suspensos
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-4">Aluno</th>
                <th className="p-4">Email</th>
                <th className="p-4">Nível / XP</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredStudents.map(std => (
                <tr key={std.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{std.avatar}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{std.name}</span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{std.email}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{std.level}</span>
                    <span className="block text-[11px] text-blue-600 font-black">{std.xp} XP</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      std.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {std.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewHistory(std)}
                        title="Ver histórico de atividades"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(std)}
                        title={std.status === 'active' ? 'Suspender aluno' : 'Ativar aluno'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          std.status === 'active'
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {std.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteStudent(std.uid)}
                        title="Eliminar aluno"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                Criar Nova Conta de Aluno
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="Ex: João Baptista"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Email do Aluno *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  placeholder="aluno.amef@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Escolha o Avatar</label>
                <div className="flex gap-2">
                  {['🧑🏾‍💻', '👩🏾‍💻', '👨🏽‍🎓', '👩🏽‍🎓', '🧑🏿‍🏫', '🚀'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                      className={`text-2xl p-2 rounded-xl border transition-all ${
                        formData.avatar === emoji ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 scale-110' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
                >
                  Criar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student History */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedStudentForHistory.avatar}</span>
                <div>
                  <h2 className="font-black text-base text-slate-900 dark:text-white">
                    Histórico: {selectedStudentForHistory.name}
                  </h2>
                  <p className="text-[11px] text-slate-400">{selectedStudentForHistory.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentForHistory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {studentAttempts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Nenhuma atividade realizada por este aluno até ao momento.
                </div>
              ) : (
                studentAttempts.map(att => (
                  <div key={att.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{att.activityTitle}</p>
                      <p className="text-[10px] text-slate-400">{new Date(att.createdAt).toLocaleDateString('pt-AO')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block font-black px-2 py-0.5 rounded-md ${
                        att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.scorePercent}%
                      </span>
                      <p className="text-[10px] text-blue-600 font-bold mt-0.5">+{att.xpEarned} XP</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
