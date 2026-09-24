import { ContentType, AnalysisResult } from "../types";

/**
 * Forensic analysis client — SECURITY FIX (wave-1, 2026-09-24):
 * The Gemini API key previously lived in the browser bundle (injected via
 * vite's `define` from GEMINI_API_KEY). It now lives ONLY on the backend
 * proxy (server/proxy.mjs, GEMINI_API_KEY env var). The browser just POSTs
 * the sample to /api/analyze and gets back the AnalysisResult JSON.
 */
export const performForensicAnalysis = async (
  type: ContentType,
  data: string,
  mimeType?: string
): Promise<AnalysisResult> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data, mimeType }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Analysis request failed (${response.status}).`);
    }

    return (await response.json()) as AnalysisResult;
  } catch (error) {
    console.error("Forensic Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Scan Aborted: Sample exceeds neural complexity or contains safety-blocked data."
    );
  }
};
