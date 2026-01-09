
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

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Verdict Summary */}
        <div className={`md:col-span-1 rounded-3xl border p-10 flex flex-col items-center justify-center text-center shadow-2xl ${getVerdictStyle(result.verdict)}`}>
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <i className="fa-solid fa-microchip text-[10px]"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">Attribution Result</span>
          </div>
          <h2 className="text-3xl font-black mb-6 tracking-tight">{result.verdict.replace('_', ' ')}</h2>
          
          <div className="relative w-40 h-40 flex items-center justify-center">
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
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white tracking-tighter">{result.confidence}%</span>
              <span className="text-[10px] uppercase font-bold opacity-60">Prob. Score</span>
            </div>
          </div>
          
          <div className="mt-8 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <p className="text-xs font-bold text-white/80 mono uppercase tracking-tight">{result.category}</p>
          </div>
        </div>

        {/* Detailed Technical Breakdown */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-inner">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i className="fa-solid fa-dna text-blue-400 text-sm"></i>
              </span>
              Technical Evidence
            </h3>
            
            <p className="text-zinc-400 text-md leading-relaxed mb-8 italic border-l-2 border-blue-500/30 pl-4">
              "{result.explanation}"
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {result.signals.map((signal, idx) => (
                <ForensicCard key={idx} signal={signal} />
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-[11px] text-zinc-500">
            <div className="flex items-start gap-4 leading-relaxed">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-scale-balanced text-[10px]"></i>
              </div>
              <p>
                <strong className="text-zinc-400 block mb-1">SCIENTIFIC TRANSPARENCY NOTICE:</strong> 
                This report is generated using Gemini 3's neural forensic reasoning. While highly accurate in detecting known synthetic patterns, 
                all results are probabilistic estimates. This platform does not guarantee 100% accuracy and should be used 
                to support, not replace, human institutional verification.
              </p>
            </div>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold uppercase tracking-widest text-zinc-300"
          >
            Reset Analysis Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
