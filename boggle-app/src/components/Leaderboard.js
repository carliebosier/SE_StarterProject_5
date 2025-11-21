/**
 * Leaderboard Component
 * Displays top scores for a specific challenge
 */

import React, { useState, useEffect } from 'react';
import { getTopScoresForChallenge, getUserScoreForChallenge } from '../utils/scoreService';
import { useAuth } from '../contexts/AuthContext';
import './Leaderboard.css';

function Leaderboard({ challengeId, challengeName }) {
  const [topScores, setTopScores] = useState([]);
  const [userScore, setUserScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const loadScores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load top scores
        const scores = await getTopScoresForChallenge(challengeId, 10);
        setTopScores(scores);

        // Load user's score if signed in
        if (currentUser) {
          const userScoreData = await getUserScoreForChallenge(currentUser.uid, challengeId);
          setUserScore(userScoreData);
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        // Provide more detailed error message
        let errorMessage = 'Failed to load leaderboard';
        if (err.message) {
          errorMessage = err.message;
        }
        // If it's an index error, make it more user-friendly
        if (err.message?.includes('index')) {
          errorMessage = 'Firestore index required. Check browser console (F12) for the index creation link.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [challengeId, currentUser]);

  if (!challengeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h3 className="leaderboard-title">Leaderboard</h3>
        <p>Loading scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h3 className="leaderboard-title">Leaderboard</h3>
        <div className="error-message">
          <p>{error}</p>
          {error.includes('index') && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              <p><strong>How to fix:</strong></p>
              <ol style={{ textAlign: 'left', display: 'inline-block' }}>
                <li>Open browser console (F12 or right-click → Inspect)</li>
                <li>Look for the index creation link in the error message</li>
                <li>Click the link to create the required Firestore index</li>
                <li>Wait for the index to build (usually takes a few minutes)</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h3 className="leaderboard-title">🏆 Leaderboard</h3>
      {challengeName && (
        <p className="leaderboard-subtitle">{challengeName}</p>
      )}
      
      {topScores.length === 0 ? (
        <p className="no-scores">No scores yet. Be the first!</p>
      ) : (
        <div className="scores-list">
          {topScores.map((score, index) => {
            const isCurrentUser = currentUser && score.userId === currentUser.uid;
            return (
              <div 
                key={score.id} 
                className={`score-item ${isCurrentUser ? 'user-score' : ''}`}
              >
                <div className="score-rank">#{index + 1}</div>
                <div className="score-user-info">
                  {score.userPhotoURL && (
                    <img 
                      src={score.userPhotoURL} 
                      alt={score.userName} 
                      className="score-avatar"
                    />
                  )}
                  <span className="score-user-name">
                    {score.userName}
                    {isCurrentUser && <span className="you-badge"> (You)</span>}
                  </span>
                </div>
                <div className="score-value">{score.score} words</div>
              </div>
            );
          })}
        </div>
      )}

      {userScore && topScores.findIndex(s => s.userId === currentUser?.uid) === -1 && (
        <div className="user-score-section">
          <div className="score-divider"></div>
          <div className="score-item user-score">
            <div className="score-rank">—</div>
            <div className="score-user-info">
              {userScore.userPhotoURL && (
                <img 
                  src={userScore.userPhotoURL} 
                  alt={userScore.userName} 
                  className="score-avatar"
                />
              )}
              <span className="score-user-name">
                {userScore.userName} <span className="you-badge">(You)</span>
              </span>
            </div>
            <div className="score-value">{userScore.score} words</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;

