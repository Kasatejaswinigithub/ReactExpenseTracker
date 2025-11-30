import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
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
      navigate('/tracker');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden border-[11px] border-black flex items-center bg-white">
      {/* Decorative Circle */}
      <div 
        className="
          absolute rounded-full z-10
          w-[300px] h-[300px] -right-[120px] -top-[165px] bg-black
          md:w-[750px] md:h-[750px] md:-right-[385px] md:-top-[20px] md:bg-primary
          transition-all duration-500 ease-in-out
        "
      ></div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 md:mb-[45%] mt-5 md:mt-0">
        <h4 className="m-0 text-xl font-bold flex items-center gap-2 text-black md:text-black">
          Expense Tracker <i className="fa-solid fa-sack-dollar"></i>
        </h4>
        <button 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="btn bg-white text-black md:text-primary font-bold shadow-[4px_4px_2px_rgba(0,0,0,0.5)] px-4 py-2 rounded transition-transform active:scale-95 border border-gray-200 z-30"
        >
          {isRegistering ? 'Login Instead' : 'Register Now'}
        </button>
      </div>

      {/* Main Content */}
      <div className="z-20 ml-11 md:ml-[45px] max-w-lg w-full px-4 mt-20 md:mt-0">
        <h3 className="text-2xl md:text-3xl font-light mb-4 text-black">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
          <br />
          <span 
            className="text-4xl md:text-6xl font-bold text-black md:text-primary block leading-tight transition-colors duration-300 mt-2"
            style={{ wordBreak: 'break-word' }}
          >
            {username || (isRegistering ? 'Join Us' : 'Login')}
          </span>
        </h3>

        {error && (
          <div className="mb-4 text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="form-floating shadow-[4px_4px_4px_rgba(0,0,0,0.25)] rounded-lg bg-white overflow-hidden border border-gray-200">
            <input
              type="text"
              className="form-control w-full p-4 text-lg outline-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleKeyPress}
            />
          </div>

          <div className="form-floating shadow-[4px_4px_4px_rgba(0,0,0,0.25)] rounded-lg bg-white overflow-hidden border border-gray-200">
            <input
              type="password"
              className="form-control w-full p-4 text-lg outline-none"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handleKeyPress}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black md:bg-primary text-white px-8 py-3 rounded text-lg font-bold shadow-lg hover:opacity-90 transition-all active:scale-95 w-full md:w-auto flex items-center justify-center gap-2"
        >
          {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;
