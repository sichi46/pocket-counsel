import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  subscriptionStatus: z.enum(['free', 'premium']).default('free'),
});

export type User = z.infer<typeof UserSchema>;

export interface UserRepository {
  create(user: User): Promise<User>;
  findById(uid: string): Promise<User | null>;
  update(uid: string, updates: Partial<User>): Promise<User>;
  delete(uid: string): Promise<void>;
} 