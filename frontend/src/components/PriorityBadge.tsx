import React from 'react';
import { AlertCircle, AlertTriangle, Info, Flame, Smile, Frown, Meh, Zap } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const p = priority ? priority.toUpperCase() : 'MEDIUM';

  const config: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    LOW: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: Info,
    },
    MEDIUM: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: AlertCircle,
    },
    HIGH: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
    },
    URGENT: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400 animate-pulse',
      border: 'border-rose-500/40 shadow-sm shadow-rose-500/20',
      icon: Flame,
    },
  };

  const style = config[p] || config.MEDIUM;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {p}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment?: string }) {
  if (!sentiment) return null;
  const s = sentiment.toUpperCase();

  const config: Record<string, { bg: string; icon: any }> = {
    POSITIVE: { bg: 'bg-emerald-950 text-emerald-300 border-emerald-800', icon: Smile },
    NEUTRAL: { bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: Meh },
    FRUSTRATED: { bg: 'bg-amber-950 text-amber-300 border-amber-800', icon: Frown },
    URGENT: { bg: 'bg-rose-950 text-rose-300 border-rose-800', icon: Zap },
  };

  const style = config[s] || config.NEUTRAL;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${style.bg}`}>
      <Icon className="w-3 h-3 mr-1" />
      {s}
    </span>
  );
}
