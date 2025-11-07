import React from 'react';
import './SummaryResults.css';

function SummaryResults({ words, totalTime }) {
  const totalFound = words.length;
  
  return (
    <div className="Summary">
      <h2>SUMMARY</h2>
      <ul>
        <li>Total Words Found: {totalFound}</li>
        <li>Total Time: {totalTime.toFixed(2)} secs</li>
      </ul>
    </div>
  );
}

export default SummaryResults;
