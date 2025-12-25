
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, User, CATEGORIES } from '../types';
import { ExpenseService } from '../services/expenseService';
import { AIService } from '../services/aiService';
import TransactionTable from './TransactionTable';
import AIInsights from './AIInsights';

interface TrackerProps {
  currentUser: User;
  onLogout: () => void;
}

const Tracker: React.FC<TrackerProps> = ({ currentUser, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('Expense');
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to Food

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await ExpenseService.getAll(currentUser.id);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      const newTx = await ExpenseService.add({
        date,
        amount: parseFloat(amount),
        type,
        category,
        userId: currentUser.id
      });
      setTransactions(prev => [newTx, ...prev]);
      setAmount('');
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ExpenseService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const runAIAdvisor = async () => {
    setAnalyzing(true);
    const analysis = await AIService.getFinancialAdvisor(transactions, currentUser.username);
    setAiAnalysis(analysis);
    setAnalyzing(false);
  };

  const stats = useMemo(() => {
    let income = 0, expense = 0, dailyExpense = 0, monthlyExpense = 0;
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.slice(0, 7); // YYYY-MM

    transactions.forEach(t => {
      if (t.type === 'Income') {
        income += t.amount;
      } else {
        expense += t.amount;
        if (t.date === today) {
          dailyExpense += t.amount;
        }
        if (t.date.startsWith(thisMonth)) {
          monthlyExpense += t.amount;
        }
      }
    });

    return { 
      income, 
      expense, 
      balance: income - expense,
      dailyExpense,
      monthlyExpense
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-secondary">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <i className="fa-solid fa-wallet text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">SmartExpense</h1>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900">{currentUser.username}</span>
              <span className="text-xs text-green-500 font-bold">Premium User</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-10 h-10 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-full flex items-center justify-center transition-all group shadow-sm border border-gray-200"
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Insights */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Add Transaction Card */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-plus-circle text-primary"></i>
              New Entry
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setType('Expense')}
                  className={`py-3 rounded-xl font-bold transition-all ${type === 'Expense' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setType('Income')}
                  className={`py-3 rounded-xl font-bold transition-all ${type === 'Income' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                >
                  Income
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:bg-white outline-none"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:bg-white outline-none font-bold text-lg"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                <select 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:bg-white outline-none"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Save Transaction
              </button>
            </form>
          </div>

          {/* AI Advisor Card */}
          <AIInsights 
            analysis={aiAnalysis} 
            loading={analyzing} 
            onAnalyze={runAIAdvisor}
          />
        </div>

        {/* Right Column: Balance & Table */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <p className="text-gray-400 text-sm font-bold uppercase mb-2">Net Balance</p>
              <h2 className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                <i className="fa-solid fa-chart-line"></i> Lifetime total
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-3xl shadow-lg border border-primary/10">
              <p className="text-primary text-sm font-bold uppercase mb-2">Total Income</p>
              <h2 className="text-3xl font-bold text-primary">
                +${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                <i className="fa-solid fa-arrow-up"></i> All time received
              </div>
            </div>

            <div className="bg-secondary p-6 rounded-3xl shadow-lg border border-secondary text-white">
              <p className="text-gray-400 text-sm font-bold uppercase mb-2">Total Expenses</p>
              <h2 className="text-3xl font-bold text-white">
                -${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                <i className="fa-solid fa-arrow-down"></i> All time spent
              </div>
            </div>
          </div>

          {/* Periodic Expenditure Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-md border-l-4 border-l-orange-400 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Daily Burn Rate</p>
                <h3 className="text-2xl font-bold text-secondary">
                  ${stats.dailyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 italic">Calculated for today</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <i className="fa-solid fa-calendar-day text-xl"></i>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-md border-l-4 border-l-indigo-400 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Monthly Expenditure</p>
                <h3 className="text-2xl font-bold text-secondary">
                  ${stats.monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 italic">For current month</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                <i className="fa-solid fa-calendar-check text-xl"></i>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Activity Log</h3>
              <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                {transactions.length} items
              </span>
            </div>
            
            <TransactionTable 
              transactions={transactions} 
              loading={loading} 
              onDelete={handleDelete} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tracker;
