import React, { useState, useEffect } from 'react';
import { getChallengeLeaderboard } from '../firebase/firestoreService';
import './Leaderboard.css';

function Leaderboard({ challengeId, challengeName, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (challengeId) {
      loadLeaderboard();
    }
  }, [challengeId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChallengeLeaderboard(challengeId, 10);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    return `${seconds.toFixed(1)}s`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-header">
          <h2>Leaderboard</h2>
          {challengeName && <p className="challenge-name">{challengeName}</p>}
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="leaderboard-content">
          {loading ? (
            <div className="loading-message">Loading leaderboard...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="no-scores">
              <p>No scores yet. Be the first to play this challenge!</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Words</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                    <td className="rank">#{index + 1}</td>
                    <td className="player">
                      {entry.userName || entry.userEmail || 'Anonymous'}
                    </td>
                    <td className="score">{entry.score}</td>
                    <td className="words">{entry.wordsFound || 0}</td>
                    <td className="time">{formatTime(entry.totalTime)}</td>
                    <td className="date">{formatDate(entry.timestamp || entry.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;

