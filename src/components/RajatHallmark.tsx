import React from 'react';
import { Award, Sparkles, Heart } from 'lucide-react';

interface RajatHallmarkProps {
  variant?: 'badge' | 'footer' | 'banner' | 'compact';
  className?: string;
}

export const RajatHallmark: React.FC<RajatHallmarkProps> = ({
  variant = 'badge',
  className = '',
}) => {
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white border border-emerald-500/40 text-[11px] font-semibold tracking-wide shadow-xs group cursor-default ${className}`}
        title="Official Creator Hallmark: Made by Rajat"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-300 font-medium">Hallmark:</span>
        <span className="text-emerald-300 font-bold group-hover:text-emerald-200 transition">
          Made by Rajat
        </span>
        <Sparkles className="w-3 h-3 text-amber-300 ml-0.5" />
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white border border-emerald-500/30 text-xs shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-emerald-400 tracking-wide text-xs">
                HALLMARK
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-100">Made by Rajat</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Architected to empower students to study with maximum efficiency
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-500/30">
          <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <span>Creator Seal</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md ${className}`}
      >
        <Sparkles className="w-3 h-3 text-emerald-600" />
        <span>Made by Rajat</span>
      </span>
    );
  }

  // Footer variant
  return (
    <div
      className={`py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-medium text-slate-600">
          Zygard AI Study Bot • Active Recall & Exam Synthesizer
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white border border-emerald-500/40 font-semibold text-[11px] shadow-2xs">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Hallmark:</span>
          <span className="text-emerald-300 font-bold">Made by Rajat</span>
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
