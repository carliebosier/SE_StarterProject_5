/**
 * Game Service
 * Handles creating, saving, and loading games in Firestore
 * Replaces Django backend functionality
 */

import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { generateBoard } from './boggleSolver';
import { solveBoggle } from './boggleSolver';
import { flattenGrid, unflattenGrid } from './firestoreHelpers';
import dictionaryData from '../full-wordlist.json';

/**
 * Create a new random game client-side
 * @param {number} size - Grid size (e.g., 3, 4, 5)
 * @param {Array<string>} dictionary - Word dictionary (optional, uses default if not provided)
 * @returns {Promise<Object>} Game object with grid and solutions
 */
export async function createGame(size, dictionary = null) {
  if (!size || size < 3 || size > 10) {
    throw new Error('Size must be between 3 and 10');
  }

  // Use provided dictionary or load from JSON file
  let wordList;
  if (dictionary) {
    wordList = Array.isArray(dictionary) ? dictionary : dictionary.words;
  } else {
    wordList = dictionaryData.words || dictionaryData;
  }

  if (!Array.isArray(wordList)) {
    throw new Error('Dictionary must be an array or an object with a words array');
  }

  // Generate random grid client-side
  const grid = generateBoard(size);

  // Calculate all solutions using boggle solver
  const solutions = solveBoggle(grid, wordList);

  // Create game name with timestamp
  const now = new Date();
  const name = `Random ${size}x${size} Grid - ${now.toLocaleString()}`;

  return {
    name,
    size,
    grid, // 2D array
    solutions, // Array of all valid words
    createdAt: now.toISOString()
  };
}

/**
 * Save a game to Firestore
 * @param {Object} gameData - Game data to save
 * @param {string} userId - Firebase user ID
 * @param {Object} userInfo - User display name and photo URL
 * @returns {Promise<string>} Document ID of saved game
 */
export async function saveGame(gameData, userId, userInfo = {}) {
  if (!userId) {
    throw new Error('User must be signed in to save games');
  }

  if (!gameData || !gameData.grid || !gameData.solutions) {
    throw new Error('Invalid game data: must have grid and solutions');
  }

  try {
    const savedGamesCollection = collection(db, 'savedGames');

    // Flatten grid for Firestore storage
    const flattenedGrid = flattenGrid(gameData.grid);

    const gameDoc = {
      name: gameData.name || 'Untitled Game',
      size: gameData.size,
      grid: flattenedGrid, // Flattened 1D array
      solutions: gameData.solutions, // Array of all valid words
      score: gameData.score || 0, // Words found by user
      userId: userId,
      userName: userInfo.displayName || userInfo.email || 'Anonymous',
      userPhotoURL: userInfo.photoURL || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create a new document with auto-generated ID
    const gameRef = doc(savedGamesCollection);
    await setDoc(gameRef, gameDoc);

    console.log(`Game saved: ${gameDoc.name} (ID: ${gameRef.id})`);
    return gameRef.id;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
}

/**
 * Get a game from Firestore
 * @param {string} gameId - Firestore document ID
 * @returns {Promise<Object>} Game object with 2D grid
 */
export async function getGame(gameId) {
  if (!gameId) {
    throw new Error('gameId is required');
  }

  try {
    const savedGamesCollection = collection(db, 'savedGames');
    const gameRef = doc(savedGamesCollection, gameId);
    const gameDoc = await getDoc(gameRef);

    if (!gameDoc.exists()) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    const data = gameDoc.data();

    // Convert flattened grid back to 2D array
    const grid = unflattenGrid(data.grid, data.size);

    return {
      id: gameDoc.id,
      name: data.name,
      size: data.size,
      grid, // 2D array
      solutions: data.solutions || [],
      score: data.score || 0,
      userId: data.userId,
      userName: data.userName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
}

/**
 * Get all saved games (optionally filter by user)
 * @param {string} userId - Optional: filter by user ID
 * @returns {Promise<Array>} Array of game objects
 */
export async function getSavedGames(userId = null) {
  try {
    const savedGamesCollection = collection(db, 'savedGames');
    
    let gamesQuery;
    if (userId) {
      // Get games for a specific user
      gamesQuery = query(
        savedGamesCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all games
      gamesQuery = query(
        savedGamesCollection,
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(gamesQuery);
    const games = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert flattened grid back to 2D array for compatibility
      // Note: We might not need the full grid in list view, but keeping it for compatibility
      const grid = unflattenGrid(data.grid, data.size);

      games.push({
        id: doc.id,
        name: data.name,
        size: data.size,
        grid, // 2D array (for compatibility)
        solutions: data.solutions || [],
        score: data.score || 0,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    return games;
  } catch (error) {
    console.error('Error getting saved games:', error);
    throw error;
  }
}

/**
 * Delete a saved game
 * @param {string} gameId - Firestore document ID
 * @param {string} userId - Firebase user ID (for security)
 * @returns {Promise<void>}
 */
export async function deleteGame(gameId, userId) {
  if (!gameId || !userId) {
    throw new Error('gameId and userId are required');
  }

  try {
    // First verify the user owns this game
    const game = await getGame(gameId);
    if (game.userId !== userId) {
      throw new Error('User does not have permission to delete this game');
    }

    // Delete the game
    const savedGamesCollection = collection(db, 'savedGames');
    const gameRef = doc(savedGamesCollection, gameId);
    await deleteDoc(gameRef);

    console.log(`Game deleted: ${gameId}`);
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
}

