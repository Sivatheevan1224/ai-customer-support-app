'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, ThumbsUp, ThumbsDown, Eye, Sparkles, Filter, Tag, Layers, CheckCircle2, Trash2 } from 'lucide-react';
import { KnowledgeArticle } from '@/types';
import KnowledgeArticleModal from '@/components/KnowledgeArticleModal';
import { api } from '@/services/api';
import PageGuideHeader from '@/components/PageGuideHeader';

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDeleteArticle = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this Knowledge Base article?')) {
      try {
        await api.deleteArticle(id);
        loadArticles();
      } catch (err) {
        console.error('Failed to delete article:', err);
        loadArticles();
      }
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getArticles(searchQuery.trim() || undefined);
      setArticles(data);
    } catch (err) {
      // Seed fallback articles if offline
      setArticles([
        {
          id: 1,
          title: 'How to Reset Your Account Password',
          category: 'Authentication',
          tags: 'Password, Login, Reset, Security, 2FA',
          content: 'To reset your password:\n1. Click on "Forgot Password" on the login screen.\n2. Enter your registered email address.\n3. Check your inbox for a password reset token link.\n4. Click the link and enter a new password.',
          isPublished: true,
          viewsCount: 342,
          helpfulVotes: 48,
          unhelpfulVotes: 2,
        },
        {
          id: 2,
          title: 'Managing Subscription & Billing Invoices',
          category: 'Billing',
          tags: 'Billing, Subscription, Credit Card, Invoice',
          content: 'You can view and download past billing invoices under Account Settings > Billing & Payments.\n\nTo change your active plan:\n- Navigate to Plan & Usage.\n- Select Upgrade/Downgrade.',
          isPublished: true,
          viewsCount: 210,
          helpfulVotes: 35,
          unhelpfulVotes: 1,
        },
        {
          id: 3,
          title: 'API Key Generation & Rate Limits',
          category: 'API & Integration',
          tags: 'API, Developer, Webhook, Rate Limit',
          content: 'Standard API access supports up to 1,000 requests per minute per IP.\n\nTo generate an API key:\n1. Go to Developer Settings > API Keys.\n2. Click "Generate New Secret Key".',
          isPublished: true,
          viewsCount: 185,
          helpfulVotes: 29,
          unhelpfulVotes: 3,
        },
        {
          id: 4,
          title: 'Refund Policy & Requesting Cancellation',
          category: 'Billing',
          tags: 'Refund, Cancel, Subscription, Terms',
          content: 'We offer a 14-day full refund guarantee for all new annual subscriptions.\n\nTo request a refund:\n- Contact customer support within 14 days of purchase.',
          isPublished: true,
          viewsCount: 120,
          helpfulVotes: 19,
          unhelpfulVotes: 4,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
  };

  const handleVote = async (id: number, isHelpful: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.voteArticle(id, isHelpful);
      loadArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== 'ALL' && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        (art.tags && art.tags.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories = ['ALL', 'Authentication', 'Billing', 'API & Integration', 'Security', 'Troubleshooting'];

  return (
    <div className="space-y-6">
      
      {/* Page Purpose & How to Use Guide */}
      <PageGuideHeader
        title="Knowledge Base Intelligence Base"
        subtitle="RAG Context Repository"
        badgeText="Knowledge Base Management"
        description="This page allows support administrators to create, edit, publish, and structure reference help articles. Published articles are automatically indexed by the Spring Boot RAG Search Engine to provide accurate answers to customer questions."
        howToUse={[
          "Browse Articles: Search or filter articles by category (Authentication, Billing, API & Integration).",
          "Create Help Documentation: Click '+ Create New Article' to add troubleshooting steps and tags.",
          "Vote & Analytics: View helpful vs unhelpful votes and view counts to refine knowledge content."
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" /> Knowledge Base Management
          </h1>
          <p className="text-xs text-slate-400">
            Real-time indexed vector context base powering AI Support Bot responses & citations
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedArticle(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>

      {/* RAG Index Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span><strong>RAG Auto-Indexing Status:</strong> {articles.length} articles currently active & ready for semantic search Q&A.</span>
        </div>
        <span className="hidden sm:inline font-semibold text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge articles by query, tag, or title..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading knowledge articles...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
          No knowledge articles found. Click "Create New Article" to add one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
                setIsModalOpen(true);
              }}
              className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-medium">
                    {article.category}
                  </span>
                  <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Published
                  </span>
                </div>

                <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.content}
                </p>

                {article.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {article.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-500" /> {article.viewsCount} views</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleDeleteArticle(article.id, e)}
                    title="Delete Article"
                    className="p-1 rounded bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleVote(article.id, true, e)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-all"
                  >
                    <ThumbsUp className="w-3 h-3" /> {article.helpfulVotes}
                  </button>
                  <button
                    onClick={(e) => handleVote(article.id, false, e)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                  >
                    <ThumbsDown className="w-3 h-3" /> {article.unhelpfulVotes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      <KnowledgeArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadArticles}
      />
    </div>
  );
}
