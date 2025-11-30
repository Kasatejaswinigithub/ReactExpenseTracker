import { Transaction } from '../types';

/**
 * NOTE: Since this is a client-side only React environment, we cannot connect directly to a 
 * MongoDB database (which requires a backend server like Node.js/Express).
 * 
 * This service mimics a MongoDB backend interaction using localStorage.
 * Structure:
 * - Users Collection (managed by AuthService)
 * - Transactions Collection (managed here, linked by userId)
 */

const STORAGE_KEY = 'expense_tracker_data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ExpenseService = {
  async getAll(userId: string): Promise<Transaction[]> {
    await delay(300); // Simulate API latency
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    
    // Mimic MongoDB query: db.transactions.find({ userId: userId })
    return allTransactions.filter(t => t.userId === userId);
  },

  async add(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    await delay(300);
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    
    const updated = [...allTransactions, newTransaction];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return newTransaction;
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    
    // Mimic MongoDB delete: db.transactions.deleteOne({ id: id })
    const updated = allTransactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
