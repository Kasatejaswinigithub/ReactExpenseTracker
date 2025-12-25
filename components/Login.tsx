
import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isRegistering) {
        user = await AuthService.register(username, password);
      } else {
        user = await AuthService.login(username, password);
      }
      
      AuthService.saveSession(user);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden border-[12px] border-secondary flex items-center bg-white">
      {/* Dynamic Background Element */}
      <div 
        className={`
          absolute rounded-full z-10 transition-all duration-700 ease-in-out
          w-[350px] h-[350px] -right-[150px] -top-[150px] bg-secondary
          md:w-[850px] md:h-[850px] md:-right-[350px] md:-top-[100px] md:bg-primary
        `}
      ></div>

      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary md:bg-white text-white md:text-primary rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-sack-dollar text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">SmartExpense</h1>
        </div>
        <button 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="bg-white text-secondary font-bold shadow-[4px_4px_0px_#111827] px-6 py-2 rounded-lg border-2 border-secondary hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#111827] transition-all active:scale-95 z-30"
        >
          {isRegistering ? 'Login' : 'Join'}
        </button>
      </div>

      <div className="z-20 ml-12 md:ml-24 max-w-lg w-full px-4">
        <div className="mb-10">
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-sm">
            {isRegistering ? 'Step into better finance' : 'Welcome back, friend'}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-secondary leading-[1.1]">
            {isRegistering ? 'Create your' : 'Manage your'}<br />
            <span className="text-primary underline decoration-secondary">Wealth Today</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border-l-4 border-red-500 text-sm font-bold flex items-center gap-2 rounded shadow-sm">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-lg"
                placeholder="Your unique handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"></i>
            </div>

            <div className="relative group">
              <input
                type="password"
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-lg"
                placeholder="Secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"></i>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-secondary text-white px-10 py-4 rounded-xl text-lg font-bold shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                {isRegistering ? 'Register Account' : 'Sign In'}
                <i className="fa-solid fa-arrow-right-long"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
