
import React from 'react';
import { Transaction } from '../types';

interface TableProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TableProps> = ({ transactions, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Syncing with secure vault...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <i className="fa-solid fa-ghost text-gray-300 text-3xl"></i>
        </div>
        <h4 className="text-gray-900 font-bold text-xl">Clean Slate</h4>
        <p className="text-gray-500 max-w-xs">Your financial story starts when you log your first income or expense.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
            <th className="px-8 py-4">Category</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Amount</th>
            <th className="px-8 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        <i className={`fa-solid ${t.type === 'Income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{t.category}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t.type}</span>
                    </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-sm text-gray-500 font-medium">{new Date(t.date).toLocaleDateString()}</span>
              </td>
              <td className="px-6 py-5 text-right">
                <span className={`font-bold text-lg ${t.type === 'Income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="px-8 py-5 text-center">
                <button 
                  onClick={() => onDelete(t.id)}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
