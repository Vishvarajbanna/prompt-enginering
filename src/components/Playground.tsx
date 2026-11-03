import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Sliders, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  Cpu, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

interface RunHistoryItem {
  id: string;
  timestamp: string;
  prompt: string;
  system?: string;
  output: string;
  latencyMs: number;
  tokens?: number;
}

export const Playground: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    `<role>
You are an expert distributed systems engineer.
</role>

<task>
Explain the difference between Paxos and Raft consensus algorithms in 3 clear comparison dimensions.
</task>

<output_format>
- Dimension 1: [Leader election mechanism]
- Dimension 2: [Log replication & state management]
- Dimension 3: [Understandability & implementation complexity]
</output_format>`
  );

  const [systemInstruction, setSystemInstruction] = useState<string>(
    'Tone: Crisp, authoritative, objective. Zero marketing filler.'
  );

  // Model parameters
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.95);
  const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Session history
  const [history, setHistory] = useState<RunHistoryItem[]>([]);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          temperature,
          topP,
          thinkingLevel,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate output.');
      }

      const data = await response.json();
      setOutput(data.text);
      setLatencyMs(data.latencyMs);
      const totalTokens = data.usageMetadata?.totalTokenCount || null;
      setTokensUsed(totalTokens);

      // Append to history
      const newHistoryItem: RunHistoryItem = {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        prompt,
        system: systemInstruction,
        output: data.text,
        latencyMs: data.latencyMs,
        tokens: totalTokens,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || 'Error generating response');
    } finally {
      setIsRunning(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rough estimate of tokens (~4 chars per token)
  const estimatedInputTokens = Math.ceil((prompt.length + systemInstruction.length) / 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
            Sandbox Environment
          </span>
          <span className="text-xs text-slate-400">Gemini 3.8 Flash Playground</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Prompt Engineering Sandbox
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Freeform experimentation environment. Tune temperature, top-p, thinking levels, and system instructions with immediate feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt Editor & Config */}
        <div className="lg:col-span-7 space-y-5">
          {/* Parameter Tuning Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hyperparameter Controls</span>
              </span>
              <span className="text-slate-400 text-[11px]">Model: gemini-3.8-flash</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Temperature</span>
                  <span className="text-cyan-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {temperature < 0.3 ? 'Deterministic / Exact' : temperature > 1.0 ? 'Highly Creative' : 'Balanced'}
                </span>
              </div>

              {/* Top-P */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Top-P</span>
                  <span className="text-indigo-400 font-bold">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nucleus Sampling</span>
              </div>

              {/* Thinking Level */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Thinking Level</span>
                  <span className="text-violet-400 font-bold">{thinkingLevel}</span>
                </div>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-[10px] font-mono font-bold">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setThinkingLevel(lvl)}
                      className={`flex-1 py-1 rounded transition-colors ${
                        thinkingLevel === lvl ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Gemini 3 Reasoning</span>
              </div>
            </div>
          </div>

          {/* System Instruction */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-slate-400 block">
              System Instruction
            </label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              rows={2}
              placeholder="System prompt context..."
              className="w-full bg-slate-950 rounded-lg p-2.5 text-xs font-mono text-indigo-200 border border-slate-800 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Prompt Editor */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-200">User Prompt</span>
              <span className="text-slate-400">
                ~{estimatedInputTokens} tokens ({prompt.length} chars)
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={11}
              placeholder="Enter your prompt here..."
              className="w-full bg-slate-950 rounded-xl p-3.5 text-xs font-mono text-cyan-100 border border-slate-800 focus:border-cyan-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setPrompt('');
                  setOutput('');
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
                <span>{isRunning ? 'Generating...' : 'Execute Prompt'}</span>
              </button>
            </div>

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          </div>
        </div>

        {/* Right Column: Output & Session History */}
        <div className="lg:col-span-5 space-y-5">
          {/* Response Output Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-[380px]">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Response Stream</span>
              </span>
              <div className="flex items-center gap-3 text-slate-400">
                {latencyMs !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {latencyMs}ms
                  </span>
                )}
                {tokensUsed !== null && <span>{tokensUsed} tok</span>}
                {output && (
                  <button
                    onClick={copyOutput}
                    className="hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 flex-1 bg-slate-950/60 overflow-y-auto">
              {output ? (
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
                  <Cpu className="w-8 h-8 text-slate-700" />
                  <p className="text-xs font-mono">Click "Execute Prompt" to test your prompt in real-time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Session History */}
          {history.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Session History ({history.length})</span>
                <button
                  onClick={() => setHistory([])}
                  className="text-slate-400 hover:text-slate-200 text-[11px]"
                >
                  Clear history
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPrompt(item.prompt);
                      if (item.system) setSystemInstruction(item.system);
                      setOutput(item.output);
                      setLatencyMs(item.latencyMs);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800/80 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono text-slate-200 truncate block">
                        {item.prompt.slice(0, 40)}...
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp} • {item.latencyMs}ms
                      </span>
                    </div>
                    <span className="text-cyan-400 text-[11px] font-mono shrink-0">Restore</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
