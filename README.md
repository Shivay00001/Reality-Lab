
# Reality Lab: AI Forensics Platform

A production-grade, multimodal AI detection platform built with **Gemini 3 Pro**. Reality Lab analyzes text, images, audio, and video to provide deep forensic reasoning on whether content is human-made or synthetically generated.

## Features

- **Multimodal Support**: Analysis of Text, Images, Audio, and Video files.
- **Gemini 3 Integration**: Utilizes advanced multimodal reasoning and long-context thinking for detection.
- **Forensic Signals**: Provides 3-5 specific technical indicators (e.g., temporal inconsistency, diffusion artifacts).
- **Verdict System**: Clear results (Human, Likely AI, Uncertain) with confidence scoring.
- **Zero Auth**: Publicly accessible without logins.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, FontAwesome.
- **Intelligence**: Google GenAI (Gemini 3 Pro) with Structured Outputs.
- **Language**: TypeScript.

## Deployment Instructions

### Prerequisites
- Node.js 18+
- A Google AI Studio API Key

### Environment Variables
Create a `.env` file or add to your provider (Vercel/Netlify):
```env
API_KEY=your_gemini_api_key_here
```

## Forensic Methodology

Reality Lab performs a structured audit across modalities:
- **Linguistic**: Checking for rhythmic sentence lengths and characteristic AI transitions.
- **Visual**: Searching for diffusion noise, anatomical errors, and frequency anomalies.
- **Acoustic**: Identifying voice jitter and flattened frequency ranges common in voice cloning.
- **Video**: Auditing temporal consistency, frame-to-frame warping, and lighting mismatches.

## Disclaimer
This tool provides probabilistic estimates. No AI detector is 100% accurate. Results should be treated as expert-level signals rather than conclusive proof.
