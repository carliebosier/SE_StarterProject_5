import React, { useState, useEffect } from 'react';
import { getChallenges, getAllChallengeHighScores } from '../firebase/firestoreService';
import './ChallengeLoader.css';

function ChallengeLoader({ onLoadChallenge, onClose }) {
  const [challenges, setChallenges] = useState([]);
  const [highScores, setHighScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const [challengesData, highScoresData] = await Promise.all([
        getChallenges(),
        getAllChallengeHighScores()
      ]);
      setChallenges(challengesData);
      setHighScores(highScoresData);
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError('Failed to load challenges. Please make sure Firebase is configured correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadChallenge = (challenge) => {
    try {
      // Parse the grid and foundwords from the challenge
      const grid = JSON.parse(challenge.grid);
      const foundwords = JSON.parse(challenge.foundwords);
      
      onLoadChallenge({
        id: challenge.id,
        name: challenge.name,
        grid,
        foundwords,
        size: challenge.size,
        description: challenge.description
      });
      onClose();
    } catch (err) {
      console.error('Error parsing challenge:', err);
      alert('Error loading challenge. Invalid data format.');
    }
  };

  if (loading) {
    return (
      <div className="challenge-loader-overlay">
        <div className="challenge-loader-modal">
          <h2>Load Challenge</h2>
          <div className="loading-message">Loading challenges...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="challenge-loader-overlay">
        <div className="challenge-loader-modal">
          <h2>Load Challenge</h2>
          <div className="error-message">{error}</div>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-loader-overlay" onClick={onClose}>
      <div className="challenge-loader-modal" onClick={(e) => e.stopPropagation()}>
        <div className="challenge-loader-header">
          <h2>Load Challenge</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="challenge-list">
          {challenges.length === 0 ? (
            <div className="no-challenges">
              <p>No challenges available.</p>
              <p className="hint">Challenges need to be populated in Firestore first.</p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="challenge-item"
                onClick={() => handleLoadChallenge(challenge)}
              >
                <div className="challenge-info">
                  <h3>{challenge.name}</h3>
                  {challenge.description && (
                    <p className="challenge-description">{challenge.description}</p>
                  )}
                  <div className="challenge-meta">
                    <span className="challenge-size">Size: {challenge.size}x{challenge.size}</span>
                  </div>
                </div>
                <div className="challenge-score">
                  <div className="high-score-label">High Score</div>
                  <div className="high-score-value">
                    {highScores[challenge.id] || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChallengeLoader;

