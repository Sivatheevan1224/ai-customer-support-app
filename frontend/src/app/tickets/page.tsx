'use client';

import React, { useState, useEffect } from 'react';
import { Ticket as TicketIcon, Filter, Plus, Sparkles, Search, MessageSquare, Clock, User, Shield } from 'lucide-react';
import { Ticket } from '@/types';
import { PriorityBadge, SentimentBadge } from '@/components/PriorityBadge';
import TicketDetailModal from '@/components/TicketDetailModal';
import { api } from '@/services/api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets(filterStatus === 'ALL' ? undefined : filterStatus);
      setTickets(data);
    } catch (err) {
      // Seed fallback tickets if offline
      setTickets([
        {
          id: 1,
          title: 'Unable to reset password via email link',
          description: 'I tried clicking the password reset link sent to my email john@example.com, but it keeps throwing an expired token error.',
          customerEmail: 'john.doe@example.com',
          customerName: 'John Doe',
          priority: 'HIGH',
          status: 'OPEN',
          category: 'Authentication',
          sentiment: 'FRUSTRATED',
          aiSummary: 'Customer reported expired token error when clicking reset link in password email.',
        },
        {
          id: 2,
          title: 'Invoice receipt query for July subscription',
          description: 'Need an itemized VAT invoice for our company tax filing for July 2026.',
          customerEmail: 'sarah.tech@acme.org',
          customerName: 'Sarah Jenkins',
          priority: 'LOW',
          status: 'RESOLVED',
          category: 'Billing',
          sentiment: 'NEUTRAL',
          aiSummary: 'Customer requested itemized VAT invoice for tax filing.',
          resolvedByAi: true,
        },
        {
          id: 3,
          title: 'API Webhook signature validation failing',
          description: 'Our webhook endpoint receives 401 response during HMAC-SHA256 signature verification. Is header format standard?',
          customerEmail: 'alex.dev@startup.io',
          customerName: 'Alex Rivera',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          category: 'API & Integration',
          sentiment: 'URGENT',
          aiSummary: 'Developer reported HMAC signature verification failure on API webhooks.',
          assignedAgent: 'Marcus Vance',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TicketIcon className="w-6 h-6 text-indigo-400" /> Agent Ticket Board Workspace
          </h1>
          <p className="text-xs text-slate-400">
            Real-time customer support queues powered by AI Copilot ticket summaries & sentiment analysis
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by title, email, or category..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span>Showing <strong className="text-white">{filteredTickets.length}</strong> tickets</span>
        </div>
      </div>

      {/* Ticket Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
          No tickets found matching the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => handleOpenTicket(t)}
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    #TICK-{t.id}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <PriorityBadge priority={t.priority} />
                    <SentimentBadge sentiment={t.sentiment} />
                  </div>
                </div>

                <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {t.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {t.aiSummary || t.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{t.customerName || t.customerEmail}</span>
                </div>

                {t.resolvedByAi ? (
                  <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Solved
                  </span>
                ) : (
                  <span className="text-indigo-400 font-medium group-hover:underline">
                    View Ticket →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Workspace Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketUpdated={loadTickets}
      />
    </div>
  );
}
