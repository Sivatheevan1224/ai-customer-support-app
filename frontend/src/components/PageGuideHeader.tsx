import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Sparkles, HelpCircle, Lightbulb } from 'lucide-react';

interface PageGuideHeaderProps {
  title: string;
  subtitle: string;
  badgeText: string;
  description: string;
  howToUse: string[];
}

export default function PageGuideHeader({
  title,
  subtitle,
  badgeText,
  description,
  howToUse,
}: PageGuideHeaderProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              {badgeText}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              {description}
            </p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>{expanded ? 'Hide Guide' : 'How to Use This Page'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-5 pt-4 border-t border-indigo-500/10 grid grid-cols-1 md:grid-cols-3 gap-3">
            {howToUse.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <span className="text-slate-300 leading-relaxed pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
