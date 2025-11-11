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

  // Calculate high score (total words available) for each challenge
  const challengesWithScores = challenges.map(challenge => {
    const words = Convert(challenge.foundwords);
    return {
      ...challenge,
      highScore: words.length
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
                    <span className="challenge-score">High Score: {challenge.highScore} words</span>
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

