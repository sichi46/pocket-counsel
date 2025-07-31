export interface User {
  uid: string;
  email: string;
  createdAt: Date;
  subscriptionStatus: 'free' | 'premium';
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  query: string;
  response: string;
  sources: LegalSource[];
  rating?: 'up' | 'down';
  createdAt: Date;
}

export interface LegalSource {
  title: string;
  section: string;
  content: string;
  url?: string;
  page?: number;
}

export interface RAGResponse {
  answer: string;
  sources: LegalSource[];
  confidence: number;
}

export interface MessageStatus {
  id: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export interface VertexAIConfig {
  projectId: string;
  location: string;
  modelName: string;
  endpointId?: string;
}

export interface CorpusDocument {
  id: string;
  title: string;
  content: string;
  metadata: {
    source: string;
    section?: string;
    page?: number;
    date?: string;
  };
} 