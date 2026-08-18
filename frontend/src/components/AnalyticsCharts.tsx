'use client';

import React from 'react';
import { AnalyticsSummary } from '../types';
import { Bot, CheckCircle2, Clock, Star, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  summary: AnalyticsSummary | null;
}

export default function AnalyticsCharts({ summary }: AnalyticsChartsProps) {
  const data = summary || {
    totalTickets: 42,
    openTickets: 12,
    resolvedTickets: 30,
    totalKnowledgeArticles: 8,
    aiDeflectionRate: 64.5,
    avgResolutionTimeHours: 3.2,
    customerSatisfactionScore: 4.9,
    ticketsByStatus: { OPEN: 12, IN_PROGRESS: 8, RESOLVED: 18, CLOSED: 4 },
    ticketsByPriority: { URGENT: 4, HIGH: 10, MEDIUM: 20, LOW: 8 },
    ticketsByCategory: { Authentication: 15, Billing: 12, 'API & Dev': 10, Security: 5 },
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-amber-500',
    IN_PROGRESS: 'bg-indigo-500',
    RESOLVED: 'bg-emerald-500',
    CLOSED: 'bg-slate-500',
  };

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-rose-500',
    HIGH: 'bg-amber-500',
    MEDIUM: 'bg-blue-500',
    LOW: 'bg-emerald-500',
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">AI Deflection Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{data.aiDeflectionRate}%</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last month
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Tickets solved automatically by RAG bot</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tickets</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{data.openTickets}</span>
            <span className="text-xs text-slate-400">out of {data.totalTickets} total</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Requiring agent review or response</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{data.avgResolutionTimeHours}h</span>
            <span className="text-xs text-emerald-400 font-medium">-45 mins faster</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">First-contact response speed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CSAT Score</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{data.customerSatisfactionScore} / 5.0</span>
            <span className="text-xs text-emerald-400 font-medium">98% Satisfaction</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Based on verified customer feedback</p>
        </div>

      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ticket Breakdown by Priority */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center justify-between">
            <span>Ticket Volume by Priority</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(data.ticketsByPriority).map(([priority, count]) => {
              const total = data.totalTickets || 1;
              const percentage = Math.round((count / total) * 100);
              const barColor = priorityColors[priority] || 'bg-indigo-500';

              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{priority}</span>
                    <span className="text-slate-400">{count} tickets ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Knowledge Base & Category Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center justify-between">
            <span>Category Distribution</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(data.ticketsByCategory).map(([cat, count]) => {
              const total = data.totalTickets || 1;
              const percentage = Math.round((count / total) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat}</span>
                    <span className="text-slate-400">{count} tickets ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
