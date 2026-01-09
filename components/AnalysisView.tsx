import React from 'react';
import { AnalysisResult, Verdict } from '../types';
import ForensicCard from './ForensicCard';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const getVerdictStyle = (v: Verdict) => {
    switch (v) {
      case Verdict.HUMAN: return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case Verdict.LIKELY_AI: return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default: return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `reality-lab-report-${timestamp}.json`;
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* Main Verdict Summary */}
        <div className={`md:col-span-1 rounded-3xl border p-10 flex flex-col items-center justify-center text-center shadow-2xl ${getVerdictStyle(result.verdict)}`}>
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <i className="fa-solid fa-microchip text-[10px]"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">Attribution Result</span>
          </div>
          <h2 className="text-3xl font-black mb-6 tracking-tight uppercase whitespace-nowrap">
            {result.verdict.replace('_', ' ')}
          </h2>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80" cy="80" r="72"
                stroke="currentColor" strokeWidth="6"
                fill="transparent" className="opacity-10"
              />
              <circle
                cx="80" cy="80" r="72"
                stroke="currentColor" strokeWidth="6"
                fill="transparent"
                strokeDasharray={452.4}
                strokeDashoffset={452.4 - (452.4 * result.confidence) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black">{result.confidence}%</span>
              <span className="text-[10px] uppercase font-bold opacity-60">Confidence</span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-full border border-current/20 text-[10px] font-bold uppercase tracking-widest">
            {result.category}
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-waveform text-blue-500"></i>
              Forensic Summary
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              {result.explanation}
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-fingerprint text-blue-500"></i>
              Detection Signals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.signals.map((signal, idx) => (
                <ForensicCard key={idx} signal={signal} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <button
          onClick={onReset}
          className="flex-1 py-5 px-6 rounded-2xl bg-[#121214] border border-white/10 text-white font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group"
        >
          <i className="fa-solid fa-rotate-left group-hover:rotate-180 transition-transform duration-500"></i>
          NEW INVESTIGATION
        </button>
        <button
          onClick={handleExport}
          className="flex-1 py-5 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
        >
          <i className="fa-solid fa-download"></i>
          EXPORT FORENSIC REPORT
        </button>
      </div>

      <footer className="mt-16 text-center border-t border-white/5 pt-8">
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">
          Reality Lab Forensic Unit • Non-Deterministic Probability Report • v3.1
        </p>
      </footer>
    </div>
  );
};

export default AnalysisView;