import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Copy, 
  Check, 
  Swords, 
  Sparkles, 
  Zap, 
  Clock, 
  Layers, 
  Compass, 
  ShieldAlert, 
  Cpu
} from 'lucide-react';
import { PromptTechnique } from '../types';
import { PROMPT_TECHNIQUES } from '../data/techniques';

interface TechniquesExplorerProps {
  onSendToBattle: (promptA: string, promptB: string, systemA?: string, systemB?: string) => void;
}

export const TechniquesExplorer: React.FC<TechniquesExplorerProps> = ({ onSendToBattle }) => {
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>(PROMPT_TECHNIQUES[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Playground state for current technique
  const [naivePrompt, setNaivePrompt] = useState<string>('');
  const [engineeredPrompt, setEngineeredPrompt] = useState<string>('');
  const [engineeredSystem, setEngineeredSystem] = useState<string>('');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [naiveOutput, setNaiveOutput] = useState<{ text: string; latencyMs: number } | null>(null);
  const [engineeredOutput, setEngineeredOutput] = useState<{ text: string; latencyMs: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const [copiedNaive, setCopiedNaive] = useState<boolean>(false);
  const [copiedEngineered, setCopiedEngineered] = useState<boolean>(false);

  const currentTechnique = PROMPT_TECHNIQUES.find((t) => t.id === selectedTechniqueId) || PROMPT_TECHNIQUES[0];

  // Sync state whenever selected technique changes
  React.useEffect(() => {
    setNaivePrompt(currentTechnique.exampleNaive.prompt);
    setEngineeredPrompt(currentTechnique.exampleEngineered.prompt);
    setEngineeredSystem(currentTechnique.exampleEngineered.system || '');
    setNaiveOutput(null);
    setEngineeredOutput(null);
    setRunError(null);
  }, [selectedTechniqueId]);

  const categories = ['All', 'Foundation', 'Reasoning', 'Structure', 'Steering', 'Reliability'];

  const filteredTechniques = activeCategory === 'All'
    ? PROMPT_TECHNIQUES
    : PROMPT_TECHNIQUES.filter((t) => t.category === activeCategory);

  const handleRunSideBySide = async () => {
    setIsRunning(true);
    setRunError(null);
    setNaiveOutput(null);
    setEngineeredOutput(null);

    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptA: naivePrompt,
          promptB: engineeredPrompt,
          systemA: currentTechnique.exampleNaive.system || '',
          systemB: engineeredSystem || '',
          evaluateComparison: false, // Just run both
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run side-by-side prompt generation.');
      }

      const data = await response.json();
      setNaiveOutput(data.resultA);
      setEngineeredOutput(data.resultB);
    } catch (err: any) {
      setRunError(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string, isNaive: boolean) => {
    navigator.clipboard.writeText(text);
    if (isNaive) {
      setCopiedNaive(true);
      setTimeout(() => setCopiedNaive(false), 2000);
    } else {
      setCopiedEngineered(true);
      setTimeout(() => setCopiedEngineered(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero introduction */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono">
            Interactive Curriculum
          </span>
          <span className="text-slate-400 text-xs">8 Core Architectural Patterns</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Prompt Engineering Masterclass
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-400 max-w-3xl">
          Learn how to turn unreliable, conversational AI responses into deterministic, production-grade outputs.
          Select any technique below, review the theory, and execute side-by-side tests live against Gemini 3.8 Flash.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Technique List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Techniques ({filteredTechniques.length})
          </div>
          <div className="space-y-2">
            {filteredTechniques.map((tech) => {
              const isSelected = tech.id === selectedTechniqueId;
              return (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTechniqueId(tech.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {tech.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        tech.difficulty === 'Beginner'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : tech.difficulty === 'Intermediate'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {tech.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{tech.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: In-depth Lesson & Interactive Side-by-Side Playground */}
        <div className="lg:col-span-8 space-y-6">
          {/* Technique Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 font-mono font-medium">
                {currentTechnique.category}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {currentTechnique.difficulty}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">{currentTechnique.name}</h2>
            <p className="mt-1 text-sm text-cyan-300 font-medium">{currentTechnique.tagline}</p>

            <div className="mt-4 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {currentTechnique.explanation}
            </div>

            {/* Golden Rule Callout */}
            <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-800/50">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                  Golden Rule
                </span>
                <p className="text-xs sm:text-sm text-cyan-100 font-medium mt-0.5">
                  {currentTechnique.keyRule}
                </p>
              </div>
            </div>
          </div>

          {/* Pitfalls & Best Practices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pitfalls */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-rose-950/60">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider font-mono mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Pitfalls</span>
              </div>
              <ul className="space-y-2">
                {currentTechnique.pitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-400 shrink-0 mt-0.5">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Practices */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-950/60">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider font-mono mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Engineered Best Practices</span>
              </div>
              <ul className="space-y-2">
                {currentTechnique.bestPractices.map((bp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Live Comparison Lab */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-white font-mono">
                    Side-by-Side Prompt Test Lab
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute the naive formulation vs. the engineered pattern in parallel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onSendToBattle(
                      naivePrompt,
                      engineeredPrompt,
                      currentTechnique.exampleNaive.system,
                      engineeredSystem
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                  title="Send these prompts to A/B Battle Arena for AI Judge Scoring"
                >
                  <Swords className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send to Battle</span>
                </button>

                <button
                  onClick={handleRunSideBySide}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
                  <span>{isRunning ? 'Running Both...' : 'Run Side-by-Side'}</span>
                </button>
              </div>
            </div>

            {runError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {runError}
              </div>
            )}

            {/* Side-by-side prompt editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1: Naive Prompt */}
              <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-mono font-medium text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Variant A (Naive / Unstructured)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(naivePrompt, true)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                  >
                    {copiedNaive ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNaive ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <textarea
                    value={naivePrompt}
                    onChange={(e) => setNaivePrompt(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 rounded-lg p-3 text-xs font-mono text-slate-300 border border-slate-800/80 focus:border-indigo-500 focus:outline-none resize-none"
                    placeholder="Enter naive prompt..."
                  />
                  <div className="mt-2 text-[11px] text-slate-400">
                    {currentTechnique.exampleNaive.description}
                  </div>
                </div>

                {/* Naive Output */}
                {naiveOutput && (
                  <div className="p-3 border-t border-slate-800 bg-slate-950/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                      <span className="text-rose-400 font-semibold">Model Response A:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {naiveOutput.latencyMs}ms
                      </span>
                    </div>
                    <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto bg-slate-900/90 p-2.5 rounded border border-slate-800">
                      {naiveOutput.text || '(Empty output)'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Column 2: Engineered Prompt */}
              <div className="flex flex-col rounded-xl border border-indigo-900/60 bg-slate-900/80 overflow-hidden shadow-lg shadow-indigo-950/20">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-indigo-900/40 text-xs">
                  <div className="flex items-center gap-2 font-mono font-medium text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Variant B (Engineered: {currentTechnique.name})</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(engineeredPrompt, false)}
                    className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                  >
                    {copiedEngineered ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEngineered ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 flex-1 flex flex-col space-y-2">
                  {engineeredSystem && (
                    <div>
                      <span className="text-[10px] uppercase font-mono font-semibold text-indigo-400">
                        System Instruction:
                      </span>
                      <textarea
                        value={engineeredSystem}
                        onChange={(e) => setEngineeredSystem(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 rounded-lg p-2 text-xs font-mono text-indigo-200 border border-indigo-900/50 focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <textarea
                      value={engineeredPrompt}
                      onChange={(e) => setEngineeredPrompt(e.target.value)}
                      rows={engineeredSystem ? 6 : 8}
                      className="w-full h-full bg-slate-950 rounded-lg p-3 text-xs font-mono text-cyan-100 border border-indigo-900/50 focus:border-cyan-500 focus:outline-none resize-none"
                      placeholder="Enter engineered prompt..."
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-cyan-400/90">
                    {currentTechnique.exampleEngineered.description}
                  </div>
                </div>

                {/* Engineered Output */}
                {engineeredOutput && (
                  <div className="p-3 border-t border-indigo-900/40 bg-slate-950/80">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono mb-1.5">
                      <span className="font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        Model Response B:
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {engineeredOutput.latencyMs}ms
                      </span>
                    </div>
                    <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto bg-slate-900/90 p-2.5 rounded border border-indigo-900/50">
                      {engineeredOutput.text || '(Empty output)'}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
