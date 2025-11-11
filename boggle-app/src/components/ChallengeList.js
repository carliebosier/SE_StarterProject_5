import React from 'react';
import './ChallengeList.css';

function ChallengeList({ challenges, savedGames, onSelectChallenge, onClose, loading }) {
  // Combine Firestore challenges and saved games
  // Firestore challenges are the fixed challenges
  // Saved games are user-saved games from Django backend
  const allChallenges = [];
  
  // Add Firestore challenges (fixed challenges)
  if (challenges && challenges.length > 0) {
    challenges.forEach(challenge => {
      allChallenges.push({
        ...challenge,
        id: challenge.id || challenge.name,
        highScore: challenge.score || 0, // For Firestore challenges, score is the high score
        source: 'firestore',
        type: 'Fixed Challenge'
      });
    });
  }
  
  // Add saved games from Django backend
  if (savedGames && savedGames.length > 0) {
    savedGames.forEach(game => {
      allChallenges.push({
        ...game,
        highScore: game.score || 0,
        source: 'django',
        type: 'Saved Game'
      });
    });
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Load Challenge</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (allChallenges.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Load Challenge</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>No challenges available. Populate Firestore challenges or save a game first!</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort by high score descending, then by name
  allChallenges.sort((a, b) => {
    if (b.highScore !== a.highScore) {
      return b.highScore - a.highScore;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Load Challenge</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Show sections for Firestore challenges and saved games */}
          {challenges && challenges.length > 0 && (
            <div className="challenges-section">
              <h3 className="challenges-section-title">Fixed Challenges</h3>
              <div className="challenges-list">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id || challenge.name}
                    className="challenge-item"
                    onClick={() => onSelectChallenge(null, challenge)}
                  >
                    <div className="challenge-info">
                      <div className="challenge-name">{challenge.name}</div>
                      <div className="challenge-details">
                        <span className="challenge-size">Size: {challenge.size}x{challenge.size}</span>
                        <span className="challenge-score">
                          High Score: {challenge.score || 0} words
                        </span>
                        <span className="challenge-type">Fixed Challenge</span>
                      </div>
                    </div>
                    <div className="challenge-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {savedGames && savedGames.length > 0 && (
            <div className="challenges-section">
              <h3 className="challenges-section-title">Saved Games</h3>
              <div className="challenges-list">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="challenge-item"
                    onClick={() => onSelectChallenge(game.id)}
                  >
                    <div className="challenge-info">
                      <div className="challenge-name">{game.name}</div>
                      <div className="challenge-details">
                        <span className="challenge-size">Size: {game.size}x{game.size}</span>
                        <span className="challenge-score">
                          High Score: {game.score || 0} words
                        </span>
                        <span className="challenge-type">Saved Game</span>
                      </div>
                    </div>
                    <div className="challenge-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback: show all challenges in one list if sections aren't working */}
          {(!challenges || challenges.length === 0) && (!savedGames || savedGames.length === 0) && allChallenges.length > 0 && (
            <div className="challenges-list">
              {allChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="challenge-item"
                  onClick={() => {
                    if (challenge.source === 'firestore') {
                      onSelectChallenge(null, challenge);
                    } else {
                      onSelectChallenge(challenge.id);
                    }
                  }}
                >
                  <div className="challenge-info">
                    <div className="challenge-name">{challenge.name}</div>
                    <div className="challenge-details">
                      <span className="challenge-size">Size: {challenge.size}x{challenge.size}</span>
                      <span className="challenge-score">
                        High Score: {challenge.highScore} words
                      </span>
                      <span className="challenge-type">{challenge.type}</span>
                    </div>
                  </div>
                  <div className="challenge-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChallengeList;

