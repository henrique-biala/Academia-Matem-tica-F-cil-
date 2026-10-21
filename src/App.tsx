import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { Leaderboard } from './components/student/Leaderboard';
import { BadgesView } from './components/student/BadgesView';
import { AdminPortal } from './components/admin/AdminPortal';
import { GraduationCap, ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'learn' | 'leaderboard' | 'badges' | 'admin'>('learn');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-black text-xl text-slate-800 dark:text-white">AMEF CHALLENGE</h2>
          <p className="text-xs text-slate-500">A carregar a Academia Matemática é Fácil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      <div>
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        
        <main>
          {currentTab === 'learn' && <StudentDashboard />}
          {currentTab === 'leaderboard' && <Leaderboard />}
          {currentTab === 'badges' && <BadgesView />}
          {currentTab === 'admin' && <AdminPortal />}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-blue-600 dark:text-blue-400">AMEF CHALLENGE</span>
            <span>•</span>
            <span className="font-semibold">Academia Matemática é Fácil</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Informática na Ótica do Utilizador com Gamificação • Luanda, Angola
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Cloud Firestore Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
