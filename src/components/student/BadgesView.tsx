import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle2, Sparkles, Gem, Zap, Flame, Compass, Footprints, Shield } from 'lucide-react';
import { BadgeItem } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const BadgesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState<BadgeItem[]>([]);

  useEffect(() => {
    dbService.getBadges().then(setBadges);
  }, []);

  const userBadges = currentUser?.badges || [];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints': return <Footprints className="w-8 h-8" />;
      case 'Zap': return <Zap className="w-8 h-8" />;
      case 'Flame': return <Flame className="w-8 h-8" />;
      case 'Compass': return <Compass className="w-8 h-8" />;
      case 'Shield': return <Shield className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Galeria de Conquistas AMEF
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Medalhas de Mérito e Excelência
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Desbloqueie insígnias exclusivas demonstrando mestria nos desafios e atalhos de informática
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(badge => {
          const isEarned = userBadges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between shadow-sm ${
                isEarned
                  ? 'border-purple-400 dark:border-purple-600 bg-gradient-to-br from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 opacity-75'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
                      isEarned
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getBadgeIcon(badge.icon)}
                  </div>

                  {isEarned ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conquistada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                      <Lock className="w-3.5 h-3.5" /> Bloqueada
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>Bónus: +{badge.xpBonus} XP</span>
                <Gem className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
