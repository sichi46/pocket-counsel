import { AnyRouter } from '@trpc/server';
import { CallableRequest, CallableResponse } from 'firebase-functions/v2/https';

export function trpcCallable<T extends AnyRouter>(
  router: T,
  createContext: () => Promise<any>
) {
  return async (request: CallableRequest): Promise<CallableResponse> => {
    try {
      const { path, input } = request.data;
      const ctx = await createContext();
      
      const caller = router.createCaller(ctx);
      const result = await caller[path as keyof typeof caller](input);
      
      return {
        data: result,
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      };
    }
  };
} 