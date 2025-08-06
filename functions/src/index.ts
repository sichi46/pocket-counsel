import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';

admin.initializeApp();

const getDatabase = () => {
  return admin.firestore();
};

export const health = functions.https.onRequest((_req, res) => {
  // Check if unauthenticated access is allowed
  const allowUnauthenticated = functions.config().auth?.allowunauthenticated;
  
  const db = getDatabase();
  res.json({
    status: 'ok',
    message: 'Pocket Counsel API is running',
    timestamp: new Date().toISOString(),
    database: process.env.FIRESTORE_DATABASE_ID || '(default)',
    environment: process.env.NODE_ENV || 'development',
    allowUnauthenticated: allowUnauthenticated || false,
  });
});

const app = express();
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

export const api = functions.https.onRequest(app);
