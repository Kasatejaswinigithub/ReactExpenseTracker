
import { Transaction } from '../types';

const STORAGE_KEY = 'smart_tracker_data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ExpenseService = {
  async getAll(userId: string): Promise<Transaction[]> {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    return allTransactions.filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async add(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    await delay(400);
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...allTransactions, newTransaction]));
    
    return newTransaction;
  },

  async delete(id: string): Promise<void> {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEY);
    const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
    const updated = allTransactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
