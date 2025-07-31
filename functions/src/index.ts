import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import cors from 'cors';
import { askQuestionSchema, getHistorySchema, rateAnswerSchema } from '@pocket-counsel/shared';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize tRPC
const t = initTRPC.create();

// Create router and procedure
const router = t.router;
const publicProcedure = t.procedure;

// Chat router
const chatRouter = router({
  askQuestion: publicProcedure
    .input(askQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      const { question, sessionId } = input;
      
      // TODO: Integrate with Vertex AI RAG service
      const response = {
        answer: `This is a placeholder response to: ${question}`,
        sources: [{
          title: 'Zambian Constitution',
          section: 'Article 1',
          content: 'Sample legal content',
        }],
        sessionId: sessionId || 'new-session-id',
        messageId: 'message-id-' + Date.now(),
      };
      
      return response;
    }),

  getHistory: publicProcedure
    .input(getHistorySchema)
    .query(async ({ input }) => {
      const { sessionId } = input;
      
      // TODO: Fetch from Firestore
      return [];
    }),

  rateAnswer: publicProcedure
    .input(rateAnswerSchema)
    .mutation(async ({ input }) => {
      const { messageId, rating } = input;
      
      // TODO: Update rating in Firestore
      return { success: true };
    }),
});

// Root router
const appRouter = router({
  chat: chatRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Create HTTP function
export const api = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  cors({ origin: true })(req, res, async () => {
    try {
      // Handle tRPC requests
      const { path, method, body } = req;
      
      if (path.startsWith('/trpc/')) {
        // Extract procedure path
        const procedurePath = path.replace('/trpc/', '');
        
        // Simple tRPC handler (in production, use proper tRPC HTTP handler)
        if (method === 'POST') {
          const result = await appRouter.createCaller({}).chat.askQuestion(body);
          res.json({ result });
        } else {
          res.status(405).json({ error: 'Method not allowed' });
        }
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (error) {
      console.error('Function error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}); 