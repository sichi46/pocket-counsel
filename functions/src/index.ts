import * as functions from 'firebase-functions';
import { appRouter } from './routers';
import { createContext } from './utils/context';
import { trpcCallable } from './utils/trpc-callable';

// Initialize Firebase Admin
import * as admin from 'firebase-admin';
admin.initializeApp();

// Create tRPC context
const context = createContext();

// Export tRPC callable function
export const trpc = functions.https.onCall(trpcCallable(appRouter, context)); 