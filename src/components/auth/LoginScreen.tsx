import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun,
  BookOpen,
  Trophy,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/sound';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginWithStudentCredentials, darkMode, toggleDarkMode, error, clearError } = useAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState<'google' | 'student'>('google');

  const handleGoogleLogin = async () => {
    soundService.playClick();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;

    soundService.playClick();
    setIsSubmitting(true);
    try {
      await loginWithStudentCredentials(studentEmail.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      
      {/* Top Bar with Logo & Theme Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-blue-600 dark:text-blue-400">AMEF</span>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">CHALLENGE</span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Academia Matemática é Fácil
            </p>
          </div>
        </div>

        <button
          onClick={() => { soundService.playClick(); toggleDarkMode(); }}
          aria-label="Alternar tema claro/escuro"
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Portal do Conhecimento
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Iniciar Sessão
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Desafios e jogos interativos de Informática na Ótica do Utilizador
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => { soundService.playClick(); setLoginMode('google'); clearError(); }}
              className={`py-2 rounded-xl transition-all ${
                loginMode === 'google'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Conta Google
            </button>
            <button
              onClick={() => { soundService.playClick(); setLoginMode('student'); clearError(); }}
              className={`py-2 rounded-xl transition-all ${
                loginMode === 'student'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aluno Registado
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs space-y-1">
              <p className="font-black">Aviso de Acesso:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Mode A: Google Login (Official & Recommended) */}
          {loginMode === 'google' && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-4 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSubmitting ? 'A ligar à Google...' : 'Entrar com Conta Google'}</span>
              </button>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Conta de Administrador e Alunos
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                  O Administrador Chefe (<strong className="font-bold">henriquebiala7@gmail.com</strong>) e alunos autorizados devem iniciar sessão com a respetiva conta Google.
                </p>
              </div>
            </div>
          )}

          {/* Mode B: Student Registered Email Login */}
          {loginMode === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email de Aluno Matriculado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    placeholder="exemplo: aluno@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !studentEmail.trim()}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>{isSubmitting ? 'A verificar...' : 'Aceder aos Meus Desafios'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  ℹ️ Registo Reservado
                </p>
                <p>
                  As contas dos alunos são criadas pelo Administrador da Academia Matemática é Fácil. Não disponibilizamos registo público livre por defeito.
                </p>
              </div>
            </form>
          )}

          {/* Feature Highlights Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>10 Módulos</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>13 Jogos</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-4 h-4 text-purple-500" />
              <span>Medalhas & XP</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-2">
        <p>AMEF CHALLENGE • Academia Matemática é Fácil • Luanda, Angola</p>
      </footer>
    </div>
  );
};
