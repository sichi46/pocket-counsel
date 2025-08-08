// apps/web/src/lib/trpc.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

// Define the API types based on what we know from the backend
interface AskQuestionInput {
  question: string;
  topK: number;
}

interface AskQuestionResponse {
  answer: string;
  sources: Array<{
    source?: string;
    documentName?: string;
    title?: string;
    content?: string;
    similarity?: number;
    score?: number;
  }>;
  confidence?: number;
  metadata?: {
    totalChunks: number;
    searchTime: number;
    model: string;
  };
  model?: string;
  provider?: string;
}

interface HealthResponse {
  status: string;
  message?: string;
  timestamp: string;
  database?: string;
  environment?: string;
  project?: string;
  location?: string;
  models?: {
    generative: string;
    provider: string;
  };
  rag?: {
    status: string;
    documents: number;
    type: string;
  };
}

interface StatsResponse {
  success: boolean;
  stats: {
    documents: number;
    chunks: number;
    embeddings: number;
  };
  type: string;
}

// Define the tRPC client type
type TRPCClient = {
  askQuestion: {
    query: (input: AskQuestionInput) => Promise<AskQuestionResponse>;
  };
  health: {
    query: () => Promise<HealthResponse>;
  };
  getStats: {
    query: () => Promise<StatsResponse>;
  };
  listDocuments: {
    query: () => Promise<any>;
  };
};

// Create tRPC client for connecting to the backend API
export const trpc = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'https://api-6otymacelq-uc.a.run.app/trpc',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
}) as unknown as TRPCClient;
