import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Play, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Zap
} from 'lucide-react';
import { Quest, QuestGrade } from '../types';
import { QUESTS } from '../data/quests';

interface QuestArenaProps {
  completedQuestIds: string[];
  onQuestCompleted: (questId: string) => void;
}

export const QuestArena: React.FC<QuestArenaProps> = ({
  completedQuestIds,
  onQuestCompleted,
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(QUESTS[0].id);
  const activeQuest = QUESTS.find((q) => q.id === selectedQuestId) || QUESTS[0];

  // Editable prompt states for active quest
  const [userSystem, setUserSystem] = useState<string>(
    activeQuest.starterSystemPrompt || ''
  );
  const [userPrompt, setUserPrompt] = useState<string>(
    activeQuest.starterPromptTemplate
  );

  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<{
    testResults: any[];
    grade: QuestGrade;
  } | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  // Sync state when quest changes
  React.useEffect(() => {
    setUserSystem(activeQuest.starterSystemPrompt || '');
    setUserPrompt(activeQuest.starterPromptTemplate);
    setShowHint(false);
    setGradeResult(null);
    setGradeError(null);
  }, [selectedQuestId]);

  const handleGradeQuest = async () => {
    setIsGrading(true);
    setGradeError(null);
    setGradeResult(null);

    try {
      const response = await fetch('/api/grade-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: activeQuest.id,
          questTitle: activeQuest.title,
          criteria: activeQuest.criteria,
          testCases: activeQuest.testCases,
          userSystemPrompt: userSystem,
          userPromptTemplate: userPrompt,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to grade challenge.');
      }

      const data = await response.json();
      setGradeResult(data);

      if (data.grade?.overallPassed) {
        onQuestCompleted(activeQuest.id);
      }
    } catch (err: any) {
      setGradeError(err.message || 'Challenge grading error');
    } finally {
      setIsGrading(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/40';
      case 'Intermediate':
        return 'bg-blue-950 text-blue-400 border-blue-800/40';
      case 'Hard':
        return 'bg-amber-950 text-amber-400 border-amber-800/40';
      case 'Expert':
        return 'bg-rose-950 text-rose-400 border-rose-800/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800/60 font-mono">
            Interactive Quests
          </span>
          <span className="text-xs text-slate-400">Automated AI Test Evaluation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Prompt Quests & Badges
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Solve real-world prompt engineering challenges. Your prompt will be tested against automated adversarial test cases and scored by the AI Judge.
        </p>
      </div>

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUESTS.map((quest) => {
          const isSelected = quest.id === selectedQuestId;
          const isCompleted = completedQuestIds.includes(quest.id);

          return (
            <button
              key={quest.id}
              onClick={() => setSelectedQuestId(quest.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(
                      quest.difficulty
                    )}`}
                  >
                    {quest.difficulty}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Completed
                    </span>
                  )}
                </div>

                <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {quest.title}
                </h3>
                <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                  Focus: {quest.techniqueFocus}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px]">{quest.badge}</span>
                </span>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Quest Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mission Brief & Criteria */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Mission Briefing</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeQuest.testCases.length} Test Cases
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{activeQuest.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {activeQuest.mission}
            </p>

            {/* Pass Criteria */}
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-slate-400 block mb-2">
                Pass Criteria Checklist:
              </span>
              <div className="space-y-2">
                {activeQuest.criteria.map((crit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hint Accordion */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
                  {activeQuest.solutionHint}
                </div>
              )}
            </div>
          </div>

          {/* Test Cases Overview */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
              Automated Test Cases:
            </span>
            <div className="space-y-2.5">
              {activeQuest.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-semibold text-slate-200 mb-1 font-mono">
                    Case {idx + 1}: {tc.name}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 italic mb-1">
                    "{tc.input}"
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-mono">
                    Rule: {tc.expectedRule}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Editor & Test Execution */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Your Engineered Prompt Submission
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                Supports {`{{input}}`}
              </span>
            </div>

            {/* Optional System Prompt */}
            <div>
              <label className="text-[11px] font-mono font-semibold uppercase text-slate-400 block mb-1">
                System Instruction (Optional / Guardrails):
              </label>
              <textarea
                value={userSystem}
                onChange={(e) => setUserSystem(e.target.value)}
                rows={3}
                placeholder="System instructions or behavioral guardrails..."
                className="w-full bg-slate-950 rounded-lg p-2.5 text-xs font-mono text-slate-300 border border-slate-800 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* Prompt Template */}
            <div>
              <label className="text-[11px] font-mono font-semibold uppercase text-slate-400 block mb-1">
                Prompt Template:
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={10}
                placeholder="Write your prompt template including {{input}}..."
                className="w-full bg-slate-950 rounded-xl p-3.5 text-xs font-mono text-amber-100 border border-slate-800 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setUserSystem(activeQuest.starterSystemPrompt || '');
                  setUserPrompt(activeQuest.starterPromptTemplate);
                  setGradeResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Reset to Starter
              </button>

              <button
                onClick={handleGradeQuest}
                disabled={isGrading || !userPrompt.includes('input')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${isGrading ? 'animate-spin' : 'fill-white'}`} />
                <span>
                  {isGrading
                    ? 'Running Multi-Case Test...'
                    : 'Submit for Automated AI Grading'}
                </span>
              </button>
            </div>

            {!userPrompt.includes('input') && (
              <p className="text-[11px] text-amber-400/90 font-mono">
                ⚠️ Your prompt template must contain {`{{input}}`} so test cases can be injected!
              </p>
            )}

            {gradeError && (
              <p className="text-xs text-rose-400 font-medium">{gradeError}</p>
            )}
          </div>

          {/* Grading Scorecard View */}
          {gradeResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      gradeResult.grade.overallPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {gradeResult.grade.overallPassed ? (
                      <Trophy className="w-6 h-6 text-amber-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Challenge Assessment
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      {gradeResult.grade.overallPassed ? (
                        <span className="text-emerald-400">
                          PASSED — {activeQuest.badge} Unlocked!
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          RETRY NEEDED — Keep Engineering!
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="text-right font-mono bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Score</span>
                  <div className="text-xl font-bold text-amber-400">
                    {gradeResult.grade.score}/100
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {gradeResult.grade.summary}
              </p>

              {/* Itemized Test Cases Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                  Test Execution Breakdown ({gradeResult.testResults.length} cases):
                </span>
                {gradeResult.testResults.map((tr, idx) => {
                  const evalItem = gradeResult.grade.testEvaluations?.[idx];
                  const passed = evalItem?.passed ?? false;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        passed
                          ? 'bg-slate-950/80 border-emerald-900/50'
                          : 'bg-slate-950/80 border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <div className="flex items-center gap-2">
                          {passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className={passed ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                            {tr.testName}
                          </span>
                        </div>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tr.latencyMs}ms
                        </span>
                      </div>

                      {/* Actual model output */}
                      <div className="mb-2">
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          Model Output:
                        </span>
                        <pre className="mt-1 p-2 rounded bg-slate-900 text-[11px] font-mono text-slate-200 whitespace-pre-wrap max-h-32 overflow-y-auto border border-slate-800">
                          {tr.actualOutput}
                        </pre>
                      </div>

                      {evalItem?.critique && (
                        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          <span className="font-semibold text-slate-200">Evaluator: </span>
                          {evalItem.critique}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Improvement Advice */}
              {gradeResult.grade.improvementAdvice && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-900/40">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400 block mb-1.5">
                    How to Improve Your Prompt:
                  </span>
                  <ul className="space-y-1">
                    {gradeResult.grade.improvementAdvice.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
