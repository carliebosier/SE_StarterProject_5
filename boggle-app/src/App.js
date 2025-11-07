import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import GuessInput from './components/GuessInput';
import FoundSolutions from './components/FoundSolutions';
import SummaryResults from './components/SummaryResults';
import ToggleGameState from './components/ToggleGameState';
import './App.css';
import {GAME_STATE} from './GameState.js';

function App() {
  const [allSolutions, setAllSolutions] = useState([]);  // solutions from solver
  const [foundSolutions, setFoundSolutions] = useState([]);  // found by user
  const [gameState, setGameState] = useState(GAME_STATE.BEFORE); // Just an enumerator for the three states
  const [grid, setGrid] = useState([]);   // the grid
  const [totalTime, setTotalTime] = useState(0);  // total time elapsed
  const [size, setSize] = useState(3);  // selected grid size
  const [game, setGame] = useState({}); // used to hold the MOCK REST ENDPOINT DATA 
  const [gameName, setGameName] = useState(''); // name for saving game
  const [savedGames, setSavedGames] = useState([]); // list of saved games
  const [selectedGameId, setSelectedGameId] = useState(''); // selected game to load
  const [saveMessage, setSaveMessage] = useState(''); // message for save feedback
  const [gameStats, setGameStats] = useState({ totalGames: 0, totalWords: 0, avgWords: 0 }); // game statistics
  const [isLoadingGame, setIsLoadingGame] = useState(false); // flag to prevent creating new game while loading

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const Convert = (s) => {  // convert a string into an array of tokens that are strings
    s = s.replace(/'/g, '');
    s = s.replace('[', '');
    s = s.replace(']', '');
    const tokens = s.split(",") // Split the string into an array of tokens
    .map(token => token.trim()) // Trim each token
    .filter(token => token !== ''); // Remove empty tokens
    return tokens;
  }

  // Load saved games list
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/games/`)
      .then((response) => response.json())
      .then((data) => {
        setSavedGames(data);
        // Calculate statistics
        if (data.length > 0) {
          const totalWords = data.reduce((sum, g) => {
            const words = Convert(g.foundwords);
            return sum + words.length;
          }, 0);
          setGameStats({
            totalGames: data.length,
            totalWords: totalWords,
            avgWords: Math.round(totalWords / data.length)
          });
        }
      })
      .catch((err) => {
        console.log("Error loading games:", err.message);
      });
  }, []);

  useEffect(() => {
    if (gameState === GAME_STATE.IN_PROGRESS && !isLoadingGame) {
      // Only create a new game if grid is empty (not when loading a saved game)
      if (grid.length === 0) {
        const url = `${apiBaseUrl}/api/game/create/${size}`;
        console.log("Creating new game:", url);
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log("New game data:", data);
            setGame(data);
            const s = data.grid.replace(/'/g, '"'); // replace single quotes with double quotes
            setGrid(JSON.parse(s)); // parse JSON string to a 2D array
            setFoundSolutions([]);
          })
          .catch((err) => {
            console.log("Fetch error:", err.message);
          });
      }
    } else if (gameState === GAME_STATE.BEFORE) {
      // Reset game when going back to BEFORE state
      setGame({});
      setGrid([]);
      setFoundSolutions([]);
      setAllSolutions([]);
      setIsLoadingGame(false);
    }
  }, [gameState, size, isLoadingGame]);

  // useEffect will trigger when the array items in the second argument are
  // updated so whenever grid is updated, we will recompute the solutions
  useEffect(() => {
    if (typeof game.foundwords !== "undefined") {
      let tmpAllSolutions = Convert(game.foundwords);
      setAllSolutions(tmpAllSolutions);
    }
  }, [grid, game.foundwords]);

  function correctAnswerFound(answer) {
    console.log("New correct answer:" + answer);
    setFoundSolutions([...foundSolutions, answer]);
  }

  function handleSaveGame() {
    if (!gameName.trim()) {
      setSaveMessage('Please enter a game name');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (!grid || grid.length === 0) {
      setSaveMessage('No game to save');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Serialize grid and foundwords to match backend format
    // Backend stores grid as string representation of 2D array
    // foundwords should contain ALL possible solutions (allSolutions) for validation
    const gridStr = JSON.stringify(grid).replace(/"/g, "'");
    // Save allSolutions (all possible words) in foundwords field
    const allWordsStr = allSolutions.length > 0 
      ? JSON.stringify(allSolutions).replace(/"/g, "'")
      : JSON.stringify(foundSolutions).replace(/"/g, "'");
    
    const gameData = {
      name: gameName.trim(),
      size: size,
      grid: gridStr,
      foundwords: allWordsStr
    };

    fetch(`${apiBaseUrl}/api/game/save/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData)
    })
      .then((response) => response.json())
      .then((data) => {
        setSaveMessage('Game saved successfully!');
        setGameName('');
        // Refresh saved games list
        return fetch(`${apiBaseUrl}/api/games/`);
      })
      .then((response) => response.json())
      .then((data) => {
        setSavedGames(data);
        if (data.length > 0) {
          const totalWords = data.reduce((sum, g) => {
            const words = Convert(g.foundwords);
            return sum + words.length;
          }, 0);
          setGameStats({
            totalGames: data.length,
            totalWords: totalWords,
            avgWords: Math.round(totalWords / data.length)
          });
        }
      })
      .catch((err) => {
        console.log("Error saving game:", err.message);
        setSaveMessage('Error saving game');
      });
    
    setTimeout(() => setSaveMessage(''), 3000);
  }

  function handleLoadGame() {
    if (!selectedGameId) {
      return;
    }

    console.log("Loading game with ID:", selectedGameId);
    setIsLoadingGame(true);
    
    fetch(`${apiBaseUrl}/api/game/${selectedGameId}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Loaded game data:", data);
        
        // Parse the grid
        const gridStr = data.grid.replace(/'/g, '"');
        const parsedGrid = JSON.parse(gridStr);
        
        // Parse foundwords (which contains all possible solutions)
        const allWords = Convert(data.foundwords);
        
        // Set all state at once to avoid race conditions
        setGrid(parsedGrid);
        setAllSolutions(allWords);
        setFoundSolutions([]); // Reset found solutions (user starts fresh when loading)
        setGame(data);
        setSize(data.size);
        setTotalTime(0);
        setSelectedGameId('');
        
        // Set game state to IN_PROGRESS to show the board
        // This will trigger useEffect, but isLoadingGame flag prevents creating new game
        setGameState(GAME_STATE.IN_PROGRESS);
        
        // Clear loading flag after a short delay to ensure state is set
        setTimeout(() => setIsLoadingGame(false), 100);
      })
      .catch((err) => {
        console.error("Error loading game:", err);
        setIsLoadingGame(false);
        alert(`Error loading game: ${err.message}`);
      });
  }

  return (
    <div className="App">
      <div className="header">
        <h1>🎲 Bison Boggle 🎲</h1>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Total Games:</span>
            <span className="stat-value">{gameStats.totalGames}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Words Found:</span>
            <span className="stat-value">{gameStats.totalWords}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Words/Game:</span>
            <span className="stat-value">{gameStats.avgWords}</span>
          </div>
        </div>
      </div>
      
      <div className="game-controls">
        <ToggleGameState 
          gameState={gameState}
          setGameState={(state) => setGameState(state)} 
          setSize={(state) => setSize(state)}
          setTotalTime={(state) => setTotalTime(state)}
        />

        <div className="save-load-section">
          <div className="save-game-controls">
            <input
              type="text"
              className="game-name-input"
              placeholder="Enter game name to save"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              disabled={gameState === GAME_STATE.BEFORE || grid.length === 0}
            />
            <button 
              className="save-button"
              onClick={handleSaveGame}
              disabled={gameState === GAME_STATE.BEFORE || grid.length === 0 || !gameName.trim()}
            >
              💾 Save Game
            </button>
            {saveMessage && (
              <span className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                {saveMessage}
              </span>
            )}
          </div>

          <div className="load-game-controls">
            <select
              className="game-select"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
            >
              <option value="">Select a saved game...</option>
              {savedGames.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Size: {g.size})
                </option>
              ))}
            </select>
            <button 
              className="load-button"
              onClick={handleLoadGame}
              disabled={!selectedGameId}
            >
              🎮 Load Game
            </button>
          </div>
        </div>
      </div>

      { gameState === GAME_STATE.IN_PROGRESS &&
        <div className="game-content">
          <Board board={grid} hidden={false} />

          <GuessInput 
            allSolutions={allSolutions}
            foundSolutions={foundSolutions}
            correctAnswerCallback={(answer) => correctAnswerFound(answer)}
          />
          <FoundSolutions headerText="Solutions you've found" words={foundSolutions} />
        </div>
      }
      { gameState === GAME_STATE.ENDED &&
        <div className="game-content">
          <Board board={grid} hidden={false} />
          <SummaryResults words={foundSolutions} totalTime={totalTime} />
          <FoundSolutions 
            headerText="Missed Words [wordsize > 3]: " 
            words={allSolutions.filter(word => {
              const wordLower = word.toLowerCase();
              const foundLower = foundSolutions.map(w => w.toLowerCase());
              return word.length > 3 && !foundLower.includes(wordLower);
            })}  
          />
        </div>
      }
    </div>
  );
}

export default App;
