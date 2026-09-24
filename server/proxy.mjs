/**
 * Reality Lab — backend proxy (Node, zero dependencies).
 *
 * SECURITY: the Gemini API key lives ONLY here, server-side, read from the
 * GEMINI_API_KEY environment variable. It is never sent to the browser and
 * never baked into the frontend bundle.
 *
 * Endpoints:
 *   POST /api/analyze { type, data, mimeType } -> forensic AnalysisResult JSON
 *   GET  /api/health                           -> { ok: true }
 * Also serves the built frontend from ../dist when present (production).
 *
 * Env: GEMINI_API_KEY (required), GEMINI_MODEL (default gemini-2.5-pro), PORT (default 8080)
 */
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT || 8080);
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".ico": "image/x-icon", ".woff2": "font/woff2" };

const THINKING_BUDGET = { VIDEO: 24576, AUDIO: 16000, IMAGE: 12000, DOCUMENT: 10000, TEXT: 6000 };

const SYSTEM_PROMPT = `CORE DIRECTIVE: You are an elite Neural Forensic Auditor at Reality Lab.
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

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING", description: "HUMAN, LIKELY_AI, or UNCERTAIN" },
    confidence: { type: "NUMBER", description: "0-100" },
    category: { type: "STRING", description: "Origin class" },
    explanation: { type: "STRING", description: "Deep technical 'Why' behind the detection." },
    signals: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          description: { type: "STRING" },
          intensity: { type: "STRING", description: "LOW, MEDIUM, or HIGH" }
        },
        required: ["label", "description", "intensity"]
      }
    }
  },
  required: ["verdict", "confidence", "category", "explanation", "signals"]
};

function userPrompt(type) {
  const extra = {
    VIDEO: "Inter-frame motion vectors, deepfake warp-masks, and lighting-source persistence.",
    AUDIO: "Phase-alignment errors, frequency-response flattening, and voice cloning jitter.",
    IMAGE: "Stochastic noise distribution, 3D character texture vs neural texture, and generative fill seam audit.",
    DOCUMENT: "Document metadata inconsistencies, semantic uniformity, and AI-specific layout logic.",
    TEXT: "Burstiness metrics, perplexity variance, and model-bias markers."
  }[type] || "";
  return `[INITIATE LEVEL-5 FORENSIC SCAN]\nModality: ${type}\nInvestigation Focus: High-Precision Attribution (Full AI vs Semi-AI vs 3D Render).\n\nRequired Forensic Checks:\n${extra}\n\nDeliver a definitive report on the 'WHY'.`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleAnalyze(req, res) {
  if (!API_KEY) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "GEMINI_API_KEY is not set on the server." }));
    return;
  }
  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "Invalid JSON body" })); return; }

  const { type = "TEXT", data = "", mimeType = "application/octet-stream" } = body;
  if (!data) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Input data missing." }));
    return;
  }

  const parts = type === "TEXT"
    ? [{ text: `${userPrompt(type)}\n\nCONTENT:\n${data}` }]
    : [{ text: userPrompt(type) }, { inlineData: { mimeType, data } }];

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: THINKING_BUDGET[type] || 8000 }
    }
  };

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify(payload)
    }
  );
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Gemini API error ${upstream.status}`, detail: detail.slice(0, 500) }));
    return;
  }
  const json = await upstream.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forensic engine returned an empty response." }));
    return;
  }
  let parsed;
  try { parsed = JSON.parse(text); }
  catch { res.writeHead(502, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "Forensic engine returned invalid JSON." })); return; }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(parsed));
}

async function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(DIST, p === "/" ? "index.html" : p);
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!existsSync(file)) file = path.join(DIST, "index.html"); // SPA fallback
  if (!existsSync(file)) { res.writeHead(404, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "Not built yet - run npm run build" })); return; }
  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  res.end(await readFile(file));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/health") && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, keyConfigured: Boolean(API_KEY) }));
      return;
    }
    if (req.url.startsWith("/api/analyze") && req.method === "POST") {
      await handleAnalyze(req, res);
      return;
    }
    if (req.url.startsWith("/api/")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unknown API route" }));
      return;
    }
    await serveStatic(req, res);
  } catch (e) {
    console.error("proxy error:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal proxy error" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Reality Lab proxy listening on :${PORT} (key configured: ${Boolean(API_KEY)}, model: ${MODEL})`);
});
