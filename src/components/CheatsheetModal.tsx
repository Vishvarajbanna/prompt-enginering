import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  Bookmark, 
  Plus, 
  Trash2, 
  ExternalLink,
  Code2,
  Sparkles
} from 'lucide-react';
import { PROMPT_CHEATSHEET_CARDS, INITIAL_SAVED_TEMPLATES } from '../data/cheatsheet';
import { SavedPromptTemplate } from '../types';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (prompt: string, system?: string) => void;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'templates'>('cheatsheet');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // User templates saved in LocalStorage
  const [savedTemplates, setSavedTemplates] = useState<SavedPromptTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('promptcraft_saved_templates');
      return stored ? JSON.parse(stored) : INITIAL_SAVED_TEMPLATES;
    } catch {
      return INITIAL_SAVED_TEMPLATES;
    }
  });

  // New template modal state
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [newSystem, setNewSystem] = useState<string>('');
  const [newPrompt, setNewPrompt] = useState<string>('');

  if (!isOpen) return null;

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveNewTemplate = () => {
    if (!newTitle.trim() || !newPrompt.trim()) return;
    const newTemplate: SavedPromptTemplate = {
      id: `tpl-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim(),
      technique: 'Custom User Template',
      system: newSystem.trim() || undefined,
      prompt: newPrompt.trim(),
      tags: ['custom'],
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('promptcraft_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    setNewTitle('');
    setNewSystem('');
    setNewPrompt('');
    setIsAddingNew(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('promptcraft_saved_templates', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                Prompt Engineering Cheatsheet & Library
              </h2>
              <p className="text-xs text-slate-400">
                Battle-tested architectural snippets and custom saved prompts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/40 gap-4 text-xs font-mono font-medium">
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'cheatsheet'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Cheatsheet Cards ({PROMPT_CHEATSHEET_CARDS.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Saved Templates ({savedTemplates.length})</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'cheatsheet' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROMPT_CHEATSHEET_CARDS.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-cyan-400 font-bold">{card.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {card.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="relative">
                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800/80">
                      {card.snippet}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        onLoadTemplate(card.snippet);
                        onClose();
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium flex items-center gap-1"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Load into Arena</span>
                    </button>

                    <button
                      onClick={() => copySnippet(card.snippet, idx)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-mono"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add new template button */}
              {!isAddingNew ? (
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Template</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
                    <span>New Custom Prompt Template</span>
                    <button
                      onClick={() => setIsAddingNew(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Template Title (e.g. SQL Query Generator)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-slate-900 p-2 text-xs font-mono text-slate-200 rounded border border-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Database, Marketing)"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-slate-900 p-2 text-xs font-mono text-slate-200 rounded border border-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="System Instruction (Optional)"
                    value={newSystem}
                    onChange={(e) => setNewSystem(e.target.value)}
                    className="w-full bg-slate-900 p-2 text-xs font-mono text-slate-200 rounded border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />

                  <textarea
                    rows={4}
                    placeholder="Prompt template contents..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="w-full bg-slate-900 p-2 text-xs font-mono text-slate-200 rounded border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNewTemplate}
                      disabled={!newTitle.trim() || !newPrompt.trim()}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              )}

              {/* Template list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedTemplates.map((t, idx) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-white font-bold">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                          {t.category}
                        </span>
                      </div>
                      {t.system && (
                        <p className="text-[11px] text-slate-400 font-mono italic truncate">
                          System: {t.system}
                        </p>
                      )}
                    </div>

                    <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-32 overflow-y-auto border border-slate-800/80">
                      {t.prompt}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          onLoadTemplate(t.prompt, t.system);
                          onClose();
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Load into Arena</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copySnippet(t.prompt, idx + 100)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-mono"
                        >
                          {copiedIndex === idx + 100 ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedIndex === idx + 100 ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
