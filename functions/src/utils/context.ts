import { CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { User } from '@pocket-counsel/shared';

export interface Context {
  user: User;
  db: admin.firestore.Firestore;
}

export function createContext() {
  return async (request: CallableRequest): Promise<Context> => {
    const auth = request.auth;
    if (!auth) {
      throw new Error('Unauthorized');
    }

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(auth.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    
    return {
      user: userData,
      db,
    };
  };
} 