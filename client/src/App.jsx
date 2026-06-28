import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DoubtChat from './pages/DoubtChat';
import FlashcardReview from './pages/FlashcardReview';
import { auth, getAuthToken } from './api/client';
import './index.css';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await auth.login(email, password);
      } else {
        res = await auth.signup(name, email, password);
      }
      onLogin(res.token);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NoteSense
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn-secondary" style={{ border: 'none', padding: 0 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  const handleLogin = (token) => {
    localStorage.setItem('notesense_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('notesense_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Upload /></ProtectedRoute>} />
          <Route path="/ask" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DoubtChat /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FlashcardReview /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
