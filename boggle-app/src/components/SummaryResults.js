import React from 'react';
import './SummaryResults.css';

function SummaryResults({ words, totalTime, score, isChallenge }) {
  const totalFound = words.length;
  
  return (
    <div className="Summary">
      <h2>SUMMARY</h2>
      <ul>
        <li>Total Words Found: {totalFound}</li>
        <li>Total Time: {totalTime.toFixed(2)} secs</li>
        {score !== undefined && (
          <li className={isChallenge ? 'challenge-score' : ''}>
            Total Score: <strong>{score}</strong>
            {isChallenge && <span className="challenge-badge">Challenge</span>}
          </li>
        )}
      </ul>
    </div>
  );
}

export default SummaryResults;
