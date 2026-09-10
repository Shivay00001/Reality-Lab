# Reality Lab

Multi-model, multi-format detector for AI-generated / edited content (TypeScript). Self-hostable. Commercial license available.

![Language](https://img.shields.io/badge/Language-TypeScript-blue)
![Framework](https://img.shields.io/badge/Framework-React%2019%20%2B%20Vite-61dafb)
![AI Engine](https://img.shields.io/badge/Engine-Gemini%203%20Pro-blueviolet)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Custom%20Commercial-orange)

## 🚀 Overview

**Reality Lab** is a production-grade AI forensics and content attribution platform. It performs deep multimodal analysis of **text, images, audio, video, and documents** to determine whether content is human-made, fully AI-generated, AI-edited (Semi-AI), or a 3D/CGI render — powered by Google's **Gemini 3 Pro** with configurable "thinking budgets" per modality.

The system acts as a *Neural Forensic Auditor*: rather than returning a simple yes/no, it produces a structured forensic report containing a verdict, confidence score, origin category, a technical explanation, and a set of weighted detection signals (LOW / MEDIUM / HIGH intensity).

## ✨ Features

- **Multimodal Deep Scan:** Five analysis channels — Text, Image, Audio, Video, and Documents (PDF/DOC/DOCX).
- **Full-AI vs. Semi-AI Attribution:** Detects generative-fill seams, AI-upscaling artifacts, and mismatched pixel noise at edit boundaries.
- **3D Character Discrimination:** Distinguishes manual CGI/3D renders (perfect polygons, ray-traced shadows) from neural avatars (texture swimming, non-Euclidean geometry).
- **Adaptive Thinking Budgets:** Allocates more reasoning tokens to heavier modalities (Video: 24,576 → Text: 6,000) for deeper temporal/deepfake auditing.
- **Structured Forensic Reports:** JSON-schema-enforced output with verdict (`HUMAN` / `LIKELY_AI` / `UNCERTAIN`), confidence ring visualization, and exportable reports (`.json` download).
- **Forensic Signal Cards:** Each detection signal is labeled, described, and intensity-rated in the UI.
- **Featured Investigation Mode:** Built-in benchmark case viewer (embedded social-media stream) for calibrating against real-world multimodal content.
- **30MB Deep-Scan Threshold:** Client-side file size guard with base64 in-browser preprocessing.
- **Self-Hostable:** Ships with a multi-stage `Dockerfile` and `docker-compose.yml` for one-command deployment.

## 🏗️ Architecture / How It Works

```
┌────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                  │
│                                                            │
│  ┌──────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │ App.tsx  │──▶│ geminiService.ts │──▶│ AnalysisView   │  │
│  │ (input,  │   │ (forensic engine │   │ + ForensicCard │  │
│  │  tabs,   │   │  client)         │   │ (report UI,    │  │
│  │  upload) │   │                  │   │  JSON export)  │  │
│  └──────────┘   └────────┬─────────┘   └────────────────┘  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS (@google/genai SDK)
                           ▼
              ┌─────────────────────────┐
              │  Gemini 3 Pro (Preview) │
              │  • systemInstruction:   │
              │    forensic auditor     │
              │    persona              │
              │  • responseSchema:      │
              │    strict JSON output   │
              │  • thinkingConfig:      │
              │    per-modality budget  │
              └─────────────────────────┘
```

**Request flow:**

1. **Input capture (`App.tsx`):** User selects a modality tab. Text is captured directly; binary files are read via `FileReader`, converted to base64, and validated against a 30MB limit.
2. **Forensic dispatch (`services/geminiService.ts`):** `performForensicAnalysis(type, data, mimeType)` builds a modality-specific prompt (e.g., inter-frame motion vectors for video, burstiness/perplexity for text, phase-alignment for audio) and selects a thinking budget via `getThinkingBudget()`.
3. **Structured inference:** The model is constrained by a `responseSchema` guaranteeing a typed `AnalysisResult` — `verdict`, `confidence`, `category`, `explanation`, and `signals[]`.
4. **Report rendering (`AnalysisView.tsx`):** Results are visualized with an animated confidence ring, color-coded verdict panel, and a grid of `ForensicCard` signal components. Reports can be exported as timestamped JSON files.

**Key modules:**

| File | Responsibility |
|---|---|
| `App.tsx` | Application shell, tab navigation, file ingest, scan orchestration |
| `services/geminiService.ts` | Gemini client, forensic prompts, thinking budgets, schema enforcement |
| `components/AnalysisView.tsx` | Verdict dashboard, confidence ring, export handler |
| `components/ForensicCard.tsx` | Individual detection-signal rendering |
| `types.ts` | Shared domain types (`ContentType`, `Verdict`, `AnalysisResult`, `UploadedFile`) |
| `vite.config.ts` | Dev server (port 3000), env injection of `GEMINI_API_KEY` |

## 🛠️ Prerequisites

- **Node.js 18+** (or Docker — see below)
- **npm** (or a compatible package manager)
- A **Google Gemini API key** with access to `gemini-3-pro-preview` (get one at [Google AI Studio](https://aistudio.google.com/))

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shivay00001/Reality-Lab.git
   cd Reality-Lab
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API key. Create a `.env` file in the project root:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > Note: `vite.config.ts` injects `GEMINI_API_KEY` into `process.env.API_KEY` at build/dev time. The `.env.example` file is a generic placeholder — the variable that actually matters is `GEMINI_API_KEY`.

## 💻 Usage

**Development server:**
```bash
npm run dev
# → http://localhost:3000
```

**Production build & preview:**
```bash
npm run build
npm run preview
```

**Workflow:**
1. Select a modality tab (TEXT / IMAGE / AUDIO / VIDEO / DOCUMENT).
2. Paste text or upload a file (≤ 30MB).
3. Click **LAUNCH DEEP SCAN** — the scanner animation runs while Gemini performs the forensic audit.
4. Review the verdict, confidence score, category, and detection signals.
5. Optionally **Export Forensic Report** as JSON, or start a **New Investigation**.

## 🐳 Running with Docker

The repository ships with a multi-stage `Dockerfile` (Node 18 Alpine) and a `docker-compose.yml`, so it runs identically on any laptop or server.

**Option A — Docker Compose (recommended):**
```bash
docker-compose up --build
```
Then open **http://localhost:8091** (host port `8091` maps to container port `3000`).

**Option B — Plain Docker:**
```bash
docker build -t reality-lab .
docker run -p 8091:3000 reality-lab
```

**Providing the API key to the container:**
```bash
docker run -p 8091:3000 -e GEMINI_API_KEY=your_key_here reality-lab
```
or add it under `environment:` in `docker-compose.yml`. ⚠️ Because the key is injected at **build time** by Vite's `define`, for the key to reach the browser bundle you must pass it as a build-time variable (e.g., rebuild after setting `.env`) — see the Workability Assessment below.

## 🔍 Workability Assessment

An honest evaluation of the repository's current state:

**What works well:**
- ✅ The core forensic pipeline (`geminiService.ts`) is well-designed: modality-specific prompts, per-modality thinking budgets, and schema-enforced JSON output are genuinely production-grade patterns.
- ✅ The React UI is complete and polished (upload handling, scanner animation, confidence ring, JSON export).
- ✅ Type safety is solid via `types.ts`; Vite + TypeScript config is correct.
- ✅ Docker artifacts exist and the compose port mapping (`8091:3000`) matches the Vite server port.

**Known issues / gaps to fix before real production use:**
- ⚠️ **API key security (critical):** The Gemini key is baked into the client-side bundle via Vite `define`. Anyone can extract it from browser dev tools. For production, analysis calls should be proxied through a backend so the key stays server-side.
- ⚠️ **`index.html` mismatch:** The committed `index.html` is a generic "Enterprise Solution" landing page with **no `<div id="root">`** and no `<script type="module" src="/index.tsx">`. As committed, `npm run build` will produce the placeholder page (as seen in `dist/index.html`), **not** the React app. The entry HTML must be fixed to mount the application.
- ⚠️ **Dockerfile/start script:** `CMD ["npm", "start"]` is defined, but `package.json` has **no `start` script** — only `dev`, `build`, and `preview`. The container will fail to boot until a `start` script (e.g., `vite preview --host 0.0.0.0 --port 3000`) is added.
- ⚠️ **`.env.example` drift:** It documents `API_KEY` / `DATABASE_URL`, but the app actually reads `GEMINI_API_KEY`, and no database is used.
- ⚠️ **Missing UI dependencies in code:** The UI references Tailwind-style utility classes and Font Awesome icons (`fa-solid ...`), but neither Tailwind nor Font Awesome is declared in `package.json` or loaded in `index.html` — styling/icons will not render as intended without adding them.
- ⚠️ **No tests, no backend, no persistence:** Analysis history is not stored; results are non-deterministic model outputs (correctly labeled as a "Non-Deterministic Probability Report").
- ⚠️ **Model availability:** `gemini-3-pro-preview` requires appropriate API access; older keys/tiers may not support it.

**Verdict:** The forensic logic and UI are strong and genuinely functional, but the repo is **not yet plug-and-play production-ready**. Fixing the `index.html` entry point, adding a `start` script, declaring the CSS/icon dependencies, and moving the API key behind a server proxy are the four blocking items. Once addressed, this is a credible, self-hostable forensic analysis platform.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page. Please ensure any PR preserves the forensic output schema (`AnalysisResult`) so the reporting UI remains compatible.

## 📝 License

This project is distributed under the **VisionQuantech Custom Commercial License** (see `LICENSE`):

- **Non-financial / personal / educational use:** Free.
- **Individual revenue-generating use:** Requires a 15–30% revenue share.
- **Business / enterprise use:** Requires a separate commercial license — contact **visionquantech@proton.me**.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.