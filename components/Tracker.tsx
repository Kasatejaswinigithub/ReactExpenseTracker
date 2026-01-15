
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, User, CATEGORIES } from '../types.ts';
import { ApiService } from '../services/api.ts';
import { GeminiService } from '../services/gemini.ts';
import TransactionTable from './TransactionTable.tsx';
import AnimateModal from './AnimateModal.tsx';
import MongoExplorer from './MongoExplorer.tsx';

interface TrackerProps {
  currentUser: User;
  onLogout: () => void;
}

const Tracker: React.FC<TrackerProps> = ({ currentUser, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnimate, setShowAnimate] = useState(false);
  const [showMongo, setShowMongo] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('Expense');
  const [category, setCategory] = useState(CATEGORIES[1]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setDbStatus('syncing');
    try {
      const data = await ApiService.getTransactions(currentUser.id);
      setTransactions(data);
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
      setError("MongoDB Read Error: Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    setSyncing(true);
    setDbStatus('syncing');
    try {
      const newTx = await ApiService.addTransaction({
        date,
        amount: parseFloat(amount),
        type,
        category,
        userId: currentUser.id
      });
      setTransactions(prev => [newTx, ...prev]);
      setAmount('');
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
      setError("MongoDB Write Error: Insert failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSyncing(true);
    setDbStatus('syncing');
    try {
      await ApiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
      setError("MongoDB Delete Error: Record lock.");
    } finally {
      setSyncing(false);
    }
  };

  const runAIAdvisor = async () => {
    setAnalyzing(true);
    const analysis = await GeminiService.getFinancialAdvisor(transactions, currentUser.username);
    setAiAnalysis(analysis);
    setAnalyzing(false);
  };

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-secondary font-sans">
      <div className={`h-1 transition-all duration-500 ${dbStatus === 'syncing' ? 'bg-primary animate-pulse w-full' : 'bg-transparent w-0'}`}></div>
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-secondary rounded-2xl flex items-center justify-center shadow-lg rotate-3">
              <i className="fa-solid fa-leaf text-primary text-xl"></i>
            </div>
            <div>
              <h2 className="font-black text-2xl tracking-tighter text-slate-900 leading-none">MONGOPAY</h2>
              <div className="flex items-center gap-1.5 mt-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowMongo(true)}>
                <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {dbStatus === 'connected' ? 'Cluster Active' : dbStatus === 'syncing' ? 'MongoDB Sync' : 'DB Offline'}
                </span>
                <i className="fa-solid fa-magnifying-glass-chart text-[8px] text-slate-300 ml-1"></i>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setShowMongo(true)}
                className="p-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
                title="Explore MongoDB Collections"
            >
                <i className="fa-solid fa-database text-lg"></i>
            </button>
            <button 
                onClick={() => setShowAnimate(true)}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
            >
                <i className="fa-solid fa-video"></i>
                Create Reel
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col items-end">
                <span className="text-sm font-black text-slate-900">{currentUser.username}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">Stack: Full-MERN</span>
            </div>
            <button onClick={onLogout} className="p-3 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100">
                <i className="fa-solid fa-power-off text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className="bg-rose-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {error}
                </span>
                <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100"><i className="fa-solid fa-xmark"></i></button>
            </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100">
                <h3 className="text-xl font-black mb-8 text-slate-900 uppercase tracking-tight">
                    New Transaction
                </h3>
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <button 
                            type="button"
                            onClick={() => setType('Expense')}
                            className={`py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${type === 'Expense' ? 'bg-secondary text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Debit
                        </button>
                        <button 
                            type="button"
                            onClick={() => setType('Income')}
                            className={`py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${type === 'Income' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Credit
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Post Date</label>
                            <input type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-slate-700 transition-all" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Volume (USD)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">$</span>
                                <input type="number" step="0.01" className="w-full p-5 pl-10 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white outline-none font-black text-3xl text-slate-900 transition-all placeholder:text-slate-200" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                            </div>
                        </div>
                        <div className="group">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">MongoDB Collection</label>
                            <div className="relative">
                                <select className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary focus:bg-white outline-none font-bold text-slate-700 appearance-none transition-all" value={category} onChange={e => setCategory(e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={syncing} className="group w-full py-6 bg-secondary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(17,24,39,0.2)] hover:bg-black active:scale-95 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-3">
                        {syncing ? <i className="fa-solid fa-spinner fa-spin"></i> : (
                            <>
                                <span>Commit Entry</span>
                                <i className="fa-solid fa-database text-[10px] group-hover:translate-x-1 transition-transform"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                        <i className="fa-solid fa-bolt-lightning text-primary"></i>
                        AI Insights
                    </h3>
                    <button onClick={runAIAdvisor} disabled={analyzing} className="bg-white/5 hover:bg-white/10 w-10 h-10 rounded-xl transition-colors flex items-center justify-center border border-white/10">
                        <i className={`fa-solid fa-wand-magic-sparkles text-xs ${analyzing ? 'animate-pulse text-primary' : ''}`}></i>
                    </button>
                </div>
                <div className="min-h-[140px] flex flex-col justify-center">
                    {analyzing ? (
                        <div className="space-y-4">
                            <div className="h-2 bg-white/10 rounded-full w-full animate-pulse"></div>
                            <div className="h-2 bg-white/10 rounded-full w-[90%] animate-pulse delay-75"></div>
                            <div className="h-2 bg-white/10 rounded-full w-[70%] animate-pulse delay-150"></div>
                            <div className="h-2 bg-white/10 rounded-full w-[80%] animate-pulse delay-200"></div>
                        </div>
                    ) : aiAnalysis ? (
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                          <i className="fa-solid fa-quote-left text-primary mr-2 opacity-50"></i>
                          {aiAnalysis}
                        </p>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-6 text-slate-500">Scan Documents for Trends</p>
                            <button onClick={runAIAdvisor} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-secondary transition-all">Compute Forecast</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Equity</p>
                        <i className="fa-solid fa-scale-balanced text-slate-200"></i>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                    <div className="mt-6 flex items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md">LIVE</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Verified by AI</span>
                    </div>
                </div>
                <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 text-white group cursor-default">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Inflow</p>
                        <i className="fa-solid fa-arrow-trend-up text-white/40 group-hover:translate-y-[-2px] transition-transform"></i>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">+${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                    <p className="text-[9px] font-black text-white/50 mt-6 uppercase tracking-widest">MongoDB Document Sum</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-full translate-x-12 -translate-y-12"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outflow</p>
                            <i className="fa-solid fa-arrow-trend-down text-rose-200 group-hover:translate-y-[2px] transition-transform"></i>
                        </div>
                        <h2 className="text-4xl font-black text-rose-500 tracking-tighter">-${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="text-[9px] font-black text-slate-300 mt-6 uppercase tracking-widest">Aggregated Debits</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Ledger</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction History from Database</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                            {transactions.length} Objects
                        </span>
                    </div>
                </div>
                <div className="min-h-[400px]">
                    <TransactionTable transactions={transactions} loading={loading} onDelete={handleDelete} />
                </div>
            </div>
        </div>
      </main>

      <AnimateModal isOpen={showAnimate} onClose={() => setShowAnimate(false)} />
      <MongoExplorer isOpen={showMongo} onClose={() => setShowMongo(false)} />
    </div>
  );
};

export default Tracker;

