import React, { useState } from 'react';
import { createChallenge } from '../firebase/firestoreService';
import './AdminPanel.css';

// Pre-defined challenge grids
const CHALLENGES = [
  {
    name: "Easy Starter",
    description: "A simple 3x3 grid to get started",
    size: 3,
    grid: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ],
    foundwords: ['ABE', 'ACE', 'BED', 'BEE', 'BEG', 'BID', 'BIG', 'CAB', 'CAD', 'DEAD', 'DEAF', 'DEED', 'DEIF', 'FACE', 'FADE', 'FADED', 'FAG', 'FED', 'FIG', 'GAB', 'GAD', 'GIB', 'HAD', 'HAG', 'HID', 'HIDE', 'IDE', 'ICE']
  },
  {
    name: "Medium Challenge",
    description: "A 4x4 grid with more possibilities",
    size: 4,
    grid: [
      ['T', 'E', 'S', 'T'],
      ['W', 'O', 'R', 'D'],
      ['G', 'A', 'M', 'E'],
      ['P', 'L', 'A', 'Y']
    ],
    foundwords: ['TEST', 'WORD', 'GAME', 'PLAY', 'TEAM', 'TEAR', 'TEAS', 'TORE', 'TORN', 'WORE', 'WORN', 'GORE', 'GORN', 'PORE', 'PORN', 'TALE', 'TAME', 'TARE', 'TEAM', 'TEAR', 'TERM', 'TOME', 'TORE', 'WALE', 'WAME', 'WARE', 'WARM', 'WART', 'WAVE', 'WORE', 'WORM', 'WORT', 'GALE', 'GAME', 'GAPE', 'GARE', 'GATE', 'GAVE', 'GORE', 'GORM', 'PALE', 'PALM', 'PALS', 'PARE', 'PARK', 'PARS', 'PART', 'PASE', 'PATE', 'PATS', 'PAVE', 'PORE', 'PORK', 'PORT', 'POSE', 'POST']
  },
  {
    name: "Word Master",
    description: "Challenge yourself with this 4x4 grid",
    size: 4,
    grid: [
      ['C', 'A', 'T', 'S'],
      ['D', 'O', 'G', 'S'],
      ['B', 'I', 'R', 'D'],
      ['F', 'I', 'S', 'H']
    ],
    foundwords: ['CATS', 'DOGS', 'BIRD', 'FISH', 'CAT', 'DOG', 'BIR', 'FIS', 'CAD', 'CAG', 'CAR', 'CAS', 'COD', 'COG', 'COR', 'COS', 'BID', 'BIG', 'BIN', 'BIO', 'BIR', 'BIS', 'BIT', 'FIB', 'FIG', 'FIN', 'FIR', 'FIS', 'FIT']
  }
];

function AdminPanel({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [populatedChallenges, setPopulatedChallenges] = useState([]);

  const handlePopulate = async () => {
    setLoading(true);
    setMessage('');
    const results = [];

    for (const challenge of CHALLENGES) {
      try {
        const challengeId = await createChallenge(
          challenge.name,
          challenge.grid,
          challenge.foundwords,
          challenge.size,
          challenge.description
        );
        results.push({ name: challenge.name, success: true, id: challengeId });
      } catch (error) {
        console.error(`Error adding challenge "${challenge.name}":`, error);
        results.push({ name: challenge.name, success: false, error: error.message });
      }
    }

    setPopulatedChallenges(results);
    const successCount = results.filter(r => r.success).length;
    setMessage(`Populated ${successCount}/${CHALLENGES.length} challenges`);
    setLoading(false);
  };

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <h2>Admin Panel - Populate Challenges</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="admin-panel-content">
          <p>This will populate Firestore with {CHALLENGES.length} pre-defined challenge grids.</p>
          <button 
            onClick={handlePopulate} 
            disabled={loading}
            className="populate-btn"
          >
            {loading ? 'Populating...' : 'Populate Challenges'}
          </button>
          
          {message && (
            <div className={`admin-message ${message.includes('error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          {populatedChallenges.length > 0 && (
            <div className="populated-list">
              <h3>Results:</h3>
              <ul>
                {populatedChallenges.map((result, index) => (
                  <li key={index} className={result.success ? 'success' : 'error'}>
                    {result.success ? '✓' : '✗'} {result.name}
                    {result.id && <span className="challenge-id"> (ID: {result.id})</span>}
                    {result.error && <span className="error-text"> - {result.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

