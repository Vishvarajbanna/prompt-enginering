import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Copy, 
  Check, 
  Swords, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { PromptDoctorReport } from '../types';

interface PromptDoctorProps {
  onSendToBattle: (promptA: string, promptB: string, systemA?: string, systemB?: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Vague Document Summary',
    goal: 'Summarize quarterly board meeting minutes for non-technical investors',
    prompt: 'Summarize these meeting minutes and make it sound good for investors. Don\'t make it too long and include all important stuff.',
  },
  {
    title: 'Customer Ticket Routing',
    goal: 'Categorize incoming support messages and detect angry customers',
    prompt: 'Look at the user feedback below and tell me what department it goes to and if the customer is mad or happy.',
  },
  {
    title: 'Code Refactoring Request',
    goal: 'Refactor a legacy JavaScript function to modern TypeScript with error handling',
    prompt: 'Make this JavaScript function better and faster, use TypeScript and fix any bugs.',
  },
];

export const PromptDoctor: React.FC<PromptDoctorProps> = ({ onSendToBattle }) => {
  const [userPrompt, setUserPrompt] = useState<string>(SAMPLE_PROMPTS[0].prompt);
  const [userGoal, setUserGoal] = useState<string>(SAMPLE_PROMPTS[0].goal);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [report, setReport] = useState<PromptDoctorReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedStructured, setCopiedStructured] = useState<boolean>(false);
  const [copiedFewShot, setCopiedFewShot] = useState<boolean>(false);

  const handleDiagnose = async () => {
    if (!userPrompt.trim()) return;
    setIsDiagnosing(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          goal: userGoal,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to diagnose prompt.');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error diagnosing prompt');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const copyText = (text: string, isStructured: boolean) => {
    navigator.clipboard.writeText(text);
    if (isStructured) {
      setCopiedStructured(true);
      setTimeout(() => setCopiedStructured(false), 2000);
    } else {
      setCopiedFewShot(true);
      setTimeout(() => setCopiedFewShot(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
            Auditor & Optimizer
          </span>
          <span className="text-xs text-slate-400">Prompt Engineering Doctor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Prompt Doctor & Optimizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Paste any prompt you are working on. Prompt Doctor audits it against production prompt engineering standards, scores it, identifies anti-patterns, and generates two rewritten, high-performing alternatives.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300">
            1. Provide Your Prompt & Goal
          </span>
          {/* Quick sample chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Load Sample:</span>
            {SAMPLE_PROMPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserPrompt(s.prompt);
                  setUserGoal(s.goal);
                  setReport(null);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Target Task / Business Goal (Optional context for the doctor):
            </label>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. Extract key financial metrics without conversational preamble..."
              className="w-full bg-slate-950 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 border border-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Your Current Prompt:
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={5}
              placeholder="Paste your prompt here..."
              className="w-full bg-slate-950 rounded-xl p-3.5 text-xs font-mono text-slate-200 border border-slate-800 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleDiagnose}
            disabled={isDiagnosing || !userPrompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            <Stethoscope className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'Auditing Prompt...' : 'Diagnose & Optimize Prompt'}</span>
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </div>

      {/* Audit Report View */}
      {report && (
        <div className="space-y-6">
          {/* Top Scorecard & Diagnosis */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-mono ${getScoreColor(
                    report.overallScore
                  )}`}
                >
                  <span className="text-2xl font-black">{report.overallScore}</span>
                  <span className="text-[10px] uppercase font-semibold">/100</span>
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    Prompt Engineering Health Rating
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {report.overallScore >= 80
                      ? 'Production-Grade Prompt'
                      : report.overallScore >= 60
                      ? 'Functional but Needs Hardening'
                      : 'High Risk of Hallucination or Drift'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {report.diagnosisSummary}
                  </p>
                </div>
              </div>

              {/* Dimensional Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Clarity</span>
                  <div className="text-sm font-bold text-cyan-400">{report.clarityScore}/10</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Specificity</span>
                  <div className="text-sm font-bold text-indigo-400">{report.specificityScore}/10</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Structure</span>
                  <div className="text-sm font-bold text-violet-400">{report.structureScore}/10</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Constraints</span>
                  <div className="text-sm font-bold text-emerald-400">{report.constraintScore}/10</div>
                </div>
              </div>
            </div>

            {/* Techniques Detected vs Missing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Detected Strengths</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.detectedTechniques && report.detectedTechniques.length > 0 ? (
                    report.detectedTechniques.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-mono"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Missing Opportunities</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingOpportunities?.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50 font-mono"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Tips */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-900/40">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-indigo-400 mb-2">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span>Doctor's Actionable Prescription</span>
              </div>
              <ul className="space-y-1.5">
                {report.actionableTips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 shrink-0 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Two Optimized Alternatives */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Engineered Upgrades Ready to Deploy
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Option 1: Structured & Delimited */}
              <div className="rounded-2xl bg-slate-900 border border-indigo-900/60 overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 bg-slate-950 border-b border-indigo-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                      Option 1: Structured & Delimited
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {report.optimizedVersionStructured.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        copyText(report.optimizedVersionStructured.prompt, true)
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
                    >
                      {copiedStructured ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedStructured ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        onSendToBattle(
                          userPrompt,
                          report.optimizedVersionStructured.prompt,
                          '',
                          report.optimizedVersionStructured.systemInstruction
                        )
                      }
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-indigo-600/30"
                      title="Battle against original"
                    >
                      <Swords className="w-3 h-3" />
                      <span>Battle vs Original</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col space-y-3">
                  {report.optimizedVersionStructured.systemInstruction && (
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                        System Instruction:
                      </span>
                      <pre className="mt-1 p-2 bg-slate-950 rounded text-xs font-mono text-indigo-200 border border-slate-800">
                        {report.optimizedVersionStructured.systemInstruction}
                      </pre>
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      Prompt Template:
                    </span>
                    <pre className="mt-1 p-3 bg-slate-950 rounded-xl text-xs font-mono text-cyan-100 border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {report.optimizedVersionStructured.prompt}
                    </pre>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-cyan-200">
                    <span className="font-semibold text-cyan-400 font-mono">Why it works: </span>
                    {report.optimizedVersionStructured.whyItWorks}
                  </div>
                </div>
              </div>

              {/* Option 2: Few-Shot & CoT */}
              <div className="rounded-2xl bg-slate-900 border border-cyan-900/60 overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 bg-slate-950 border-b border-cyan-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                      Option 2: Few-Shot & Chain-of-Thought
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {report.optimizedVersionFewShot.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyText(report.optimizedVersionFewShot.prompt, false)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1"
                    >
                      {copiedFewShot ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFewShot ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        onSendToBattle(
                          userPrompt,
                          report.optimizedVersionFewShot.prompt,
                          '',
                          report.optimizedVersionFewShot.systemInstruction
                        )
                      }
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-cyan-600/30"
                      title="Battle against original"
                    >
                      <Swords className="w-3 h-3" />
                      <span>Battle vs Original</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col space-y-3">
                  {report.optimizedVersionFewShot.systemInstruction && (
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                        System Instruction:
                      </span>
                      <pre className="mt-1 p-2 bg-slate-950 rounded text-xs font-mono text-cyan-200 border border-slate-800">
                        {report.optimizedVersionFewShot.systemInstruction}
                      </pre>
                    </div>
                  )}

                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      Prompt Template:
                    </span>
                    <pre className="mt-1 p-3 bg-slate-950 rounded-xl text-xs font-mono text-cyan-100 border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {report.optimizedVersionFewShot.prompt}
                    </pre>
                  </div>

                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200">
                    <span className="font-semibold text-cyan-400 font-mono">Why it works: </span>
                    {report.optimizedVersionFewShot.whyItWorks}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
