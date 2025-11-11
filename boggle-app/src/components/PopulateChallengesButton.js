/**
 * Component to populate Firestore with fixed challenge grids
 * This is a utility component that can be used in the admin panel or during setup
 */

import React, { useState, useEffect } from 'react';
import { populateChallenges } from '../scripts/populateChallenges';
import { testFirestoreConnection, verifyFirebaseConfig } from '../utils/firebaseTest';
import './PopulateChallengesButton.css';

function PopulateChallengesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Test Firebase connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    // First verify config
    const configValid = verifyFirebaseConfig();
    if (!configValid) {
      setConnectionStatus({
        success: false,
        message: 'Firebase configuration is incomplete. Please check your .env file.'
      });
      return;
    }
    
    // Then test connection
    const status = await testFirestoreConnection();
    setConnectionStatus(status);
  };

  const handlePopulate = async (overwrite = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await populateChallenges(null, overwrite);
      setResult(result);
      console.log('Populate result:', result);
    } catch (err) {
      console.error('Error populating challenges:', err);
      setError(err.message || 'Failed to populate challenges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="populate-challenges-container">
      <h3>Populate Firestore Challenges</h3>
      <p>This will add fixed challenge grids to your Firestore database.</p>
      
      {/* Connection Status */}
      {connectionStatus && (
        <div className={connectionStatus.success ? 'success-message' : 'error-message'} style={{ marginBottom: '15px', whiteSpace: 'pre-line' }}>
          <strong>Connection Status:</strong><br />
          {connectionStatus.message}
          {!connectionStatus.success && (
            <button 
              onClick={checkConnection}
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Test Again
            </button>
          )}
        </div>
      )}
      
      <div className="button-group">
        <button
          onClick={() => handlePopulate(false)}
          disabled={loading || (connectionStatus && !connectionStatus.success)}
          className="populate-button"
        >
          {loading ? 'Populating...' : 'Populate Challenges'}
        </button>
        
        <button
          onClick={() => handlePopulate(true)}
          disabled={loading || (connectionStatus && !connectionStatus.success)}
          className="populate-button overwrite"
        >
          {loading ? 'Populating...' : 'Overwrite Existing'}
        </button>
      </div>
      
      {connectionStatus && !connectionStatus.success && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px' }}>
          <strong>⚠️ Cannot populate challenges until Firebase is connected.</strong>
          <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
            Fix the connection issue above, then click "Test Again" to verify.
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="success-message">
          <p>✓ Successfully populated challenges!</p>
          <p>Added: {result.added} challenges</p>
          {result.skipped > 0 && (
            <p>Skipped: {result.skipped} challenges (already exist)</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PopulateChallengesButton;

