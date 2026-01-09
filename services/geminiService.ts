
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, AnalysisResult, Verdict } from "../types";

const getThinkingBudget = (type: ContentType): number => {
  switch (type) {
    case ContentType.VIDEO: return 24576; // Max budget for temporal/deepfake auditing
    case ContentType.AUDIO: return 16000;
    case ContentType.IMAGE: return 12000;
    case ContentType.DOCUMENT: return 10000;
    case ContentType.TEXT: return 6000;
    default: return 8000;
  }
};

export const performForensicAnalysis = async (
  type: ContentType,
  data: string, 
  mimeType?: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const systemPrompt = `CORE DIRECTIVE: You are an elite Neural Forensic Auditor at Reality Lab.
Your analysis must be 100% grounded in technical signal detection. Do not guess. Search for architectural fingerprints.

SPECIFIC TARGETS:
- FULL AI: Total generation (Sora, Flux.1, GPT-4, Midjourney).
- SEMI-AI (EDITED): Content that is part-human, part-AI. Look for "generative fill" seams, AI-upscaling artifacts, and mismatched pixel noise at edit boundaries.
- 3D CHARACTERS: Distinguish between "Manual CGI/3D Renders" (perfect polygons, ray-traced shadows) and "Neural Avatars" (texture swimming, non-Euclidean geometry).
- DOCUMENTS: Analyze PDFs/Docs for AI-generated text structures, synthetic formatting patterns, and LLM-typical semantic "smoothing".

FORENSIC AUDIT LAYERS:
- Physics Audit: Do the shadows and motion vectors follow real-world light?
- Frequency Audit: Are there "ringing" artifacts common in AI synthesis?
- Entropy Audit: Is the linguistic or visual noise too "perfect" or "stochastic"?

OUTPUT PROTOCOL:
- JSON Response Only.
- Explain 'WHY' using technical forensic terminology.`;

  const userPrompt = `[INITIATE LEVEL-5 FORENSIC SCAN]
Modality: ${type}
Investigation Focus: High-Precision Attribution (Full AI vs Semi-AI vs 3D Render).

Required Forensic Checks:
${type === ContentType.VIDEO ? "Inter-frame motion vectors, deepfake warp-masks, and lighting-source persistence." : ""}
${type === ContentType.AUDIO ? "Phase-alignment errors, frequency-response flattening, and voice cloning jitter." : ""}
${type === ContentType.IMAGE ? "Stochastic noise distribution, 3D character texture vs neural texture, and generative fill seam audit." : ""}
${type === ContentType.DOCUMENT ? "Document metadata inconsistencies, semantic uniformity, and AI-specific layout logic." : ""}
${type === ContentType.TEXT ? "Burstiness metrics, perplexity variance, and model-bias markers." : ""}

Deliver a definitive report on the 'WHY'.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      verdict: { type: Type.STRING, description: "HUMAN, LIKELY_AI, or UNCERTAIN" },
      confidence: { type: Type.NUMBER, description: "0-100" },
      category: { type: Type.STRING, description: "Origin class (e.g., 'Semi-AI Edited', '3D Rendered Avatar', 'Full AI Video', 'Human')" },
      explanation: { type: Type.STRING, description: "Deep technical 'Why' behind the detection." },
      signals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            description: { type: Type.STRING },
            intensity: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" }
          },
          required: ["label", "description", "intensity"]
        }
      }
    },
    required: ["verdict", "confidence", "category", "explanation", "signals"]
  };

  try {
    const budget = getThinkingBudget(type);
    const contents = type === ContentType.TEXT 
      ? { parts: [{ text: `${userPrompt}\n\nCONTENT:\n${data}` }] }
      : { parts: [{ text: userPrompt }, { inlineData: { mimeType: mimeType || 'application/octet-stream', data: data } }] };

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: budget }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Forensic engine returned invalid stream.");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Forensic Error:", error);
    throw new Error("Scan Aborted: Sample exceeds neural complexity or contains safety-blocked data.");
  }
};
