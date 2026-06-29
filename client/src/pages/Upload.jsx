import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { notes } from '../api/client';

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (inputType === 'text') {
        await notes.uploadText(title, text);
      } else {
        if (!file) throw new Error("Please select a file.");
        await notes.uploadFile(title, file);
      }
      toast.success("Note uploaded successfully!");
      navigate('/');
    } catch (err) {
      toast.error(err.message || "Failed to upload note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <h2>Upload New Note</h2>
      <div className="card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={inputType === 'text' ? 'btn' : 'btn-secondary'} 
            onClick={() => setInputType('text')}
            style={{ flex: 1 }}
          >
            Type Text
          </button>
          <button 
            className={inputType === 'file' ? 'btn' : 'btn-secondary'} 
            onClick={() => setInputType('file')}
            style={{ flex: 1 }}
          >
            Upload File
          </button>
        </div>

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
          
          {inputType === 'text' ? (
            <div className="input-group">
              <label className="input-label">Note Content (Text)</label>
              <textarea 
                className="input-field" 
                rows="10" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                required={inputType === 'text'}
                placeholder="Paste your notes here..."
              ></textarea>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">Document or Image (PDF, DOCX, JPG, PNG)</label>
              <input 
                type="file" 
                className="input-field"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files[0])}
                required={inputType === 'file'}
                style={{ padding: '1rem 0' }}
              />
            </div>
          )}
          
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Uploading & Processing...' : 'Save Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
