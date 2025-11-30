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
    // Check for existing session
    const session = AuthService.getSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) return null; // Or a loading spinner

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
      </Routes>
    </Router>
  );
};

export default App;
