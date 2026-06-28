import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notes } from '../api/client';

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notes.uploadText(title, text);
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <h2>Upload New Note</h2>
      <div className="card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Note Title</label>
            <input 
              type="text" 
              className="input-field" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              placeholder="e.g. Thermodynamics - Lecture 1"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Note Content (Text)</label>
            <textarea 
              className="input-field" 
              rows="10" 
              value={text} 
              onChange={e => setText(e.target.value)} 
              required
              placeholder="Paste your notes here..."
            ></textarea>
          </div>
          
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Uploading & Processing...' : 'Save Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
