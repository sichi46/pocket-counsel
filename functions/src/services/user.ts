import * as admin from 'firebase-admin';
import { User, UserRepository, CreateUserInput, UpdateUserInput } from '@pocket-counsel/shared';

export class UserService implements UserRepository {
  constructor(private db: admin.firestore.Firestore) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const user: User = {
      uid: input.uid,
      email: input.email,
      createdAt: new Date(),
      subscriptionStatus: 'free',
    };

    await this.db.collection('users').doc(input.uid).set(user);
    return user;
  }

  async findById(uid: string): Promise<User | null> {
    const doc = await this.db.collection('users').doc(uid).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as User;
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  async update(uid: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(uid);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates };
    await this.db.collection('users').doc(uid).update(updates);
    
    return updatedUser;
  }

  async delete(uid: string): Promise<void> {
    await this.db.collection('users').doc(uid).delete();
  }

  async updateUser(uid: string, input: UpdateUserInput): Promise<User> {
    return this.update(uid, input);
  }

  async getUserById(uid: string): Promise<User | null> {
    return this.findById(uid);
  }
} 