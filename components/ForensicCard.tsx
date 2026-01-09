
import React from 'react';
import { ForensicSignal } from '../types';

interface ForensicCardProps {
  signal: ForensicSignal;
}

const ForensicCard: React.FC<ForensicCardProps> = ({ signal }) => {
  const intensityColors = {
    LOW: 'text-green-400 bg-green-400/10',
    MEDIUM: 'text-yellow-400 bg-yellow-400/10',
    HIGH: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="bg-[#16161a] border border-white/5 p-4 rounded-xl hover:border-blue-500/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white text-sm">{signal.label}</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${intensityColors[signal.intensity]}`}>
          {signal.intensity}
        </span>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">
        {signal.description}
      </p>
    </div>
  );
};

export default ForensicCard;
