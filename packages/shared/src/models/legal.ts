import { z } from 'zod';

export const LegalSourceSchema = z.object({
  title: z.string(),
  section: z.string(),
  content: z.string(),
  url: z.string().optional(),
  actName: z.string(),
  year: z.number(),
});

export const LegalQuerySchema = z.object({
  question: z.string().min(1),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const LegalResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(LegalSourceSchema),
  sessionId: z.string(),
  messageId: z.string(),
});

export type LegalSource = z.infer<typeof LegalSourceSchema>;
export type LegalQuery = z.infer<typeof LegalQuerySchema>;
export type LegalResponse = z.infer<typeof LegalResponseSchema>;

export interface LegalRAGService {
  askQuestion(query: LegalQuery): Promise<LegalResponse>;
  searchSources(query: string): Promise<LegalSource[]>;
} 