import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AskQuestionSchema, GetHistorySchema, RateAnswerSchema } from '@pocket-counsel/shared';
import { ChatService } from '../services/chat';
import { LegalRAGService } from '../services/legal-rag';

const t = initTRPC.create();

export const chatRouter = t.router({
  askQuestion: t.procedure
    .input(AskQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      const chatService = new ChatService(ctx.db);
      const legalService = new LegalRAGService();
      
      const response = await legalService.askQuestion(input);
      const message = await chatService.createMessage({
        sessionId: response.sessionId,
        query: input.question,
        response: response.answer,
        sources: response.sources,
      });
      
      return {
        answer: response.answer,
        sources: response.sources,
        sessionId: response.sessionId,
        messageId: message.id,
      };
    }),

  getHistory: t.procedure
    .input(GetHistorySchema)
    .query(async ({ input, ctx }) => {
      const chatService = new ChatService(ctx.db);
      return await chatService.getSessionHistory(input.sessionId);
    }),

  rateAnswer: t.procedure
    .input(RateAnswerSchema)
    .mutation(async ({ input, ctx }) => {
      const chatService = new ChatService(ctx.db);
      await chatService.updateMessageRating(input.messageId, input.rating);
      return { success: true };
    }),
}); 