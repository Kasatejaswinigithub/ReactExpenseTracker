export type TransactionType = 'Income' | 'Expense';

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this should be hashed
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  type: TransactionType;
  createdAt: number;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}
