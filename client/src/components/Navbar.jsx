import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../api/client';
import { BookOpen, LogOut, Upload, MessageSquare, BrainCircuit } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setAuthToken(null);
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <BookOpen size={24} color="#3b82f6" />
        NoteSense
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
        <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>Upload Note</Link>
        <Link to="/ask" className={`nav-link ${isActive('/ask')}`}>Ask Doubts</Link>
        <Link to="/flashcards" className={`nav-link ${isActive('/flashcards')}`}>Flashcards</Link>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
