import React, { useState, useEffect } from 'react';
import { notes } from '../api/client';

const Dashboard = () => {
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await notes.getAll();
      setNotesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="main-content"><p>Loading notes...</p></div>;

  return (
    <div className="main-content animate-fade-in">
      <h2>Your Notes</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Welcome to NoteSense. All your knowledge, beautifully organized.</p>
      
      {notesList.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>No notes yet!</h3>
          <p>Head over to the upload tab to add your first note.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notesList.map(note => (
            <div key={note._id} className="card">
              <h3>{note.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Topic: {note.topicLabel || 'Uncategorized'}
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '1rem', 
                  backgroundColor: note.status === 'ready' ? 'var(--success)' : note.status === 'processing' ? 'var(--accent-primary)' : 'var(--danger)' 
                }}>
                  {note.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
