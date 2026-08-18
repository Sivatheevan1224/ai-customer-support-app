'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Ticket, BookOpen, MessageSquareText, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import { AnalyticsSummary } from '@/types';
import { api } from '@/services/api';

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const summary = await api.getAnalyticsSummary();
      setAnalytics(summary);
    } catch (err) {
      console.warn('Analytics backend offline, showing fallback visual state.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-8 border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> RAG & Copilot Operations Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Customer Support & Knowledge Intelligence
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Automate customer query resolution with vector knowledge retrieval, intelligent ticket routing, sentiment detection, and AI copilot suggested agent replies.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/tickets"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Ticket className="w-4 h-4" /> Go to Agent Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/widget-demo"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <MessageSquareText className="w-4 h-4 text-indigo-400" /> Test Customer AI Chat Widget
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> System Operations & Performance
          </h2>
          <span className="text-xs text-slate-400">Live Spring Boot Telemetry</span>
        </div>

        <AnalyticsCharts summary={analytics} />
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <Link href="/tickets" className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 space-y-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
            Agent Ticket Workspace
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage live ticket queues, view customer conversation threads, and use one-click AI Copilot suggested responses.
          </p>
        </Link>

        <Link href="/knowledge" className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 space-y-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit group-hover:bg-purple-600 group-hover:text-white transition-all">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            Knowledge Base Index
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Publish, edit, and categorize help documentation automatically indexed for RAG customer support retrieval.
          </p>
        </Link>

        <Link href="/widget-demo" className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
            Customer AI Chat Widget
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive chatbot widget simulator featuring instant RAG answers, article citations, and agent escalation.
          </p>
        </Link>

      </div>

    </div>
  );
}
