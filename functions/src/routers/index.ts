import { initTRPC } from '@trpc/server';
import { chatRouter } from './chat';
import { userRouter } from './user';

const t = initTRPC.create();

export const appRouter = t.router({
  chat: chatRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter; 