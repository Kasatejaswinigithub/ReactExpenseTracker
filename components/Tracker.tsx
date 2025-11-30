import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, User } from '../types';
import { ExpenseService } from '../services/expenseService';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface TrackerProps {
  currentUser: User;
  onLogout: () => void;
}

const Tracker: React.FC<TrackerProps> = ({ currentUser, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Form State
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');

  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser]);

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

  const handleAdd = async () => {
    if (!date || !amount || !type) return;
    
    try {
      const newTx = await ExpenseService.add({
        date,
        amount: parseFloat(amount),
        type: type as TransactionType,
        userId: currentUser.id
      });
      setTransactions(prev => [...prev, newTx]);
      // Reset form
      setAmount('');
      setType(''); 
      // Keep date convenience or clear? Let's clear for fresh entry
      setDate(''); 
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ExpenseService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
    navigate('/');
  };

  // Calculations
  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="bg-black md:bg-primary text-white p-6 pl-8 flex justify-between items-center">
        <div className="text-xl font-bold flex items-center gap-2">
          <p className="m-0 leading-tight">
            Expense<br />Tracker
          </p>
          <i className="fa-solid fa-sack-dollar text-2xl ml-2"></i>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline font-bold">Hi, {currentUser.username}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-md transition-colors flex items-center gap-2 text-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="
        flex flex-col md:flex-row justify-around items-center 
        w-[90%] md:w-[80%] mx-auto mt-6 p-4 md:py-6 
        rounded-lg shadow-[0px_0px_10px_rgba(0,0,0,0.5)] md:shadow-[0px_0px_10px_#476EF7]
        gap-4 md:gap-0 bg-white
      ">
        <div className="relative w-[80%] md:w-[30%]">
          <input 
            type="date" 
            id="dateInput"
            className="peer block w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent pt-6"
            placeholder="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <label 
            htmlFor="dateInput"
            className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
          >
            Date
          </label>
        </div>

        <div className="relative w-[80%] md:w-[30%]">
          <input 
            type="number" 
            id="amountInput"
            className="peer block w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary placeholder-transparent pt-6"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <label 
            htmlFor="amountInput"
            className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
          >
            Amount
          </label>
        </div>

        <div className="relative w-[75%] md:w-[30%]">
          <select 
            className="block w-full px-3 py-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            value={type}
            onChange={e => setType(e.target.value as TransactionType)}
          >
            <option value="" disabled>Select Type</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <button 
          onClick={handleAdd}
          className="
            w-[75%] md:w-[50px] h-[45px] md:h-[50px] 
            bg-black md:bg-primary text-white 
            rounded-lg md:rounded-full 
            text-2xl font-bold flex justify-center items-center 
            hover:opacity-90 transition-all shadow-md
          "
        >
          +
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap md:flex-nowrap w-[90%] md:w-[80%] mx-auto justify-between gap-5 mt-8">
        {/* Income Card */}
        <div className="bg-black md:bg-primary text-white rounded-lg p-5 w-[45%] md:w-[30%] h-[150px] flex flex-col justify-center shadow-md">
          <h5 className="text-sm md:text-lg mb-2 flex items-center gap-2">
            Total Income <i className="fa-solid fa-money-bill-1-wave"></i>
          </h5>
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-1">
            <i className="fa-solid fa-indian-rupee-sign text-xl md:text-3xl"></i>
            <span>{totalIncome}</span>
          </h1>
        </div>

        {/* Expense Card */}
        <div className="bg-black md:bg-primary text-white rounded-lg p-5 w-[45%] md:w-[30%] h-[150px] flex flex-col justify-center shadow-md">
          <h5 className="text-sm md:text-lg mb-2 flex items-center gap-2">
            Total Expenses <i className="fa-solid fa-money-bill-1-wave"></i>
          </h5>
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-1">
            <i className="fa-solid fa-indian-rupee-sign text-xl md:text-3xl"></i>
            <span>{totalExpense}</span>
          </h1>
        </div>

        {/* Balance Card */}
        <div className="bg-black md:bg-primary text-white rounded-lg p-5 w-full md:w-[30%] h-[150px] flex flex-col justify-center shadow-md">
          <h5 className="text-sm md:text-lg mb-2 flex items-center gap-2">
            Total Balance <i className="fa-solid fa-money-bill-1-wave"></i>
          </h5>
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-1">
            <i className="fa-solid fa-indian-rupee-sign text-xl md:text-3xl"></i>
            <span>{totalBalance}</span>
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="w-[90%] md:w-[80%] mx-auto mt-8 border border-black rounded-lg shadow-[0px_0px_4px_rgba(0,0,0,0.5)] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black md:bg-primary text-white text-left">
              <th className="p-4 pl-8 md:pl-12 font-normal">Amount</th>
              <th className="p-4 font-normal hidden md:table-cell">Transaction Type</th>
              <th className="p-4 font-normal md:hidden">Type</th> 
              <th className="p-4 font-normal">Transaction Date</th>
              <th className="p-4 font-normal text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">Loading transactions...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">No transactions found for this user.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-8 md:pl-12 font-bold">{t.amount}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded text-xs text-white ${t.type === 'Income' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="p-4 md:hidden">
                     <span className={`w-3 h-3 inline-block rounded-full ${t.type === 'Income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </td>
                  <td className="p-4 text-gray-600">{t.date}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors border border-black shadow-sm"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tracker;
