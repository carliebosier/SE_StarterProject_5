import React from 'react';
import './FoundSolutions.css';

function FoundSolutions({ headerText, words }) {
  return (
    <div className="Found-solutions-list">
      <h4>{headerText}: {words.length}</h4>
      <ul>
        {words.map(w => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}

export default FoundSolutions;


