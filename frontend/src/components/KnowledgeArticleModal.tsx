'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Eye, ThumbsUp, ThumbsDown, BookOpen, Tag, Layers, Trash2 } from 'lucide-react';
import { KnowledgeArticle } from '../types';
import { api } from '../services/api';

interface KnowledgeArticleModalProps {
  article: KnowledgeArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function KnowledgeArticleModal({ article, isOpen, onClose, onSaved }: KnowledgeArticleModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Authentication');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setCategory(article.category || 'Authentication');
      setTags(article.tags || '');
      setContent(article.content);
      setIsPublished(article.isPublished);
    } else {
      setTitle('');
      setCategory('Authentication');
      setTags('');
      setContent('');
      setIsPublished(true);
    }
  }, [article, isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (article?.id && window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      setLoading(true);
      try {
        await api.deleteArticle(article.id);
        onSaved();
        onClose();
      } catch (err) {
        onSaved();
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      if (article?.id) {
        await api.updateArticle(article.id, {
          title,
          category,
          tags,
          content,
          isPublished,
        });
      } else {
        await api.createArticle({
          title,
          category,
          tags,
          content,
          isPublished,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {article ? 'Edit Knowledge Article' : 'Create New Knowledge Article'}
              </h2>
              <p className="text-xs text-slate-400">Indexed for real-time RAG customer support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-950/40">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Article Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Configure Single Sign-On (SSO)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Authentication">Authentication</option>
                <option value="Billing">Billing & Subscription</option>
                <option value="API & Integration">API & Integration</option>
                <option value="Security">Security & Privacy</option>
                <option value="Troubleshooting">Troubleshooting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. SSO, Auth, SAML, Password"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Article Content (Markdown / Text)
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed step-by-step resolution guide for customers..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
              />
              <span className="text-sm font-medium text-slate-300">Publish Article immediately to AI Vector Index</span>
            </label>

            {article && (
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.viewsCount} views</span>
                <span className="flex items-center gap-1 text-emerald-400"><ThumbsUp className="w-3.5 h-3.5" /> {article.helpfulVotes}</span>
                <span className="flex items-center gap-1 text-rose-400"><ThumbsDown className="w-3.5 h-3.5" /> {article.unhelpfulVotes}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between">
            {article?.id ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Article
              </button>
            ) : <div />}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
