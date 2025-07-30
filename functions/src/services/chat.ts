import * as admin from 'firebase-admin';
import { ChatMessage, ChatSession, ChatRepository } from '@pocket-counsel/shared';

export class ChatService implements ChatRepository {
  constructor(private db: admin.firestore.Firestore) {}

  async createSession(session: Omit<ChatSession, 'id'>): Promise<ChatSession> {
    const docRef = await this.db.collection('chatSessions').add({
      ...session,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const docRef = await this.db.collection('chatMessages').add({
      ...message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...message,
      createdAt: new Date(),
    };
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const snapshot = await this.db
      .collection('chatMessages')
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as ChatMessage[];
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const snapshot = await this.db
      .collection('chatSessions')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ChatSession[];
  }

  async updateMessageRating(messageId: string, rating: 'up' | 'down'): Promise<void> {
    await this.db
      .collection('chatMessages')
      .doc(messageId)
      .update({ rating });
  }
} 