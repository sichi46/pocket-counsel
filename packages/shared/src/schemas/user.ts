import { z } from 'zod';

export const CreateUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
});

export const UpdateUserSchema = z.object({
  subscriptionStatus: z.enum(['free', 'premium']).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>; 