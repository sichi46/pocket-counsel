import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Configuration ---
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';

// Use the correct Google Generative AI model name
const GEMINI_MODEL = 'gemini-1.5-flash';

const t = initTRPC.create();

// Mock document database for testing
const mockDocuments = [
  {
    id: 'children-code',
    title: 'The Children\'s Code Act No. 12 of 2022',
    content: 'The Children\'s Code Act provides comprehensive protection for children in Zambia. It establishes the rights of children including the right to education, health care, protection from abuse and exploitation, and the right to participate in decisions affecting them. The Act also establishes mechanisms for child protection and welfare.',
    source: 'ACT No. 12 OF 2022, The Children\'s Code FINAL.pdf'
  },
  {
    id: 'employment-code',
    title: 'The Employment Code Act No. 3 of 2019',
    content: 'The Employment Code Act regulates employment relationships in Zambia. It covers minimum wage, working hours, leave entitlements, termination procedures, and worker protection. The Act also establishes the Employment Rights Tribunal for resolving employment disputes.',
    source: 'The Employment Code Act No. 3 of 2019.pdf'
  },
  {
    id: 'companies-act',
    title: 'The Companies Act 2017',
    content: 'The Companies Act governs the formation, operation, and dissolution of companies in Zambia. It covers company registration, corporate governance, shareholder rights, director responsibilities, and financial reporting requirements.',
    source: 'The Companies Act-2017-10-publication-document.pdf'
  }
];

// Simple search function
function searchDocuments(query: string, documents: typeof mockDocuments) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  return documents.map(doc => {
    const contentWords = doc.content.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const titleWords = doc.title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const contentMatches = queryWords.filter(word => contentWords.includes(word)).length;
    const titleMatches = queryWords.filter(word => titleWords.includes(word)).length;
    
    const score = contentMatches + (titleMatches * 2); // Title matches are weighted higher
    
    return { ...doc, score };
  })
  .filter(doc => doc.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
}

export const appRouter = t.router({
  health: t.procedure
    .query(async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        project: GCP_PROJECT_ID,
        location: GCP_LOCATION,
        models: {
          generative: GEMINI_MODEL,
          provider: 'Google Generative AI',
        },
        rag: {
          status: 'active',
          documents: mockDocuments.length,
          type: 'mock-database'
        }
      };
    }),

  askQuestion: t.procedure
    .input(
      z.object({
        question: z.string(),
        topK: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ input }) => {
      const { question, topK } = input;

      try {
        const startTime = Date.now();
        
        // Search for relevant documents
        const searchResults = searchDocuments(question, mockDocuments);
        console.log(`Found ${searchResults.length} relevant documents`);
        
        // Prepare context
        const context = searchResults.length > 0 
          ? searchResults.map((doc, index) => 
              `Document ${index + 1}: ${doc.title}\nSource: ${doc.source}\nContent: ${doc.content}\n\n---`
            ).join('\n')
          : 'No relevant documents found.';
        
        // Generate answer using AI
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error('Google API key not configured');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        
        const prompt = `You are a legal assistant for Zambian law. Answer the following question based on the provided legal documents. Only use information from the context provided. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${question}

Please provide a clear, accurate answer based on the Zambian legal documents provided. Include relevant citations when possible.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text() || 'Sorry, I was unable to generate an answer.';
        
        const searchTime = Date.now() - startTime;
        
        // Prepare sources
        const sources = searchResults.map(doc => ({
          documentName: doc.source,
          title: doc.title,
          content: doc.content.substring(0, 200) + '...',
          similarity: doc.score,
          chunkIndex: 0,
        }));
        
        return {
          answer,
          sources,
          metadata: {
            totalChunks: mockDocuments.length,
            searchTime,
            model: GEMINI_MODEL,
          },
          model: GEMINI_MODEL,
          provider: 'Google Generative AI',
        };
      } catch (error) {
        console.error('Error in askQuestion:', error);
        return {
          answer: `Sorry, I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sources: [],
          metadata: {
            totalChunks: 0,
            searchTime: 0,
            model: GEMINI_MODEL,
          },
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  getStats: t.procedure
    .query(async () => {
      return {
        success: true,
        stats: {
          documents: mockDocuments.length,
          chunks: mockDocuments.length,
          embeddings: mockDocuments.length,
        },
        type: 'mock-database'
      };
    }),

  listDocuments: t.procedure
    .query(async () => {
      return {
        success: true,
        documents: mockDocuments.map(doc => doc.source),
        count: mockDocuments.length,
        type: 'mock-database'
      };
    }),
});

export type AppRouter = typeof appRouter;
