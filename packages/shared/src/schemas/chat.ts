import { z } from 'zod';

export const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  sessionId: z.string().optional(),
});

export const GetHistorySchema = z.object({
  sessionId: z.string(),
});

export const RateAnswerSchema = z.object({
  messageId: z.string(),
  rating: z.enum(['up', 'down']),
});

export type AskQuestionInput = z.infer<typeof AskQuestionSchema>;
export type GetHistoryInput = z.infer<typeof GetHistorySchema>;
export type RateAnswerInput = z.infer<typeof RateAnswerSchema>; 