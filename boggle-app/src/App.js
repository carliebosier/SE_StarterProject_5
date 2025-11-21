import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import GuessInput from './components/GuessInput';
import FoundSolutions from './components/FoundSolutions';
import SummaryResults from './components/SummaryResults';
import ToggleGameState from './components/ToggleGameState';
import ChallengeList from './components/ChallengeList';
import PopulateChallengesButton from './components/PopulateChallengesButton';
import GoogleSignIn from './components/GoogleSignIn';
import Leaderboard from './components/Leaderboard';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { convertFirestoreChallengeToApp } from './utils/firestoreHelpers';
import { saveScore } from './utils/scoreService';
import { createGame, saveGame, getGame, getSavedGames } from './utils/gameService';
import dictionaryData from './full-wordlist.json';
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
  const [saveMessage, setSaveMessage] = useState(''); // message for save feedback
  const [gameStats, setGameStats] = useState({ totalGames: 0, totalWords: 0, avgWords: 0 }); // game statistics
  const [isLoadingGame, setIsLoadingGame] = useState(false); // flag to prevent creating new game while loading
  const [showChallengeList, setShowChallengeList] = useState(false); // flag to show/hide challenge list modal
  const [showAdminPanel, setShowAdminPanel] = useState(false); // flag to show/hide admin panel for populating Firestore
  const [firestoreChallenges, setFirestoreChallenges] = useState([]); // challenges from Firestore
  const [loadingFirestoreChallenges, setLoadingFirestoreChallenges] = useState(false); // loading state for Firestore challenges
  const [currentChallengeId, setCurrentChallengeId] = useState(null); // ID of current Firestore challenge being played
  const [scoreSaved, setScoreSaved] = useState(false); // Flag to track if score has been saved

  const { currentUser } = useAuth();

  // Helper function to convert string to array (for legacy Django format compatibility)
  const Convert = (s) => {  // convert a string into an array of tokens that are strings
    if (!s) return [];
    if (Array.isArray(s)) return s; // Already an array
    
    s = s.replace(/'/g, '');
    s = s.replace('[', '');
    s = s.replace(']', '');
    const tokens = s.split(",") // Split the string into an array of tokens
    .map(token => token.trim()) // Trim each token
    .filter(token => token !== ''); // Remove empty tokens
    return tokens;
  }

  // Load saved games from Firestore (replaces Django backend)
  useEffect(() => {
    if (currentUser) {
      getSavedGames(currentUser.uid)
        .then((games) => {
          setSavedGames(games);
          // Calculate statistics
          if (games.length > 0) {
            const totalWords = games.reduce((sum, g) => sum + (g.solutions?.length || 0), 0);
            setGameStats({
              totalGames: games.length,
              totalWords: totalWords,
              avgWords: Math.round(totalWords / games.length)
            });
          }
        })
        .catch((err) => {
          console.error('Error loading saved games:', err);
        });
    } else {
      // Clear saved games if user signs out
      setSavedGames([]);
      setGameStats({ totalGames: 0, totalWords: 0, avgWords: 0 });
    }
  }, [currentUser]);

  // Load challenges from Firestore
  useEffect(() => {
    const loadFirestoreChallenges = async () => {
      if (!db) {
        console.log('Firestore not initialized, skipping challenge load');
        return;
      }

      setLoadingFirestoreChallenges(true);
      try {
        const challengesCollection = collection(db, 'challenges');
        const snapshot = await getDocs(challengesCollection);
        
        const challenges = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          try {
            // Convert Firestore document to app format (flattened grid -> 2D grid)
            const challenge = convertFirestoreChallengeToApp({
              ...data,
              id: doc.id, // Use Firestore document ID
              source: 'firestore' // Mark as Firestore challenge
            });
            challenges.push(challenge);
          } catch (error) {
            console.error(`Error converting challenge ${doc.id}:`, error);
          }
        });
        
        console.log(`Loaded ${challenges.length} challenges from Firestore`);
        setFirestoreChallenges(challenges);
      } catch (error) {
        console.error('Error loading Firestore challenges:', error);
      } finally {
        setLoadingFirestoreChallenges(false);
      }
    };

    loadFirestoreChallenges();
  }, []); // Load once on mount

  useEffect(() => {
    if (gameState === GAME_STATE.IN_PROGRESS && !isLoadingGame) {
      // Only create a new game if grid is empty (not when loading a saved game)
      if (grid.length === 0) {
        console.log("Creating new game client-side, size:", size);
        createGame(size, dictionaryData.words || dictionaryData)
          .then((gameData) => {
            console.log("New game created:", gameData);
            setGame({
              name: gameData.name,
              size: gameData.size,
              foundwords: JSON.stringify(gameData.solutions).replace(/"/g, "'")
            });
            setGrid(gameData.grid); // Already a 2D array
            setAllSolutions(gameData.solutions);
            setFoundSolutions([]);
          })
          .catch((err) => {
            console.error("Error creating game:", err);
            alert('Failed to create game: ' + err.message);
          });
      }
    } else if (gameState === GAME_STATE.BEFORE) {
      // Reset game when going back to BEFORE state
      setGame({});
      setGrid([]);
      setFoundSolutions([]);
      setAllSolutions([]);
      setCurrentChallengeId(null);
      setScoreSaved(false);
      setIsLoadingGame(false);
    }
  }, [gameState, size, isLoadingGame]);

  // useEffect will trigger when the array items in the second argument are
  // updated so whenever grid is updated, we will recompute the solutions
  // Note: For Firestore games, solutions are already set when loading
  useEffect(() => {
    if (typeof game.foundwords !== "undefined" && game.foundwords) {
      // Try to parse foundwords if it's a string (legacy Django format)
      try {
        let tmpAllSolutions = Convert(game.foundwords);
        setAllSolutions(tmpAllSolutions);
      } catch (e) {
        // If parsing fails, solutions might already be set correctly
        console.log("Note: foundwords parsing skipped (solutions may already be set)");
      }
    }
  }, [grid, game.foundwords]);

  // Automatically save score to Firestore when game ends and user is playing a Firestore challenge
  useEffect(() => {
    if (gameState === GAME_STATE.ENDED && currentChallengeId && currentUser && !scoreSaved) {
      const score = foundSolutions.length;
      
      // Only save if score > 0
      if (score > 0) {
        saveScore(
          currentUser.uid,
          currentChallengeId,
          score,
          {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
          }
        ).then((result) => {
          if (result.updated) {
            console.log('Score automatically saved to Firestore:', score);
            setScoreSaved(true);
          } else {
            console.log('Score not saved (not higher than existing):', result.reason);
            setScoreSaved(true); // Mark as saved so we don't try again
          }
        }).catch((error) => {
          console.error('Error saving score to Firestore:', error);
          // Don't set scoreSaved to true so we can retry
        });
      } else {
        setScoreSaved(true); // Mark as saved even if score is 0
      }
    }
  }, [gameState, currentChallengeId, currentUser, foundSolutions.length, scoreSaved]);

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

    if (!currentUser) {
      setSaveMessage('Please sign in to save games');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // Prepare game data for Firestore
    const gameDataToSave = {
      name: gameName.trim(),
      size: size,
      grid: grid, // 2D array
      solutions: allSolutions, // All valid words
      score: foundSolutions.length // User's score (words found)
    };

    // Save to Firestore
    saveGame(
      gameDataToSave,
      currentUser.uid,
      {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL
      }
    )
      .then((gameId) => {
        setSaveMessage('Game saved successfully!');
        setGameName('');
        // Refresh saved games list
        return getSavedGames(currentUser.uid);
      })
      .then((games) => {
        setSavedGames(games);
        // Calculate statistics
        if (games.length > 0) {
          const totalWords = games.reduce((sum, g) => sum + (g.solutions?.length || 0), 0);
          setGameStats({
            totalGames: games.length,
            totalWords: totalWords,
            avgWords: Math.round(totalWords / games.length)
          });
        }
      })
      .catch((err) => {
        console.error('Error saving game:', err);
        setSaveMessage('Error saving game: ' + (err.message || 'Unknown error'));
      });
    
    setTimeout(() => setSaveMessage(''), 3000);
  }

  function handleLoadGame(gameId, challengeData = null) {
    if (!gameId && !challengeData) {
      return;
    }

    console.log("Loading game/challenge:", gameId || challengeData?.name);
    setIsLoadingGame(true);
    setShowChallengeList(false); // Close modal when loading

    // If challengeData is provided, it's a Firestore challenge (already loaded)
    if (challengeData) {
      try {
        console.log("Loading Firestore challenge:", challengeData);
        
        // Challenge data is already in app format (2D grid) from convertFirestoreChallengeToApp
        const parsedGrid = challengeData.grid;
        const allWords = challengeData.solutions || [];
        
        console.log("Loaded grid:", parsedGrid);
        console.log("Loaded solutions count:", allWords.length);
        
        // Validate grid
        if (!Array.isArray(parsedGrid) || parsedGrid.length === 0) {
          throw new Error("Invalid grid format: not an array");
        }
        
        if (!parsedGrid.every(row => Array.isArray(row))) {
          throw new Error("Invalid grid format: not all rows are arrays");
        }
        
        // Set all state at once to avoid race conditions
        setGrid(parsedGrid);
        setAllSolutions(allWords);
        setFoundSolutions([]); // Reset found solutions (user starts fresh when loading)
        setGame({
          ...challengeData,
          name: challengeData.name,
          size: challengeData.size
        });
        setSize(challengeData.size);
        setTotalTime(0);
        // Use the same format as populateChallenges script for consistency
        const challengeDocId = challengeData.id || challengeData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setCurrentChallengeId(challengeDocId); // Track challenge ID
        setScoreSaved(false); // Reset score saved flag
        
        // Set game state to IN_PROGRESS to show the board
        setGameState(GAME_STATE.IN_PROGRESS);
        
        // Clear loading flag after a short delay to ensure state is set
        setTimeout(() => setIsLoadingGame(false), 100);
      } catch (error) {
        console.error("Error loading Firestore challenge:", error);
        setIsLoadingGame(false);
        alert(`Error loading challenge: ${error.message}`);
      }
      return;
    }

    // Otherwise, load from Firestore saved games (replaces Django backend)
    getGame(gameId)
      .then((gameData) => {
        console.log("Loaded game data from Firestore:", gameData);
        
        // Game data already has 2D grid and solutions
        // Validate grid
        if (!Array.isArray(gameData.grid) || gameData.grid.length === 0) {
          throw new Error("Invalid grid format: not an array");
        }
        
        if (!gameData.grid.every(row => Array.isArray(row))) {
          throw new Error("Invalid grid format: not all rows are arrays");
        }
        
        // Set all state at once to avoid race conditions
        setGrid(gameData.grid); // Already 2D array
        setAllSolutions(gameData.solutions || []);
        setFoundSolutions([]); // Reset found solutions (user starts fresh when loading)
        setGame({
          ...gameData,
          foundwords: JSON.stringify(gameData.solutions || []).replace(/"/g, "'") // Legacy format for compatibility
        });
        setSize(gameData.size);
        setTotalTime(0);
        setCurrentChallengeId(null); // Not a Firestore challenge
        setScoreSaved(false); // Reset score saved flag
        
        // Set game state to IN_PROGRESS to show the board
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

  function handleShowChallengeList() {
    setShowChallengeList(true);
  }

  function handleCloseChallengeList() {
    setShowChallengeList(false);
  }

  return (
    <div className="App">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1 style={{ margin: 0 }}>🎲 Bison Boggle 🎲</h1>
          <GoogleSignIn />
        </div>
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
      
      {/* Temporary Admin Panel - Remove after populating challenges */}
      <div className="game-controls" style={{ marginBottom: '10px', background: '#fff3cd', border: '2px solid #ffc107' }}>
        <button 
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          style={{
            padding: '8px 16px',
            background: showAdminPanel ? '#ffc107' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9em',
            marginBottom: showAdminPanel ? '15px' : '0'
          }}
        >
          {showAdminPanel ? '▼ Hide' : '▶ Show'} Admin Panel (Firestore Setup)
        </button>
        
        {showAdminPanel && (
          <div style={{ marginTop: '15px' }}>
            <h3 style={{ marginTop: '0', color: '#856404', fontSize: '1.1em' }}>Firestore Admin Panel</h3>
            <p style={{ fontSize: '0.9em', color: '#856404', marginBottom: '15px' }}>
              Use this to populate Firestore with fixed challenge grids. This panel can be removed after setup.
            </p>
            <PopulateChallengesButton />
          </div>
        )}
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
            <button 
              className="load-button"
              onClick={handleShowChallengeList}
              disabled={firestoreChallenges.length === 0 && (!currentUser || savedGames.length === 0)}
            >
              🎮 Load Challenge
            </button>
            {!currentUser && firestoreChallenges.length > 0 && (
              <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '10px' }}>
                Sign in to save and load your games
              </span>
            )}
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
          {currentChallengeId && (
            <Leaderboard 
              challengeId={currentChallengeId} 
              challengeName={game.name || 'Challenge'}
            />
          )}
          {currentUser && currentChallengeId && scoreSaved && (
            <div style={{ 
              padding: '10px', 
              background: '#d4edda', 
              color: '#155724', 
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              ✓ Score saved to leaderboard!
            </div>
          )}
          {currentUser && !currentChallengeId && (
            <div style={{ 
              padding: '10px', 
              background: '#fff3cd', 
              color: '#856404', 
              borderRadius: '5px',
              marginTop: '10px',
              fontSize: '0.9em'
            }}>
              💡 Sign in and play a Fixed Challenge to see your score on the leaderboard!
            </div>
          )}
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

      {showChallengeList && (
        <ChallengeList
          challenges={firestoreChallenges}
          savedGames={savedGames}
          onSelectChallenge={handleLoadGame}
          onClose={handleCloseChallengeList}
          loading={loadingFirestoreChallenges}
        />
      )}
    </div>
  );
}

export default App;
