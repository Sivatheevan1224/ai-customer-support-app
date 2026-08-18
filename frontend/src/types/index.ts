export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags?: string;
  isPublished: boolean;
  viewsCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketMessage {
  id?: number;
  senderType: 'CUSTOMER' | 'AGENT' | 'AI_ASSISTANT';
  senderName: string;
  content: string;
  createdAt?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category?: string;
  tags?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED' | 'URGENT';
  aiSummary?: string;
  resolvedByAi?: boolean;
  assignedAgent?: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: TicketMessage[];
}

export interface AnalyticsSummary {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalKnowledgeArticles: number;
  aiDeflectionRate: number;
  avgResolutionTimeHours: number;
  customerSatisfactionScore: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
}

export interface RAGResult {
  answer: string;
  confidenceScore: number;
  requiresEscalation: boolean;
  referencedArticles: KnowledgeArticle[];
}

export interface CopilotAnalysis {
  summary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'FRUSTRATED' | 'URGENT';
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  suggestedReplies: string[];
  relevantArticles: KnowledgeArticle[];
}
