// src/index.ts

import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors'; // <-- 1. Import the cors package
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';

// Import functions v2 and options
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';

// Set runtime options for all functions in this file
setGlobalOptions({ 
  memory: '2GiB', // Further increased for document processing
  region: 'us-central1',
  timeoutSeconds: 540 // Increased timeout for document processing
});

admin.initializeApp();

const app = express();

// --- 2. Enable CORS for all routes ---
// This will allow your frontend to make requests to the API.
app.use(cors());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Your functions will automatically use the 2GiB memory setting
export const api = onRequest({ 
  memory: '2GiB', // Further increased for document processing
  timeoutSeconds: 540,
  secrets: ['GOOGLE_API_KEY']
}, app);

export const health = onRequest({ memory: '256MiB' }, (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Pocket Counsel API is running',
        timestamp: new Date().toISOString(),
        database: process.env.FIRESTORE_DATABASE_ID || '(default)',
        environment: process.env.NODE_ENV || 'development',
    });
});
