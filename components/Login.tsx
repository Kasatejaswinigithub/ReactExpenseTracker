
import React, { useState } from 'react';
import { ApiService } from '../services/api.ts';
import { User } from '../types.ts';

interface LoginProps {
  setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Identity handle is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let user: User;
      if (mode === 'register') {
        user = await ApiService.register(username);
      } else {
        user = await ApiService.login(username);
      }
      setUser(user);
    } catch (err: any) {
      setError(err.message || "Cluster authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-secondary overflow-hidden relative font-sans text-white">
      {/* Dynamic Glow FX */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[150px]"></div>

      <div className="m-auto w-full max-w-lg p-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-3xl mb-6 border border-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <i className="fa-solid fa-vault text-4xl text-primary"></i>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              EXPRO <span className="text-primary">{mode === 'register' ? 'JOIN' : 'ACCESS'}</span>
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              {mode === 'register' ? 'Initialize Private Wealth Node' : 'Encrypted Session Login'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest animate-bounce">
                <i className="fa-solid fa-shield-halved mr-2"></i> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Identity Handle</label>
                <div className="relative group">
                  <input
                    type="text"
                    className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:bg-white/10 outline-none transition-all text-white text-lg placeholder:text-gray-700"
                    placeholder="User Alias"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <i className="fa-solid fa-fingerprint absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors text-xl"></i>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Secure Keyphrase</label>
                <div className="relative group">
                  <input
                    type="password"
                    className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:bg-white/10 outline-none transition-all text-white text-lg placeholder:text-gray-700"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i className="fa-solid fa-key absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors text-xl"></i>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !username}
              className="w-full bg-primary text-secondary font-black py-5 rounded-2xl text-sm shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                  <i className="fa-solid fa-arrow-right-long text-xs"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setUsername('');
              }}
              className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
            >
              {mode === 'login' ? "New to the cluster? Join Now" : "Returning? Access Vault"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center opacity-20 flex justify-center gap-8 text-2xl grayscale hover:grayscale-0 transition-all duration-500">
           <i className="fa-brands fa-cc-visa"></i>
           <i className="fa-brands fa-cc-mastercard"></i>
           <i className="fa-brands fa-cc-apple-pay"></i>
           <i className="fa-brands fa-cc-stripe"></i>
        </div>
      </div>
    </div>
  );
};

export default Login;
