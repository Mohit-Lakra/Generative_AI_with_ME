import React, { useState, useEffect, useRef } from 'react';
import { doubts, notes } from '../api/client';
import { Send, Filter } from 'lucide-react';

const DoubtChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
    loadTopics();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTopics = async () => {
    try {
      const allNotes = await notes.getAll();
      const uniqueTopics = [...new Set(allNotes.map(n => n.topicLabel).filter(Boolean))];
      setTopics(uniqueTopics);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await doubts.getHistory();
      const formatted = history.reverse().flatMap(d => [
        { type: 'user', text: d.question },
        { type: 'ai', text: d.answer, citations: d.citations, grounded: true }
      ]);
      setMessages([{ type: 'ai', text: "Hello! Ask me any question, and I'll answer it based on your uploaded notes." }, ...formatted]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await doubts.ask(question, selectedTopic);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: res.answer, 
        citations: res.citations,
        grounded: res.grounded
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'ai', text: 'Sorry, I encountered an error. ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Doubt Solver</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Ask questions. Get answers grounded strictly in your own notes.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <select 
            value={selectedTopic} 
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="" style={{ color: '#000' }}>All Topics</option>
            {topics.map(t => (
              <option key={t} value={t} style={{ color: '#000' }}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <p>{msg.text}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Citations:</p>
                  {msg.citations.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--accent-primary)' }}>
                      [{i+1}] {c.snippet}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <p>Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            className="input-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoubtChat;
