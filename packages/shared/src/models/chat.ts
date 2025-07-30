import { z } from 'zod';

export const ChatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  query: z.string(),
  response: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    section: z.string(),
    url: z.string().optional(),
  })),
  rating: z.enum(['up', 'down']).optional(),
  createdAt: z.date(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export interface ChatRepository {
  createSession(session: Omit<ChatSession, 'id'>): Promise<ChatSession>;
  createMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getSessionHistory(sessionId: string): Promise<ChatMessage[]>;
  getUserSessions(userId: string): Promise<ChatSession[]>;
  updateMessageRating(messageId: string, rating: 'up' | 'down'): Promise<void>;
} 