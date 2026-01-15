
import { Transaction, User } from '../types';

/**
 * MONGODB CORE SERVICE
 * This simulates a full-stack connection to a MongoDB Atlas cluster.
 * In a production Node.js environment, these methods would call 'db.collection().find()'
 */
const DB_NAME = 'smart_expense_pro';
const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  SESSIONS: 'active_sessions'
};

const getCollection = (name: string): any[] => {
  const data = localStorage.getItem(`${DB_NAME}_${name}`);
  return data ? JSON.parse(data) : [];
};

const saveToCollection = (name: string, data: any[]) => {
  localStorage.setItem(`${DB_NAME}_${name}`, JSON.stringify(data));
};

export const ApiService = {
  /**
   * MongoDB: db.collection('users').findOne({ username })
   */
  async login(username: string): Promise<User> {
    // Artificial latency to simulate cloud database round-trip
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getCollection(COLLECTIONS.USERS);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    
    if (!user) {
      throw new Error("MongoDB Error: User document not found in cluster.");
    }

    localStorage.setItem(COLLECTIONS.SESSIONS, JSON.stringify(user));
    return user;
  },

  /**
   * MongoDB: db.collection('users').insertOne({ username })
   */
  async register(username: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const users = getCollection(COLLECTIONS.USERS);
    const cleanUsername = username.trim();

    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error("MongoDB Error: Duplicate Key. Handle already exists.");
    }

    const newUser: User = { 
      id: crypto.randomUUID(), 
      username: cleanUsername 
    };
    
    users.push(newUser);
    saveToCollection(COLLECTIONS.USERS, users);
    localStorage.setItem(COLLECTIONS.SESSIONS, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * MongoDB: db.collection('transactions').find({ userId: uid }).sort({ createdAt: -1 })
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = getCollection(COLLECTIONS.TRANSACTIONS);
    return all
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /**
   * MongoDB: db.collection('transactions').insertOne(doc)
   */
  async addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newDoc: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    const all = getCollection(COLLECTIONS.TRANSACTIONS);
    all.push(newDoc);
    saveToCollection(COLLECTIONS.TRANSACTIONS, all);
    return newDoc;
  },

  /**
   * MongoDB: db.collection('transactions').deleteOne({ _id: id })
   */
  async deleteTransaction(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const all = getCollection(COLLECTIONS.TRANSACTIONS);
    const updated = all.filter(t => t.id !== id);
    saveToCollection(COLLECTIONS.TRANSACTIONS, updated);
  },

  getSession(): User | null {
    const data = localStorage.getItem(COLLECTIONS.SESSIONS);
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem(COLLECTIONS.SESSIONS);
  }
};

