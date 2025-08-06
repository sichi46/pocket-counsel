import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Import the client and the 'protos' type definitions for Vector Search
import { IndexServiceClient, PredictionServiceClient } from '@google-cloud/aiplatform';

// Define a type for the nearest neighbor object to prevent 'implicit any' errors
type INearestNeighbor = {
  datapoint?: {
    datapointId?: string;
  };
  distance?: number;
};

// --- Configuration ---
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';

// Vector Search Configuration (will be updated once index is created)
const VECTOR_SEARCH_INDEX_NAME = 'pocket-counsel-index';
const VECTOR_SEARCH_ENDPOINT_ID = 'pocket-counsel-endpoint'; // Will be created
const VECTOR_SEARCH_DEPLOYED_INDEX_ID = 'pocket-counsel-index'; // Will be deployed

// Stable, widely available models to resolve the 'Not Found' error
const TEXT_EMBEDDING_MODEL = 'textembedding-gecko@001';
const GEMINI_MODEL = 'gemini-1.0-pro';

// --- Client Initialization ---

// Initialize Google AI for generative models
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Initialize the Vector Search clients
const indexServiceClient = new IndexServiceClient();
const predictionServiceClient = new PredictionServiceClient();

const t = initTRPC.create();

export const appRouter = t.router({
  health: t.procedure
    .query(async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        project: GCP_PROJECT_ID,
        location: GCP_LOCATION,
        models: {
          embedding: TEXT_EMBEDDING_MODEL,
          generative: GEMINI_MODEL,
        },
      };
    }),

  askQuestion: t.procedure
    .input(
      z.object({
        question: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { question } = input;

      try {
        // 1. Get embedding for the user's question
        const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${TEXT_EMBEDDING_MODEL}`;
        const embeddingRequest = {
          endpoint,
          instances: [{ content: question }],
        };

        const [embeddingResponse] = await predictionServiceClient.predict(embeddingRequest as any);
        let questionEmbedding: number[] = [];
        if (embeddingResponse.predictions) {
          // @ts-ignore - The embeddings structure is not properly typed
          questionEmbedding = embeddingResponse.predictions[0]?.embeddings?.values ?? [];
        }

        if (questionEmbedding.length === 0) {
          throw new Error('Failed to generate embedding for the question');
        }

      // 2. Find nearest neighbors in Vector Search (mocked for now)
      // TODO: Implement actual vector search when the index is properly set up
      const neighbors: INearestNeighbor[] = [
        { datapoint: { datapointId: 'sample-doc-1' }, distance: 0.1 },
        { datapoint: { datapointId: 'sample-doc-2' }, distance: 0.2 },
      ];
      const context = neighbors.map((n: INearestNeighbor) => n.datapoint?.datapointId).join('\n');

      // 3. Call Gemini with the question and context
      const generativeModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const prompt = `Answer the following question based on the provided context. Only use information from the context. Cite your sources.

Context:
${context}

Question:
${question}`;

      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      // Safely access the response text to prevent runtime errors if the API response is empty
      const answer = response.text() ?? "Sorry, I was unable to find an answer.";

        return {
          answer,
          sources: neighbors.map((n: INearestNeighbor) => ({
              id: n.datapoint?.datapointId,
              distance: n.distance,
          })),
        };
      } catch (error) {
        console.error('Error in askQuestion:', error);
        return {
          answer: `Sorry, I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sources: [],
        };
      }
    }),
});

export type AppRouter = typeof appRouter;
