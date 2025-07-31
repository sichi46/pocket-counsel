import { z } from 'zod';

export const askQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  sessionId: z.string().optional(),
});

export const getHistorySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const rateAnswerSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  rating: z.enum(['up', 'down']),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  query: z.string(),
  response: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    section: z.string(),
    content: z.string(),
    url: z.string().optional(),
    page: z.number().optional(),
  })),
  rating: z.enum(['up', 'down']).optional(),
  createdAt: z.date(),
});

export const legalSourceSchema = z.object({
  title: z.string(),
  section: z.string(),
  content: z.string(),
  url: z.string().optional(),
  page: z.number().optional(),
});

export const ragResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(legalSourceSchema),
  confidence: z.number().min(0).max(1),
});

export const corpusDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.object({
    source: z.string(),
    section: z.string().optional(),
    page: z.number().optional(),
    date: z.string().optional(),
  }),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
export type GetHistoryInput = z.infer<typeof getHistorySchema>;
export type RateAnswerInput = z.infer<typeof rateAnswerSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type LegalSource = z.infer<typeof legalSourceSchema>;
export type RAGResponse = z.infer<typeof ragResponseSchema>;
export type CorpusDocument = z.infer<typeof corpusDocumentSchema>; 