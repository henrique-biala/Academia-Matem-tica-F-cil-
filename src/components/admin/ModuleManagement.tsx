import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { ModuleItem } from '../../types';
import { dbService } from '../../services/db';
import { soundService } from '../../services/sound';

export const ModuleManagement: React.FC = () => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadModules = async () => {
    const list = await dbService.getModules();
    setModules(list);
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleCreateModule = () => {
    soundService.playClick();
    setEditingModule({
      id: `mod-${Date.now()}`,
      title: `${modules.length + 1}. Novo Módulo de Informática`,
      description: 'Descrição sucinta dos objetivos e conteúdos do módulo.',
      icon: 'BookOpen',
      order: modules.length + 1,
      color: 'from-blue-600 to-indigo-600',
      totalActivities: 0,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleEditModule = (mod: ModuleItem) => {
    soundService.playClick();
    setEditingModule(JSON.parse(JSON.stringify(mod)));
    setIsModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editingModule.title) return;

    soundService.playCorrect();
    await dbService.saveModule(editingModule);
    await loadModules();
    setIsModalOpen(false);
  };

  const handleTogglePublished = async (mod: ModuleItem) => {
    soundService.playClick();
    const updated = { ...mod, isPublished: !mod.isPublished };
    await dbService.saveModule(updated);
    await loadModules();
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    soundService.playClick();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const list = [...modules];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Update order numbers
    for (let i = 0; i < list.length; i++) {
      list[i].order = i + 1;
      await dbService.saveModule(list[i]);
    }

    setModules(list);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Gestão de Módulos Pedagógicos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adicione módulos, reorganize a ordem curricular ou altere descrições
          </p>
        </div>

        <button
          onClick={handleCreateModule}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Módulo
        </button>
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((mod, idx) => (
          <div
            key={mod.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-base flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {mod.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    mod.isPublished
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {mod.isPublished ? 'Publicado' : 'Oculto'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl line-clamp-1">
                  {mod.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Reorder Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === modules.length - 1}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Publish Toggle */}
              <button
                onClick={() => handleTogglePublished(mod)}
                title={mod.isPublished ? 'Ocultar módulo dos alunos' : 'Publicar módulo'}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mod.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-500" />}
              </button>

              {/* Edit button */}
              <button
                onClick={() => handleEditModule(mod)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Module Modal */}
      {isModalOpen && editingModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                Editar Módulo Curricular
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Título do Módulo *</label>
                <input
                  type="text"
                  required
                  value={editingModule.title}
                  onChange={e => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Descrição</label>
                <textarea
                  rows={3}
                  value={editingModule.description}
                  onChange={e => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub"
                  checked={editingModule.isPublished}
                  onChange={e => setEditingModule({ ...editingModule, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="pub" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Módulo visível para os alunos
                </label>
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
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
