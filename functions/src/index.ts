import * as functions from 'firebase-functions';

// Initialize Firebase Admin
import * as admin from 'firebase-admin';
admin.initializeApp();

// Get Firestore instance
const getDatabase = () => {
  return admin.firestore();
};

// Simple health check function for Milestone 1
export const health = functions.https.onRequest((_req, res) => {
  const db = getDatabase();
  res.json({
    status: 'ok',
    message: 'Pocket Counsel API is running',
    timestamp: new Date().toISOString(),
    database: process.env.FIRESTORE_DATABASE_ID || '(default)',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Placeholder for future tRPC implementation
export const api = functions.https.onRequest((_req, res) => {
  const db = getDatabase();
  res.json({
    message: 'tRPC API will be implemented in Milestone 2',
    milestone: 'Foundation Setup Complete',
    database: process.env.FIRESTORE_DATABASE_ID || '(default)',
    environment: process.env.NODE_ENV || 'development',
  });
});
