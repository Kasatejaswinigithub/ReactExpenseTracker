
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Tracker from './components/Tracker';
import { User } from './types';
import { AuthService } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading your finances...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            currentUser ? <Navigate to="/tracker" replace /> : <Login setUser={setCurrentUser} />
          } 
        />
        <Route 
          path="/tracker" 
          element={
            currentUser ? 
              <Tracker currentUser={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
