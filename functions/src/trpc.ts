import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentProcessor } from './services/documentProcessor';
import { GCSDocumentProcessor } from './services/gcsDocumentProcessor';
import { RAGService } from './services/ragService';

// --- Configuration ---
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';

// Use the correct Google Generative AI model name
const GEMINI_MODEL = 'gemini-1.5-flash';

const t = initTRPC.create();

// Initialize document processor lazily
let documentProcessor: DocumentProcessor | null = null;

function getDocumentProcessor(): DocumentProcessor {
  if (!documentProcessor) {
    documentProcessor = new DocumentProcessor();
  }
  return documentProcessor;
}

export const appRouter = t.router({
  health: t.procedure
    .query(async () => {
      try {
        // Get processed documents count
        const documents = await getDocumentProcessor().getProcessedDocuments();
        
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
            documents: documents.length,
            type: 'firestore-database'
          }
        };
      } catch (error) {
        console.error('Health check error:', error);
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          project: GCP_PROJECT_ID,
          location: GCP_LOCATION,
          error: error instanceof Error ? error.message : 'Unknown error',
          rag: {
            status: 'error',
            documents: 0,
            type: 'error'
          }
        };
      }
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
        
        // Search for relevant documents using real document processor
        const searchResults = await getDocumentProcessor().searchDocuments(question, topK);
        console.log(`Found ${searchResults.length} relevant documents`);
        
        // Prepare context from real documents
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
        
        // Prepare sources from real documents
        const sources = searchResults.map(doc => ({
          documentName: doc.source,
          title: doc.title,
          content: doc.content.substring(0, 200) + '...',
          similarity: doc.score ? doc.score / 10 : 0, // Normalize score
          chunkIndex: doc.chunkIndex,
        }));
        
        return {
          answer,
          sources,
          metadata: {
            totalChunks: searchResults.length,
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
      try {
        const documents = await getDocumentProcessor().getProcessedDocuments();
        const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks.length, 0);
        
        return {
          success: true,
          stats: {
            documents: documents.length,
            chunks: totalChunks,
            embeddings: totalChunks, // Each chunk is an embedding
          },
          type: 'firestore-database'
        };
      } catch (error) {
        console.error('Error getting stats:', error);
        return {
          success: false,
          stats: {
            documents: 0,
            chunks: 0,
            embeddings: 0,
          },
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  listDocuments: t.procedure
    .query(async () => {
      try {
        const documents = await getDocumentProcessor().getProcessedDocuments();
        
        return {
          success: true,
          documents: documents.map(doc => doc.source),
          count: documents.length,
          type: 'firestore-database'
        };
      } catch (error) {
        console.error('Error listing documents:', error);
        return {
          success: false,
          documents: [],
          count: 0,
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  processDocuments: t.procedure
    .query(async () => {
      try {
        console.log('🔄 Starting document processing via API...');
        const processedDocuments = await getDocumentProcessor().processAllDocuments();
        
        return {
          success: true,
          message: `Successfully processed ${processedDocuments.length} documents`,
          documents: processedDocuments.map(doc => ({
            id: doc.id,
            title: doc.title,
            source: doc.source,
            chunks: doc.chunks.length,
            metadata: doc.metadata,
          })),
          totalChunks: processedDocuments.reduce((sum, doc) => sum + doc.chunks.length, 0),
        };
      } catch (error) {
        console.error('Error processing documents:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          documents: [],
          totalChunks: 0,
        };
      }
    }),

  // GCS Document Processing endpoints for Vertex AI Vector Search
  processGCSDocuments: t.procedure
    .query(async () => {
      try {
        console.log('🔄 Starting GCS document processing...');
        const gcsProcessor = new GCSDocumentProcessor();
        await gcsProcessor.processAllDocumentsFromGCS();
        
        return {
          success: true,
          message: 'Successfully processed all documents from GCS and added to Vertex AI Vector Search',
        };
      } catch (error) {
        console.error('Error processing GCS documents:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  processSpecificGCSDocument: t.procedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      try {
        console.log(`🔄 Processing specific document: ${input.filename}`);
        const gcsProcessor = new GCSDocumentProcessor();
        await gcsProcessor.processSpecificDocument(input.filename);
        
        return {
          success: true,
          message: `Successfully processed ${input.filename} and added to Vertex AI Vector Search`,
        };
      } catch (error) {
        console.error('Error processing specific GCS document:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  listGCSDocuments: t.procedure
    .query(async () => {
      try {
        const gcsProcessor = new GCSDocumentProcessor();
        const documents = await gcsProcessor.listDocumentsInGCS();
        
        return {
          success: true,
          documents,
          count: documents.length,
        };
      } catch (error) {
        console.error('Error listing GCS documents:', error);
        return {
          success: false,
          documents: [],
          count: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // RAG endpoints using Vertex AI Vector Search
  askRAG: t.procedure
    .input(z.object({ question: z.string(), topK: z.number().optional().default(5) }))
    .mutation(async ({ input }) => {
      try {
        console.log(`🤖 RAG Question: ${input.question}`);
        const ragService = new RAGService();
        const response = await ragService.askQuestion(input.question, input.topK);
        
        return {
          success: true,
          ...response,
        };
      } catch (error) {
        console.error('Error processing RAG question:', error);
        return {
          success: false,
          answer: 'I apologize, but I encountered an error processing your question.',
          sources: [],
          metadata: {
            totalChunks: 0,
            searchTime: 0,
            model: 'error',
          },
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});

export type AppRouter = typeof appRouter;
