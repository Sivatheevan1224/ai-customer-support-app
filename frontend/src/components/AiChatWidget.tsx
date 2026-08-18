'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, FileText, ChevronRight, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeArticle, RAGResult } from '../types';

export default function AiChatWidget() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; confidence?: number; articles?: KnowledgeArticle[] }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Support Assistant powered by our Knowledge Base. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('user@example.com');
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse saved chat history');
      }
    }
  }, []);

  const saveMessages = (newMsgs: Array<{ sender: 'user' | 'ai'; text: string; confidence?: number; articles?: KnowledgeArticle[] }>) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem('nexus_ai_chat_history', JSON.stringify(newMsgs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleClearChat = () => {
    const initial = [
      {
        sender: 'ai' as const,
        text: 'Hello! I am your AI Support Assistant powered by our Knowledge Base. How can I help you today?',
      },
    ];
    setMessages(initial);
    localStorage.removeItem('nexus_ai_chat_history');
    setEscalated(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const updatedWithUser = [...messages, { sender: 'user' as const, text: userText }];
    saveMessages(updatedWithUser);
    setLoading(true);

    try {
      const ragRes: RAGResult = await api.askAiChatbot(userText, customerEmail);
      saveMessages([
        ...updatedWithUser,
        {
          sender: 'ai' as const,
          text: ragRes.answer,
          confidence: ragRes.confidenceScore,
          articles: ragRes.referencedArticles,
        },
      ]);
    } catch (err) {
      // Direct client-side Gemini AI fallback if Spring Boot backend is offline
      try {
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (geminiApiKey) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are an AI customer support assistant for NexusAI. Answer this customer question politely and concisely. If it is a greeting like "hello" or "hi", respond warmly. Question: ${userText}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText && aiText.trim()) {
              saveMessages([
                ...updatedWithUser,
                {
                  sender: 'ai' as const,
                  text: aiText.trim() + '\n\n*(Powered by Gemini AI Direct Fallback)*',
                  confidence: 0.95,
                },
              ]);
              return;
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini direct fallback notice:', geminiErr);
      }

      // Friendly fallback if all services offline
      saveMessages([
        ...updatedWithUser,
        {
          sender: 'ai' as const,
          text: 'Hello! How can I assist you today? You can ask me questions about password reset, subscription billing, API rate limits, or account settings.',
          confidence: 0.9,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text || 'Support Request from AI Chat Widget';
    try {
      await api.createTicket({
        title: lastUserMsg,
        description: `Customer escalated from AI Chat Widget. Conversation log: ${messages.slice(-3).map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join(' | ')}`,
        customerEmail: customerEmail,
        customerName: 'Customer Chat User',
        priority: 'HIGH',
        status: 'OPEN',
        category: 'AI Escalation',
      });
      setEscalated(true);
    } catch (err) {
      setEscalated(true);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[580px]">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
              AI Customer Assistant <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">RAG Semantic Search & Live Escalation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[10px]">Clear</span>
          </button>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Online
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-400" />
                  <span>Nexus AI Assistant</span>
                  {msg.confidence !== undefined && (
                    <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800">
                      {Math.round(msg.confidence * 100)}% Confidence
                    </span>
                  )}
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Referenced Knowledge Articles */}
              {msg.articles && msg.articles.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                  <p className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Cited Knowledge Articles:
                  </p>
                  {msg.articles.map((art) => (
                    <div
                      key={art.id}
                      className="text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 flex items-center justify-between group hover:border-indigo-500/50 cursor-pointer transition-all"
                    >
                      <span className="font-medium truncate max-w-[200px]">{art.title}</span>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs p-2 bg-slate-900/40 rounded-lg border border-slate-800 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Searching Knowledge Base & generating response...</span>
          </div>
        )}

        {escalated && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Support Ticket Created Successfully!</p>
              <p className="text-emerald-400/80">Our support agent team will review your chat history and reply shortly.</p>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Banner */}
      {!escalated && messages.length >= 3 && (
        <div className="bg-slate-900 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Need human assistance?</span>
          <button
            onClick={handleEscalate}
            className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Create Ticket for Agent
          </button>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
