import React, { useState } from 'react';
import {
  Flame,
  Gem,
  Heart,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ShieldAlert,
  GraduationCap,
  Trophy,
  Award,
  BookOpen,
  ChevronDown,
  UserCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import { soundService } from '../../services/sound';
import { DEFAULT_STUDENTS } from '../../data/defaultData';

interface NavbarProps {
  currentTab: 'learn' | 'leaderboard' | 'badges' | 'admin';
  setCurrentTab: (tab: 'learn' | 'leaderboard' | 'badges' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const {
    currentUser,
    isAdmin,
    darkMode,
    toggleDarkMode,
    loginWithGoogle,
    loginAsStudent,
    loginAsAdminDemo,
    logout,
    refillHearts,
  } = useAuth();

  const [soundMuted, setSoundMuted] = useState(soundService.getMuted());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleSound = () => {
    const isMuted = soundService.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) soundService.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Institution */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('learn')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
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

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
          <button
            onClick={() => { soundService.playClick(); setCurrentTab('learn'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              currentTab === 'learn'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Trilha de Estudo
          </button>

          <button
            onClick={() => { soundService.playClick(); setCurrentTab('leaderboard'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            Classificação
          </button>

          <button
            onClick={() => { soundService.playClick(); setCurrentTab('badges'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              currentTab === 'badges'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Award className="w-4 h-4 text-purple-300" />
            Medalhas
          </button>

          {isAdmin && (
            <button
              onClick={() => { soundService.playClick(); setCurrentTab('admin'); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Painel Admin
            </button>
          )}
        </nav>

        {/* Right HUD Stats & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Hearts (Duolingo style) */}
          <button
            onClick={() => { soundService.playClick(); refillHearts(); }}
            title="Vidas de prática (clique para recarregar)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-extrabold text-sm hover:scale-105 transition-transform"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{currentUser?.hearts ?? 5}</span>
          </button>

          {/* Streak Days */}
          <div
            title="Sequência de dias seguidos a estudar!"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 font-extrabold text-sm"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{currentUser?.streakDays ?? 1}</span>
          </div>

          {/* XP Gems */}
          <div
            title="Pontos de Experiência (XP)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 font-extrabold text-sm"
          >
            <Gem className="w-4 h-4 fill-blue-500 text-blue-500" />
            <span>{currentUser?.xp ?? 0}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Ativar ou desativar som"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => { soundService.playClick(); toggleDarkMode(); }}
            aria-label="Alternar modo escuro ou claro"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Profile & Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xl leading-none">{currentUser?.avatar || '🧑🏾‍💻'}</span>
              <span className="hidden sm:inline font-bold text-xs text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {currentUser?.name || 'Aluno'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 px-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setProfileDropdownOpen(false)}
              >
                {/* User card in menu */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 mb-3 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{currentUser?.avatar}</span>
                    <div className="overflow-hidden">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {currentUser?.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher for instant testing */}
                <div className="mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1">
                    Alternar Conta de Teste
                  </p>
                  
                  {/* Admin option */}
                  <button
                    onClick={() => { loginAsAdminDemo(); setCurrentTab('admin'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      Administrador (Henrique Biala)
                    </span>
                    {isAdmin && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-md">Ativo</span>}
                  </button>

                  {/* Student Options */}
                  {DEFAULT_STUDENTS.map(std => (
                    <button
                      key={std.uid}
                      onClick={() => { loginAsStudent(std.uid); setCurrentTab('learn'); }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{std.avatar}</span>
                        <span className="truncate">{std.name}</span>
                      </span>
                      {currentUser?.uid === std.uid && (
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-md">Ativo</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                  {/* Google Real Auth */}
                  <button
                    onClick={() => loginWithGoogle()}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Entrar com Conta Google
                  </button>

                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Terminar Sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2">
        <button
          onClick={() => { soundService.playClick(); setCurrentTab('learn'); }}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            currentTab === 'learn' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Aprender</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setCurrentTab('leaderboard'); }}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            currentTab === 'leaderboard' ? 'text-amber-500' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Ranking</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setCurrentTab('badges'); }}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            currentTab === 'badges' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Medalhas</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => { soundService.playClick(); setCurrentTab('admin'); }}
            className={`flex flex-col items-center gap-1 text-xs font-bold ${
              currentTab === 'admin' ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
