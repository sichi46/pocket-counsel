// apps/web/src/e2e.test.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../functions/src/trpc';
import { expect, test } from 'vitest';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:5001/your-gcp-project-id/us-central1/api', // Replace with your function's URL
    }),
  ],
});

test('askQuestion should return an answer and sources', async () => {
  const result = await trpc.askQuestion.query({
    question: 'What is the capital of Zambia?',
  });

  expect(result).toHaveProperty('answer');
  expect(result).toHaveProperty('sources');
  expect(Array.isArray(result.sources)).toBe(true);
});
