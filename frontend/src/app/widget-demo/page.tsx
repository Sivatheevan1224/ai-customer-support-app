'use client';

import React from 'react';
import { Bot, MessageSquareText, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import AiChatWidget from '@/components/AiChatWidget';

export default function WidgetDemoPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquareText className="w-6 h-6 text-emerald-400" /> Customer Support AI Chatbot Simulation
        </h1>
        <p className="text-xs text-slate-400">
          Embeddable customer widget simulation running real-time RAG Q&A retrieval and automatic ticket escalation
        </p>
      </div>

      {/* Main Layout: Left Information Guide, Right Widget Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Explanation Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> How Customer RAG Chat Works
            </h3>
            
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold mt-0.5">1</span>
                <div>
                  <strong className="text-white">Customer Ask Question:</strong> Customer types any query (e.g., password reset, billing invoice, API key rate limits).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold mt-0.5">2</span>
                <div>
                  <strong className="text-white">Spring Boot RAG Engine:</strong> RAG engine calculates semantic similarity against published Knowledge Base articles.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold mt-0.5">3</span>
                <div>
                  <strong className="text-white">Cited Articles & Confidence Score:</strong> Response is returned with exact article citations and confidence metric.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold mt-0.5">4</span>
                <div>
                  <strong className="text-white">One-Click Escalation:</strong> If confidence is low or user requests live support, a support ticket is created directly on the Agent Board.
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Embedded Snippet Integration
            </div>
            <p className="text-slate-300 leading-relaxed">
              This widget can be embedded on any external SaaS app or website with a single JavaScript tag:
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 text-indigo-300 border border-slate-800 font-mono text-[11px] overflow-x-auto">
              {`<script src="http://localhost:3000/widget.js" data-app-key="NEXUS_API_KEY"></script>`}
            </pre>
          </div>
        </div>

        {/* Right Live Widget Simulation */}
        <div className="lg:col-span-6 flex justify-center">
          <AiChatWidget />
        </div>

      </div>

    </div>
  );
}
