
import React, { useState } from 'react';
import { ContentType, AnalysisResult, UploadedFile } from './types';
import { performForensicAnalysis } from './services/geminiService';
import AnalysisView from './components/AnalysisView';

const MAX_FILE_SIZE = 30 * 1024 * 1024;

export default function App() {
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.TEXT);
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds 30MB deep-scan threshold.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        base64,
        previewUrl: URL.createObjectURL(selectedFile)
      });
      setError(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = activeTab === ContentType.TEXT ? textContent : file?.base64;
      if (!data) throw new Error("Input data missing.");
      
      const res = await performForensicAnalysis(activeTab, data, file?.type);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Forensic engine processing failure.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen flex flex-col">
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase">Neural Forensic Attribution v3.1</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Reality Lab</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Advanced unit for detecting <strong>Full-AI</strong>, <strong>AI-Edited (Semi-AI)</strong>, <strong>Documents</strong>, and <strong>3D Characters</strong>.
        </p>
      </header>

      {!result ? (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <div className="flex bg-[#121214] p-1.5 rounded-2xl border border-white/5 mb-8 overflow-x-auto no-scrollbar">
            {(['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT'] as ContentType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setActiveTab(type); setError(null); setFile(null); }}
                className={`flex-1 min-w-[90px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === type ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <i className={`fa-solid ${
                  type === 'TEXT' ? 'fa-align-left' : 
                  type === 'IMAGE' ? 'fa-image' : 
                  type === 'AUDIO' ? 'fa-wave-square' : 
                  type === 'VIDEO' ? 'fa-film' : 'fa-file-lines'
                }`}></i>
                {type}
              </button>
            ))}
          </div>

          <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col min-h-[400px]">
            {isAnalyzing && <div className="scanner-line"></div>}
            
            {activeTab === ContentType.TEXT ? (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste content for deep linguistic scan..."
                className="w-full flex-1 bg-transparent text-zinc-300 border-none focus:ring-0 resize-none text-lg mono"
                disabled={isAnalyzing}
              />
            ) : (
              <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center relative hover:border-blue-500/40 transition-all">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  disabled={isAnalyzing} 
                  accept={
                    activeTab === ContentType.IMAGE ? "image/*" :
                    activeTab === ContentType.AUDIO ? "audio/*" :
                    activeTab === ContentType.VIDEO ? "video/*" :
                    activeTab === ContentType.DOCUMENT ? ".pdf,.doc,.docx,.txt" : "*"
                  }
                />
                {!file ? (
                  <div className="text-center p-8">
                    <i className={`fa-solid ${
                      activeTab === ContentType.IMAGE ? 'fa-image' : 
                      activeTab === ContentType.AUDIO ? 'fa-microphone' : 
                      activeTab === ContentType.VIDEO ? 'fa-video' : 'fa-file-import'
                    } text-3xl text-blue-500 mb-4`}></i>
                    <p className="text-zinc-400">Upload {activeTab} for attribution audit</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    {activeTab === ContentType.IMAGE && <img src={file.previewUrl} className="max-h-60 rounded shadow-2xl mb-4" />}
                    {activeTab === ContentType.VIDEO && <video src={file.previewUrl} className="max-h-60 rounded shadow-2xl mb-4" muted autoPlay loop />}
                    {activeTab === ContentType.AUDIO && <i className="fa-solid fa-file-audio text-5xl text-blue-500 mb-4"></i>}
                    {activeTab === ContentType.DOCUMENT && <i className="fa-solid fa-file-pdf text-5xl text-blue-500 mb-4"></i>}
                    <p className="text-white font-semibold truncate max-w-xs">{file.name}</p>
                    <button onClick={() => setFile(null)} className="mt-4 text-xs text-red-400 font-black uppercase">Clear</button>
                  </div>
                )}
              </div>
            )}

            {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (activeTab === ContentType.TEXT ? !textContent : !file)}
              className="w-full mt-8 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold text-lg flex items-center justify-center gap-3 transition-all"
            >
              {isAnalyzing ? "PROBING NEURAL SIGNATURES..." : "LAUNCH DEEP SCAN"}
            </button>
          </div>
        </div>
      ) : (
        <AnalysisView result={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
}
