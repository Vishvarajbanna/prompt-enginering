export type AppTab = 'techniques' | 'battle' | 'doctor' | 'quests' | 'playground';

export interface PromptTechnique {
  id: string;
  name: string;
  tagline: string;
  category: 'Foundation' | 'Reasoning' | 'Structure' | 'Steering' | 'Reliability';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  explanation: string;
  keyRule: string;
  pitfalls: string[];
  bestPractices: string[];
  exampleNaive: {
    system?: string;
    prompt: string;
    description: string;
  };
  exampleEngineered: {
    system?: string;
    prompt: string;
    description: string;
  };
  testVariables?: Record<string, string>;
  interactiveChallengePrompt?: string;
}

export interface BattleEvaluation {
  winner: 'A' | 'B' | 'TIE';
  scoreA: number;
  scoreB: number;
  summary: string;
  strengthsA: string[];
  weaknessesA: string[];
  strengthsB: string[];
  weaknessesB: string[];
  techniqueInsight: string;
}

export interface BattleResult {
  text: string;
  latencyMs: number;
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  } | null;
  error?: string | null;
}

export interface PromptDoctorReport {
  overallScore: number;
  clarityScore: number;
  specificityScore: number;
  structureScore: number;
  constraintScore: number;
  diagnosisSummary: string;
  detectedTechniques: string[];
  missingOpportunities: string[];
  actionableTips: string[];
  optimizedVersionStructured: {
    title: string;
    technique: string;
    systemInstruction?: string;
    prompt: string;
    whyItWorks: string;
  };
  optimizedVersionFewShot: {
    title: string;
    technique: string;
    systemInstruction?: string;
    prompt: string;
    whyItWorks: string;
  };
}

export interface QuestTestCase {
  id: string;
  name: string;
  input: string;
  variables?: Record<string, string>;
  expectedRule: string;
}

export interface Quest {
  id: string;
  title: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Hard' | 'Expert';
  techniqueFocus: string;
  mission: string;
  criteria: string[];
  starterSystemPrompt?: string;
  starterPromptTemplate: string;
  testCases: QuestTestCase[];
  solutionHint: string;
}

export interface QuestGrade {
  overallPassed: boolean;
  score: number;
  summary: string;
  testEvaluations: {
    testName: string;
    passed: boolean;
    critique: string;
  }[];
  keyStrengths: string[];
  improvementAdvice: string[];
}

export interface SavedPromptTemplate {
  id: string;
  title: string;
  technique: string;
  system?: string;
  prompt: string;
  category: string;
  tags: string[];
}
