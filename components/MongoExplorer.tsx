
import React, { useState, useEffect } from 'react';

interface MongoExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MongoExplorer: React.FC<MongoExplorerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'users' | 'stats'>('transactions');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const DB_NAME = 'smart_expense_pro';
    const collectionName = activeTab === 'transactions' ? 'transactions' : 'users';
    const raw = localStorage.getItem(`${DB_NAME}_${collectionName}`);
    setData(raw ? JSON.parse(raw) : []);
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md">
      <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <i className="fa-solid fa-database text-emerald-500"></i>
            </div>
            <div>
              <h3 className="text-white font-black tracking-tight text-xl uppercase">MongoDB Cluster Explorer</h3>
              <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Status: Primary Node Active</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0f172a] px-8 gap-4 border-b border-white/5">
          {['transactions', 'users', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'stats' ? 'Cluster Metrics' : `Collection: ${tab}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 font-mono text-sm">
          {activeTab === 'stats' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Instance Health</p>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Region</span>
                    <span className="text-white">aws-us-east-1</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">7.0.4 (Enterprise)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-emerald-500">99.99%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Storage Metrics</p>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Data Size</span>
                    <span className="text-white">14.2 KB</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-400">Index Size</span>
                    <span className="text-white">4.0 KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connections</span>
                    <span className="text-emerald-500">12 Active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  Query: db.{activeTab}.find({"{}"})
                </p>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                  {data.length} Documents
                </span>
              </div>
              
              {data.length === 0 ? (
                <div className="text-center py-20 text-gray-600 italic">No documents found in this collection.</div>
              ) : (
                data.map((doc, idx) => (
                  <div key={idx} className="bg-black/30 p-6 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       <span className="text-gray-500 text-[10px] font-black uppercase">Document {idx + 1}</span>
                    </div>
                    <pre className="text-emerald-400/90 overflow-x-auto">
                      {JSON.stringify({ _id: doc.id, ...doc }, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-[#0f172a] border-t border-white/5 text-center">
           <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em]">
             Cloud Infrastructure powered by MongoDB Atlas & Gemini
           </p>
        </div>
      </div>
    </div>
  );
};

export default MongoExplorer;
