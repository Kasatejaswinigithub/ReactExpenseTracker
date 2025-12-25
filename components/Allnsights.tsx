
import React from 'react';

interface AIInsightsProps {
  analysis: string;
  loading: boolean;
  onAnalyze: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysis, loading, onAnalyze }) => {
  return (
    <div className="bg-gradient-to-br from-secondary to-gray-800 p-8 rounded-3xl shadow-xl shadow-secondary/20 text-white relative overflow-hidden group">
      {/* Decorative pulse element */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-wand-magic-sparkles text-primary animate-pulse"></i>
          AI Wealth Advisor
        </h3>
        <button 
          onClick={onAnalyze}
          disabled={loading}
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Refresh'}
        </button>
      </div>

      <div className="relative z-10 min-h-[120px] flex flex-col justify-center">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded-full w-4/5 animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
          </div>
        ) : analysis ? (
          <p className="text-gray-300 leading-relaxed italic text-sm md:text-base">
            "{analysis}"
          </p>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-4">Click to generate your personalized financial breakdown.</p>
            <button 
              onClick={onAnalyze}
              className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Analyze My Spending
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <i className="fa-solid fa-bolt text-primary text-xs"></i>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Powered by Gemini 3</span>
      </div>
    </div>
  );
};

export default AIInsights;
