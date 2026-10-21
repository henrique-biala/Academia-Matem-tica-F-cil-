import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Gem, Crown, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const Leaderboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const list = await dbService.getStudents();
      // Sort by XP descending
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setStudents(list);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const top3 = students.slice(0, 3);
  const remaining = students.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          Quadro de Honra AMEF
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Classificação Geral dos Alunos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Os utilizadores mais dedicados e velozes na Academia Matemática é Fácil
        </p>
      </div>

      {/* Podium for Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4">
          
          {/* 2nd Place */}
          <div className="flex flex-col items-center p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <span className="text-3xl sm:text-4xl">{top3[1]?.avatar || '👩🏾‍💻'}</span>
            <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center -mt-2 shadow">
              2
            </div>
            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-2 truncate w-full">
              {top3[1]?.name}
            </p>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {top3[1]?.xp} XP
            </span>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/70 dark:from-amber-950/40 dark:to-slate-800 border-2 border-amber-400 text-center shadow-xl relative -translate-y-4">
            <Crown className="w-7 h-7 text-amber-500 fill-amber-400 animate-bounce absolute -top-4" />
            <span className="text-4xl sm:text-5xl">{top3[0]?.avatar || '👨🏽‍🎓'}</span>
            <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center -mt-2 shadow-md">
              1
            </div>
            <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white mt-2 truncate w-full">
              {top3[0]?.name}
            </p>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-900">
              {top3[0]?.xp} XP
            </span>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <span className="text-3xl sm:text-4xl">{top3[2]?.avatar || '🧑🏿‍💻'}</span>
            <div className="w-6 h-6 rounded-full bg-amber-700/60 text-white font-black text-xs flex items-center justify-center -mt-2 shadow">
              3
            </div>
            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-2 truncate w-full">
              {top3[2]?.name}
            </p>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {top3[2]?.xp} XP
            </span>
          </div>
        </div>
      )}

      {/* Complete Leaderboard List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Posição & Aluno</span>
          <div className="flex items-center gap-6">
            <span>Sequência</span>
            <span>Total XP</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {students.map((student, idx) => {
            const isCurrentUser = currentUser?.uid === student.uid;

            return (
              <div
                key={student.uid}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isCurrentUser
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-center font-black text-sm ${
                    idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>

                  <span className="text-2xl">{student.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {student.name}
                      </p>
                      {isCurrentUser && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-600 text-white">
                          Você
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {student.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    <span>{student.streakDays || 1}d</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-black text-blue-600 dark:text-blue-400 min-w-[70px] justify-end">
                    <Gem className="w-4 h-4 fill-blue-500" />
                    <span>{student.xp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
