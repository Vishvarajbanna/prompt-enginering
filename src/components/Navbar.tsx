import React from 'react';
import { 
  Sparkles, 
  Swords, 
  Stethoscope, 
  Trophy, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Activity
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenCheatsheet: () => void;
  completedQuestsCount: number;
  totalQuestsCount: number;
  battlesRunCount: number;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenCheatsheet,
  completedQuestsCount,
  totalQuestsCount,
  battlesRunCount,
  apiConnected,
}) => {
  const tabs = [
    {
      id: 'techniques' as AppTab,
      label: 'Techniques Academy',
      icon: BookOpen,
      badge: 'Learn',
    },
    {
      id: 'battle' as AppTab,
      label: 'A/B Battle Arena',
      icon: Swords,
      badge: 'Compare',
    },
    {
      id: 'doctor' as AppTab,
      label: 'Prompt Doctor',
      icon: Stethoscope,
      badge: 'Audit & Fix',
    },
    {
      id: 'quests' as AppTab,
      label: 'Prompt Quests',
      icon: Trophy,
      badge: `${completedQuestsCount}/${totalQuestsCount}`,
    },
    {
      id: 'playground' as AppTab,
      label: 'Lab Sandbox',
      icon: Terminal,
      badge: null,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">
                  Prompt<span className="text-cyan-400">Craft</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Master Prompt Engineering with Gemini
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenCheatsheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors"
              title="Open Cheatsheet & Templates"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Cheatsheet</span>
            </button>

            {/* Model & Status pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  apiConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline text-slate-300">Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto pb-2.5 pt-1 gap-1.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
