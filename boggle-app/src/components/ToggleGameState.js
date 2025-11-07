import React, { useState, useEffect, useRef } from 'react';
import './ToggleGameState.css';
import {GAME_STATE} from '../GameState.js';

function ToggleGameState({ gameState, setGameState, setSize, setTotalTime }) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (gameState === GAME_STATE.IN_PROGRESS) {
      // Reset and start timer
      setElapsedSec(0);
      setTotalTime(0);
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSec(elapsed);
        setTotalTime(elapsed);
      }, 1000);
    } else {
      // Clear interval when not in progress
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (gameState === GAME_STATE.ENDED) {
        // Keep the final time
        setTotalTime(elapsedSec);
      } else {
        // Reset when in BEFORE state
        setElapsedSec(0);
        setTotalTime(0);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState]);

  const buttonText = gameState === GAME_STATE.IN_PROGRESS ? 'End Game' : 'Start';

  function handleToggle() {
    if (gameState === GAME_STATE.IN_PROGRESS) {
      setGameState(GAME_STATE.ENDED);
    } else if (gameState === GAME_STATE.ENDED) {
      setGameState(GAME_STATE.BEFORE);
    } else {
      setGameState(GAME_STATE.IN_PROGRESS);
    }
  }

  return (
    <div className="Toggle-game-state">
      <div className="controls-row">
        <button className="primary-button" onClick={handleToggle}>{buttonText}</button>
        <div className="size-select">
          <label htmlFor="size">Grid Size</label>
          <select 
            id="size" 
            defaultValue={3} 
            onChange={e => setSize(Number(e.target.value))}
            disabled={gameState === GAME_STATE.IN_PROGRESS}
          >
            {[3,4,5,6,7,8,9,10].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        {gameState === GAME_STATE.IN_PROGRESS && (
          <div className="timer">Time: {elapsedSec}s</div>
        )}
      </div>
    </div>
  );
}

export default ToggleGameState;
