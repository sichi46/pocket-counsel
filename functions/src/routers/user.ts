import { initTRPC } from '@trpc/server';
import { CreateUserSchema, UpdateUserSchema } from '@pocket-counsel/shared';
import { UserService } from '../services/user';

const t = initTRPC.create();

export const userRouter = t.router({
  create: t.procedure
    .input(CreateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const userService = new UserService(ctx.db);
      return await userService.createUser(input);
    }),

  update: t.procedure
    .input(UpdateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const userService = new UserService(ctx.db);
      return await userService.updateUser(ctx.user.uid, input);
    }),

  getProfile: t.procedure
    .query(async ({ ctx }) => {
      const userService = new UserService(ctx.db);
      return await userService.getUserById(ctx.user.uid);
    }),
}); 