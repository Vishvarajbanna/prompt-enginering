import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: DEFAULT_MODEL,
  });
});

// Single prompt execution
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, temperature, topP, thinkingLevel } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const config: any = {};
    if (systemInstruction && systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }
    if (typeof temperature === 'number') {
      config.temperature = Math.max(0, Math.min(2, temperature));
    }
    if (typeof topP === 'number') {
      config.topP = Math.max(0, Math.min(1, topP));
    }
    if (thinkingLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(thinkingLevel)) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel[thinkingLevel as keyof typeof ThinkingLevel],
      };
    }

    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config,
    });
    const latencyMs = Date.now() - startTime;

    res.json({
      text: response.text || '',
      latencyMs,
      usageMetadata: response.usageMetadata || null,
    });
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini.',
    });
  }
});

// A/B Prompt Battle execution and comparative evaluation
app.post('/api/battle', async (req, res) => {
  try {
    const {
      promptA,
      promptB,
      systemA,
      systemB,
      inputVariables,
      temperatureA,
      temperatureB,
      evaluateComparison = true,
    } = req.body;

    if (!promptA || !promptB) {
      return res.status(400).json({ error: 'Both Prompt A and Prompt B are required.' });
    }

    // Replace variable placeholders like {{input}} or {input}
    const injectVars = (template: string) => {
      let result = template;
      if (inputVariables && typeof inputVariables === 'object') {
        for (const [key, value] of Object.entries(inputVariables)) {
          const regex1 = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          const regex2 = new RegExp(`{\\s*${key}\\s*}`, 'g');
          result = result.replace(regex1, String(value)).replace(regex2, String(value));
        }
      }
      return result;
    };

    const finalPromptA = injectVars(promptA);
    const finalPromptB = injectVars(promptB);

    const configA: any = {};
    if (systemA && systemA.trim()) configA.systemInstruction = systemA.trim();
    if (typeof temperatureA === 'number') configA.temperature = temperatureA;

    const configB: any = {};
    if (systemB && systemB.trim()) configB.systemInstruction = systemB.trim();
    if (typeof temperatureB === 'number') configB.temperature = temperatureB;

    // Run both generations concurrently
    const startA = Date.now();
    const startB = Date.now();

    const [resA, resB] = await Promise.allSettled([
      ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: finalPromptA,
        config: configA,
      }),
      ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: finalPromptB,
        config: configB,
      }),
    ]);

    const resultA =
      resA.status === 'fulfilled'
        ? {
            text: resA.value.text || '',
            latencyMs: Date.now() - startA,
            usage: resA.value.usageMetadata || null,
            error: null,
          }
        : {
            text: '',
            latencyMs: Date.now() - startA,
            usage: null,
            error: resA.reason?.message || 'Error executing Prompt A',
          };

    const resultB =
      resB.status === 'fulfilled'
        ? {
            text: resB.value.text || '',
            latencyMs: Date.now() - startB,
            usage: resB.value.usageMetadata || null,
            error: null,
          }
        : {
            text: '',
            latencyMs: Date.now() - startB,
            usage: null,
            error: resB.reason?.message || 'Error executing Prompt B',
          };

    // If both succeeded and comparison requested, generate judge critique
    let evaluation: any = null;
    if (evaluateComparison && !resultA.error && !resultB.error) {
      try {
        const judgePrompt = `You are a world-class Prompt Engineering Judge.
Evaluate and compare two prompts and their respective model outputs based on core prompt engineering principles:
1. Clarity & Specificity
2. Format / Schema Adherence
3. Reasoning & Depth
4. Conciseness / Token Efficiency
5. Instruction Following & Guardrails

PROMPT A:
"""
System: ${systemA || 'None'}
User Prompt: ${finalPromptA}
"""

OUTPUT A:
"""
${resultA.text}
"""

PROMPT B:
"""
System: ${systemB || 'None'}
User Prompt: ${finalPromptB}
"""

OUTPUT B:
"""
${resultB.text}
"""

Provide an objective evaluation formatted as valid JSON adhering to this schema:
{
  "winner": "A" | "B" | "TIE",
  "scoreA": number (1-100),
  "scoreB": number (1-100),
  "summary": "1-2 sentences summarizing the verdict",
  "strengthsA": ["strength 1", "strength 2"],
  "weaknessesA": ["weakness 1"],
  "strengthsB": ["strength 1", "strength 2"],
  "weaknessesB": ["weakness 1"],
  "techniqueInsight": "Deep educational takeaway on why the prompt design differences changed the result."
}`;

        const judgeResponse = await ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents: judgePrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                winner: { type: Type.STRING },
                scoreA: { type: Type.NUMBER },
                scoreB: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                strengthsA: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknessesA: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengthsB: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknessesB: { type: Type.ARRAY, items: { type: Type.STRING } },
                techniqueInsight: { type: Type.STRING },
              },
              required: ['winner', 'scoreA', 'scoreB', 'summary', 'techniqueInsight'],
            },
          },
        });

        if (judgeResponse.text) {
          evaluation = JSON.parse(judgeResponse.text);
        }
      } catch (err: any) {
        console.warn('Judge evaluation failed:', err);
      }
    }

    res.json({
      resultA,
      resultB,
      evaluation,
    });
  } catch (error: any) {
    console.error('Error in /api/battle:', error);
    res.status(500).json({ error: error.message || 'Failed to execute battle.' });
  }
});

// Prompt Doctor / Optimizer
app.post('/api/doctor', async (req, res) => {
  try {
    const { prompt, goal } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const doctorInstructions = `You are Prompt Doctor, a senior prompt engineering auditor.
Analyze the provided user prompt against prompt engineering best practices:
- Role & Persona definition
- Delimiters (markdown tags, xml brackets, quotes)
- Explicit output formatting (e.g. JSON schema, bullet structure)
- Few-shot examples (are they missing when beneficial?)
- Step-by-step reasoning / Chain of Thought guidance
- Negative constraints & edge case handling
- Ambiguity & hallucination prevention

Goal context: ${goal || 'General purpose prompt'}
User prompt to diagnose:
"""
${prompt}
"""

Return a structured JSON report with an overall score (0-100), key metrics (0-10), diagnosed issues with explanations, concrete tips, and two high-performing rewritten versions:
1. Version A: "Structured & Delimited" (Focuses on clear sections, XML tags, explicit constraints, and output format)
2. Version B: "Few-Shot & Chain-of-Thought" (Focuses on step-by-step thinking breakdown and demonstration examples)`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: doctorInstructions,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            clarityScore: { type: Type.NUMBER },
            specificityScore: { type: Type.NUMBER },
            structureScore: { type: Type.NUMBER },
            constraintScore: { type: Type.NUMBER },
            diagnosisSummary: { type: Type.STRING },
            detectedTechniques: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedVersionStructured: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                technique: { type: Type.STRING },
                systemInstruction: { type: Type.STRING },
                prompt: { type: Type.STRING },
                whyItWorks: { type: Type.STRING },
              },
              required: ['title', 'technique', 'prompt', 'whyItWorks'],
            },
            optimizedVersionFewShot: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                technique: { type: Type.STRING },
                systemInstruction: { type: Type.STRING },
                prompt: { type: Type.STRING },
                whyItWorks: { type: Type.STRING },
              },
              required: ['title', 'technique', 'prompt', 'whyItWorks'],
            },
          },
          required: [
            'overallScore',
            'clarityScore',
            'specificityScore',
            'structureScore',
            'diagnosisSummary',
            'actionableTips',
            'optimizedVersionStructured',
            'optimizedVersionFewShot',
          ],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/doctor:', error);
    res.status(500).json({ error: error.message || 'Failed to inspect prompt.' });
  }
});

// Quest / Challenge Grading
app.post('/api/grade-quest', async (req, res) => {
  try {
    const { questId, questTitle, criteria, testCases, userSystemPrompt, userPromptTemplate } = req.body;

    if (!userPromptTemplate || !Array.isArray(testCases)) {
      return res.status(400).json({ error: 'Missing required challenge parameters.' });
    }

    // Run user prompt on test cases
    const testResults = [];
    for (const testCase of testCases) {
      let populatedPrompt = userPromptTemplate;
      if (testCase.input) {
        populatedPrompt = populatedPrompt.replace(/\{\{\s*input\s*\}\}/g, testCase.input)
          .replace(/\{\s*input\s*\}/g, testCase.input);
        // Also handle {{variable}} mapping if object
        if (typeof testCase.variables === 'object') {
          for (const [k, v] of Object.entries(testCase.variables)) {
            populatedPrompt = populatedPrompt.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
          }
        }
      }

      const config: any = {};
      if (userSystemPrompt && userSystemPrompt.trim()) {
        config.systemInstruction = userSystemPrompt.trim();
      }

      const start = Date.now();
      try {
        const genRes = await ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents: populatedPrompt,
          config,
        });
        testResults.push({
          testId: testCase.id || testCase.name,
          testName: testCase.name,
          input: testCase.input || testCase.variables,
          expectedRule: testCase.expectedRule,
          actualOutput: genRes.text || '',
          latencyMs: Date.now() - start,
          error: null,
        });
      } catch (err: any) {
        testResults.push({
          testId: testCase.id || testCase.name,
          testName: testCase.name,
          input: testCase.input || testCase.variables,
          expectedRule: testCase.expectedRule,
          actualOutput: '',
          latencyMs: Date.now() - start,
          error: err.message || 'Model execution error',
        });
      }
    }

    // Now evaluate test outputs with the AI Judge
    const judgePrompt = `You are evaluating a prompt engineering submission for a quest named: "${questTitle}".
QUEST CRITERIA:
${JSON.stringify(criteria, null, 2)}

USER SYSTEM PROMPT:
"""${userSystemPrompt || '(None)'}"""

USER PROMPT TEMPLATE:
"""${userPromptTemplate}"""

TEST EXECUTION RESULTS:
${JSON.stringify(testResults, null, 2)}

Evaluate each test case for compliance with the criteria and test expectations.
Grade the submission with an overall pass/fail, a score out of 100, itemized feedback per test case, and advice on how to improve the prompt.
Adhere strictly to this JSON schema:`;

    const judgeEval = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: judgePrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallPassed: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            testEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  passed: { type: Type.BOOLEAN },
                  critique: { type: Type.STRING },
                },
                required: ['testName', 'passed', 'critique'],
              },
            },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['overallPassed', 'score', 'summary', 'testEvaluations', 'improvementAdvice'],
        },
      },
    });

    const parsedGrade = JSON.parse(judgeEval.text || '{}');

    res.json({
      testResults,
      grade: parsedGrade,
    });
  } catch (error: any) {
    console.error('Error in /api/grade-quest:', error);
    res.status(500).json({ error: error.message || 'Failed to grade challenge.' });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptCraft Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
