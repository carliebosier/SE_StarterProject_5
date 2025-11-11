import React from 'react';
import './ChallengeList.css';

function ChallengeList({ challenges, onSelectChallenge, onClose, Convert }) {
  if (!challenges || challenges.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Load Challenge</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>No challenges available. Save a game first!</p>
          </div>
        </div>
      </div>
    );
  }

  // Use the score field (words found by user) as high score
  // For games saved after adding the score field, use the actual score
  // Note: Old games will have score=0 (default), but we can't distinguish between
  // "user found 0 words" and "old game". We'll use the score as-is.
  const challengesWithScores = challenges.map(challenge => {
    // Use score if it exists, otherwise default to 0
    // The score field should always exist now (defaults to 0 for old games)
    const score = challenge.score !== undefined && challenge.score !== null ? challenge.score : 0;
    return {
      ...challenge,
      highScore: score
    };
  });

  // Sort by high score descending
  challengesWithScores.sort((a, b) => b.highScore - a.highScore);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Load Challenge</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="challenges-list">
            {challengesWithScores.map((challenge) => (
              <div
                key={challenge.id}
                className="challenge-item"
                onClick={() => onSelectChallenge(challenge.id)}
              >
                <div className="challenge-info">
                  <div className="challenge-name">{challenge.name}</div>
                  <div className="challenge-details">
                    <span className="challenge-size">Size: {challenge.size}x{challenge.size}</span>
                    <span className="challenge-score">
                      High Score: {challenge.highScore} words
                    </span>
                  </div>
                </div>
                <div className="challenge-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeList;

