import { KnowledgeArticle, Ticket, TicketMessage, AnalyticsSummary, RAGResult, CopilotAnalysis } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`API request to ${url} failed. Using optimistic/local handling:`, err);
    throw err;
  }
}

export const api = {
  // Knowledge Base APIs
  getArticles: async (query?: string): Promise<KnowledgeArticle[]> => {
    const url = query ? `${API_BASE_URL}/knowledge-base?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/knowledge-base`;
    return fetchJson<KnowledgeArticle[]>(url);
  },

  getArticleById: async (id: number): Promise<KnowledgeArticle> => {
    return fetchJson<KnowledgeArticle>(`${API_BASE_URL}/knowledge-base/${id}`);
  },

  createArticle: async (article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    return fetchJson<KnowledgeArticle>(`${API_BASE_URL}/knowledge-base`, {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },

  updateArticle: async (id: number, article: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    return fetchJson<KnowledgeArticle>(`${API_BASE_URL}/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
  },

  deleteArticle: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/knowledge-base/${id}`, { method: 'DELETE' });
  },

  voteArticle: async (id: number, isHelpful: boolean): Promise<KnowledgeArticle> => {
    return fetchJson<KnowledgeArticle>(`${API_BASE_URL}/knowledge-base/${id}/vote?isHelpful=${isHelpful}`, {
      method: 'POST',
    });
  },

  // Tickets APIs
  getTickets: async (status?: string): Promise<Ticket[]> => {
    const url = status ? `${API_BASE_URL}/tickets?status=${status}` : `${API_BASE_URL}/tickets`;
    return fetchJson<Ticket[]>(url);
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    return fetchJson<Ticket>(`${API_BASE_URL}/tickets/${id}`);
  },

  createTicket: async (ticket: Partial<Ticket>): Promise<Ticket> => {
    return fetchJson<Ticket>(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  updateTicketStatus: async (id: number, status: string, agentName?: string): Promise<Ticket> => {
    let url = `${API_BASE_URL}/tickets/${id}/status?status=${status}`;
    if (agentName) url += `&agentName=${encodeURIComponent(agentName)}`;
    return fetchJson<Ticket>(url, { method: 'PUT' });
  },

  deleteTicket: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/tickets/${id}`, { method: 'DELETE' });
  },

  getTicketMessages: async (id: number): Promise<TicketMessage[]> => {
    return fetchJson<TicketMessage[]>(`${API_BASE_URL}/tickets/${id}/messages`);
  },

  addMessage: async (id: number, message: { senderType: string; senderName: string; content: string }): Promise<TicketMessage> => {
    return fetchJson<TicketMessage>(`${API_BASE_URL}/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  // AI Assistant APIs
  askAiChatbot: async (message: string, customerEmail?: string): Promise<RAGResult> => {
    return fetchJson<RAGResult>(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, customerEmail }),
    });
  },

  analyzeTicketWithCopilot: async (ticketId: number): Promise<CopilotAnalysis> => {
    return fetchJson<CopilotAnalysis>(`${API_BASE_URL}/ai/copilot/analyze/${ticketId}`);
  },

  // Analytics API
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    return fetchJson<AnalyticsSummary>(`${API_BASE_URL}/analytics/summary`);
  },
};
