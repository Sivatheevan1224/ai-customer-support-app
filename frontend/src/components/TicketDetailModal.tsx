'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, CheckCircle, Clock, Tag, AlertCircle, FileText, CornerDownLeft, Shield, Trash2 } from 'lucide-react';
import { Ticket, TicketMessage, CopilotAnalysis } from '../types';
import { PriorityBadge, SentimentBadge } from './PriorityBadge';
import { api } from '../services/api';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export default function TicketDetailModal({ ticket, isOpen, onClose, onTicketUpdated }: TicketDetailModalProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [agentName, setAgentName] = useState('Support Representative');
  const [copilot, setCopilot] = useState<CopilotAnalysis | null>(null);
  const [loadingCopilot, setLoadingCopilot] = useState(false);
  const [submittingMsg, setSubmittingMsg] = useState(false);

  useEffect(() => {
    if (ticket && isOpen) {
      loadMessagesAndCopilot(ticket.id);
    }
  }, [ticket, isOpen]);

  const loadMessagesAndCopilot = async (id: number) => {
    setLoadingCopilot(true);
    try {
      const msgs = await api.getTicketMessages(id);
      setMessages(msgs);

      const analysis = await api.analyzeTicketWithCopilot(id);
      setCopilot(analysis);
    } catch (err) {
      console.error('Error loading ticket details:', err);
    } finally {
      setLoadingCopilot(false);
    }
  };

  if (!isOpen || !ticket) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || submittingMsg) return;

    setSubmittingMsg(true);
    try {
      const addedMsg = await api.addMessage(ticket.id, {
        senderType: 'AGENT',
        senderName: agentName,
        content: newMessage,
      });

      setMessages((prev) => [...prev, addedMsg]);
      setNewMessage('');
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMsg(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateTicketStatus(ticket.id, newStatus, agentName);
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseSuggestedReply = (reply: string) => {
    setNewMessage(reply);
  };

  const handleDeleteTicket = async () => {
    if (window.confirm(`Are you sure you want to delete ticket #${ticket.id}? This action cannot be undone.`)) {
      try {
        await api.deleteTicket(ticket.id);
        onTicketUpdated();
        onClose();
      } catch (err) {
        console.error('Failed to delete ticket:', err);
        onTicketUpdated();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              #TICK-{ticket.id}
            </span>
            <PriorityBadge priority={ticket.priority} />
            <SentimentBadge sentiment={copilot?.sentiment || ticket.sentiment} />
            <h2 className="text-lg font-semibold text-white truncate max-w-md">{ticket.title}</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Actions */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ticket.status === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={handleDeleteTicket}
              title="Delete Ticket"
              className="p-2 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Chat Timeline (60%), Right AI Copilot (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Chat & Reply Area */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 bg-slate-950/40 overflow-hidden">
            
            {/* Message Thread */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400">{ticket.customerName || ticket.customerEmail}</span>
                  <span>{ticket.customerEmail}</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{ticket.description}</p>
              </div>

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.senderType === 'AGENT' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {msg.senderType === 'AGENT' ? (
                      <>
                        <span className="font-medium text-indigo-300">{msg.senderName}</span>
                        <Shield className="w-3 h-3 text-indigo-400" />
                      </>
                    ) : msg.senderType === 'AI_ASSISTANT' ? (
                      <>
                        <Bot className="w-3 h-3 text-emerald-400" />
                        <span className="font-medium text-emerald-300">AI Copilot Bot</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{msg.senderName}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.senderType === 'AGENT'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : msg.senderType === 'AI_ASSISTANT'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 rounded-tl-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Reply Box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Replying as:
                </span>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <textarea
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your response to the customer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Sending auto-notifies customer
                </span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || submittingMsg}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Send Response
                </button>
              </div>
            </form>

          </div>

          {/* Right AI Copilot Panel */}
          <div className="lg:col-span-5 p-5 bg-slate-900/60 overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" /> AI Agent Copilot
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                RAG Active
              </span>
            </div>

            {loadingCopilot && (
              <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Analyzing customer query & fetching suggested solutions...
              </div>
            )}

            {copilot && (
              <>
                {/* AI Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Summary & Context
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{copilot.summary}</p>
                </div>

                {/* Auto Tags */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> Auto-Detected Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {copilot.tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* One-Click AI Suggested Replies */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" /> Smart Suggested Replies
                  </div>
                  {copilot.suggestedReplies.map((reply, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleUseSuggestedReply(reply)}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-indigo-500/60 hover:bg-slate-900 transition-all cursor-pointer group space-y-2"
                    >
                      <p className="line-clamp-3 leading-relaxed">{reply}</p>
                      <div className="flex items-center justify-end text-[10px] font-semibold text-indigo-400 group-hover:underline">
                        Use this reply →
                      </div>
                    </div>
                  ))}
                </div>

                {/* Matching Knowledge Articles */}
                {copilot.relevantArticles.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Related Articles
                    </div>
                    {copilot.relevantArticles.map((art) => (
                      <div key={art.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-indigo-300">{art.title}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{art.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
