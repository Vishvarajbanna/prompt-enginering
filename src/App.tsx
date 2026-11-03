import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TechniquesExplorer } from './components/TechniquesExplorer';
import { BattleArena } from './components/BattleArena';
import { PromptDoctor } from './components/PromptDoctor';
import { QuestArena } from './components/QuestArena';
import { Playground } from './components/Playground';
import { CheatsheetModal } from './components/CheatsheetModal';
import { AppTab } from './types';
import { QUESTS } from './data/quests';
import { Sparkles, Terminal, BookOpen, Swords, Trophy, Stethoscope } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('techniques');
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Cross-component battle arena state transfer
  const [battlePrompts, setBattlePrompts] = useState<{
    promptA?: string;
    promptB?: string;
    systemA?: string;
    systemB?: string;
  }>({});

  // Gamification & progress states
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('promptcraft_completed_quests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [battlesRunCount, setBattlesRunCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('promptcraft_battles_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Verify backend connectivity on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiConnected(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  const handleQuestCompleted = (questId: string) => {
    if (!completedQuestIds.includes(questId)) {
      const updated = [...completedQuestIds, questId];
      setCompletedQuestIds(updated);
      try {
        localStorage.setItem('promptcraft_completed_quests', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleBattleRun = () => {
    const updated = battlesRunCount + 1;
    setBattlesRunCount(updated);
    try {
      localStorage.setItem('promptcraft_battles_count', String(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSendToBattle = (
    promptA: string,
    promptB: string,
    systemA?: string,
    systemB?: string
  ) => {
    setBattlePrompts({ promptA, promptB, systemA, systemB });
    setActiveTab('battle');
  };

  const handleLoadFromCheatsheet = (prompt: string, system?: string) => {
    setBattlePrompts({
      promptA: prompt,
      promptB: prompt,
      systemA: system,
      systemB: system,
    });
    setActiveTab('battle');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        completedQuestsCount={completedQuestIds.length}
        totalQuestsCount={QUESTS.length}
        battlesRunCount={battlesRunCount}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'techniques' && (
          <TechniquesExplorer onSendToBattle={handleSendToBattle} />
        )}

        {activeTab === 'battle' && (
          <BattleArena
            key={`${battlePrompts.promptA?.slice(0, 10)}-${battlePrompts.promptB?.slice(0, 10)}`}
            initialPromptA={battlePrompts.promptA}
            initialPromptB={battlePrompts.promptB}
            initialSystemA={battlePrompts.systemA}
            initialSystemB={battlePrompts.systemB}
            onBattleCompleted={handleBattleRun}
          />
        )}

        {activeTab === 'doctor' && (
          <PromptDoctor onSendToBattle={handleSendToBattle} />
        )}

        {activeTab === 'quests' && (
          <QuestArena
            completedQuestIds={completedQuestIds}
            onQuestCompleted={handleQuestCompleted}
          />
        )}

        {activeTab === 'playground' && <Playground />}
      </main>

      {/* Cheatsheet Modal */}
      <CheatsheetModal
        isOpen={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
        onLoadTemplate={handleLoadFromCheatsheet}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-bold">PromptCraft Studio</span>
            <span>—</span>
            <span>Powered by Gemini 3.8 Flash server proxy</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => {
                if (window.confirm('Reset quest progress and battle statistics?')) {
                  localStorage.removeItem('promptcraft_completed_quests');
                  localStorage.removeItem('promptcraft_battles_count');
                  setCompletedQuestIds([]);
                  setBattlesRunCount(0);
                }
              }}
              className="text-slate-400 hover:text-slate-300 underline"
            >
              Reset progress
            </button>
            <span className="text-slate-400">Zero telemetry. 100% Client & Server Isolation.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
