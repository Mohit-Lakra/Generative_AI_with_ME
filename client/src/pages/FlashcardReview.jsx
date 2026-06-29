import React, { useState, useEffect } from 'react';
import { flashcards } from '../api/client';
import { toast } from 'react-hot-toast';
import { BrainCircuit } from 'lucide-react';

const FlashcardReview = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      const due = await flashcards.getDue();
      setCards(due);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    if (cards.length === 0) return;
    
    const card = cards[currentIndex];
    setIsFlipped(false);
    
    try {
      await flashcards.review(card._id, quality);
      
      // Move to next card
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // All done
          setCards([]);
          setCurrentIndex(0);
          toast.success("All caught up for now!");
        }
      }, 300);
      
    } catch (err) {
      toast.error("Error saving review: " + err.message);
    }
  };

  if (loading) return <div className="main-content"><p>Loading flashcards...</p></div>;

  if (cards.length === 0) {
    return (
      <div className="main-content animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <BrainCircuit size={64} color="var(--success)" style={{ marginBottom: '1.5rem' }} />
        <h2>You're all caught up!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>No flashcards due for review right now. Check back later.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Flashcard Review</h2>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>
      
      <div className="flashcard-container">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => !isFlipped && setIsFlipped(true)}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Question</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>{currentCard.question}</p>
              {!isFlipped && (
                <p style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Click to reveal answer
                </p>
              )}
            </div>
            <div className="flashcard-back">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Answer</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>{currentCard.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="flashcard-actions animate-fade-in">
          <button className="btn" style={{ backgroundColor: '#ef4444' }} onClick={() => handleReview(0)}>0 - Blackout</button>
          <button className="btn" style={{ backgroundColor: '#f97316' }} onClick={() => handleReview(1)}>1 - Wrong</button>
          <button className="btn" style={{ backgroundColor: '#eab308' }} onClick={() => handleReview(2)}>2 - Hard</button>
          <button className="btn" style={{ backgroundColor: '#84cc16' }} onClick={() => handleReview(3)}>3 - Okay</button>
          <button className="btn" style={{ backgroundColor: '#22c55e' }} onClick={() => handleReview(4)}>4 - Good</button>
          <button className="btn" style={{ backgroundColor: '#10b981' }} onClick={() => handleReview(5)}>5 - Perfect</button>
        </div>
      )}
    </div>
  );
};

export default FlashcardReview;
