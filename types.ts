
export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

export enum Verdict {
  HUMAN = 'HUMAN',
  LIKELY_AI = 'LIKELY_AI',
  UNCERTAIN = 'UNCERTAIN'
}

export interface ForensicSignal {
  label: string;
  description: string;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  category: string;
  explanation: string;
  signals: ForensicSignal[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl: string;
}
