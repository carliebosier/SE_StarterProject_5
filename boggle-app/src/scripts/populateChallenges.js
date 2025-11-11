/**
 * Script to populate Firestore with fixed challenge grids
 * 
 * This script manually populates Firestore with a set of predefined challenge grids.
 * Run this script once to seed your Firestore database with challenge data.
 * 
 * Usage:
 * 1. Set up your Firebase configuration in src/firebase/config.js
 * 2. Run: node src/scripts/populateChallenges.js
 *    OR import and call populateChallenges() from your React app
 */

import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { solveBoggle } from '../utils/boggleSolver';
import dictionaryData from '../full-wordlist.json';

/**
 * Fixed challenge grids
 * Each challenge has:
 * - name: Display name for the challenge
 * - size: Grid size (e.g., 3, 4, 5, etc.)
 * - grid: 2D array representing the Boggle board
 * - solutions: Array of all valid words that can be found on this board
 */
const FIXED_CHALLENGES = [
  {
    name: "Easy Starter",
    size: 3,
    grid: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Classic 4x4",
    size: 4,
    grid: [
      ['T', 'W', 'Y', 'R'],
      ['E', 'N', 'P', 'H'],
      ['G', 'Z', 'Qu', 'R'],
      ['O', 'N', 'T', 'A']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Word Builder",
    size: 4,
    grid: [
      ['S', 'T', 'A', 'R'],
      ['T', 'R', 'E', 'E'],
      ['A', 'R', 'E', 'A'],
      ['R', 'E', 'E', 'D']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Mixed Challenge",
    size: 5,
    grid: [
      ['B', 'R', 'A', 'I', 'N'],
      ['L', 'O', 'V', 'E', 'S'],
      ['G', 'A', 'M', 'E', 'S'],
      ['W', 'O', 'R', 'D', 'S'],
      ['F', 'U', 'N', 'N', 'Y']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Quick Words",
    size: 3,
    grid: [
      ['C', 'A', 'T'],
      ['D', 'O', 'G'],
      ['R', 'U', 'N']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Letter Mix",
    size: 4,
    grid: [
      ['L', 'I', 'N', 'E'],
      ['I', 'N', 'E', 'R'],
      ['N', 'E', 'R', 'D'],
      ['E', 'R', 'D', 'S']
    ],
    solutions: [] // Will be calculated
  },
  {
    name: "Big Grid",
    size: 6,
    grid: [
      ['B', 'E', 'A', 'U', 'T', 'Y'],
      ['E', 'A', 'R', 'T', 'H', 'S'],
      ['A', 'R', 'T', 'S', 'T', 'A'],
      ['U', 'T', 'S', 'T', 'A', 'R'],
      ['T', 'H', 'T', 'A', 'R', 'T'],
      ['Y', 'S', 'A', 'R', 'T', 'S']
    ],
    solutions: [] // Will be calculated
  }
];

/**
 * Calculate solutions for a grid using the boggle solver
 * 
 * @param {Array<Array<string>>} grid - 2D array representing the Boggle board
 * @param {Array<string>} dictionary - Array of valid words
 * @returns {Array<string>} Array of valid words found on the board
 */
function calculateSolutions(grid, dictionary) {
  try {
    return solveBoggle(grid, dictionary);
  } catch (error) {
    console.error('Error calculating solutions:', error);
    return [];
  }
}

/**
 * Populate Firestore with fixed challenge grids
 * 
 * @param {Array<string>} dictionary - Array of valid words for the dictionary (optional, uses default if not provided)
 * @param {boolean} overwrite - Whether to overwrite existing challenges (default: false)
 */
export async function populateChallenges(dictionary = null, overwrite = false) {
  try {
    console.log('Starting to populate Firestore with challenges...');
    
    // Verify Firebase is initialized and connected
    if (!db) {
      throw new Error(
        'Firestore is not initialized. Please check:\n' +
        '1. Your .env file has all Firebase environment variables set (REACT_APP_FIREBASE_*)\n' +
        '2. You have restarted your React app after creating/updating .env\n' +
        '3. Your Firebase configuration values are correct (not placeholder values)\n' +
        '4. Check the browser console for Firebase initialization errors'
      );
    }
    
    // Try to enable network connection (helps with offline errors)
    try {
      const { enableNetwork } = await import('firebase/firestore');
      await enableNetwork(db);
      console.log('Firestore network connection enabled');
    } catch (networkError) {
      console.warn('Note: Could not explicitly enable network:', networkError.message);
      // Continue anyway - Firestore will try to connect automatically
    }
    
    // Use provided dictionary or load from JSON file
    // The dictionary JSON has a 'words' property, so extract the array
    let wordList;
    if (dictionary) {
      wordList = Array.isArray(dictionary) ? dictionary : dictionary.words;
    } else {
      wordList = dictionaryData.words || dictionaryData;
    }
    
    if (!Array.isArray(wordList)) {
      throw new Error('Dictionary must be an array or an object with a words array');
    }
    
    console.log(`Using dictionary with ${wordList.length} words`);
    
    const challengesCollection = collection(db, 'challenges');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < FIXED_CHALLENGES.length; i++) {
      const challenge = FIXED_CHALLENGES[i];
      
      // Calculate solutions for the grid
      console.log(`Calculating solutions for challenge: ${challenge.name}...`);
      const solutions = calculateSolutions(challenge.grid, wordList);
      console.log(`  Found ${solutions.length} valid words`);
      
      // Prepare challenge data for Firestore
      // Firestore doesn't support nested arrays, so we need to flatten the 2D grid
      // We'll store it as a 1D array: ['A', 'B', 'C', 'D'] instead of [['A', 'B'], ['C', 'D']]
      // When reading, we can reconstruct the 2D array using the size
      const flattenedGrid = challenge.grid.flat();
      
      const challengeData = {
        name: challenge.name,
        size: challenge.size,
        grid: flattenedGrid, // Flattened 1D array (Firestore supports this)
        solutions: solutions, // Array of strings (Firestore supports this)
        createdAt: new Date().toISOString(),
        isFixed: true, // Flag to indicate this is a fixed challenge
        // Store solution count for quick reference
        solutionCount: solutions.length
      };
      
      // Use a deterministic document ID based on challenge name (sanitized)
      // This allows us to update existing challenges if overwrite is true
      const docId = challenge.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const challengeRef = doc(challengesCollection, docId);
      
      if (overwrite) {
        // Use merge: true to update existing or create new
        await setDoc(challengeRef, challengeData, { merge: true });
        console.log(`✓ Added/Updated challenge: ${challenge.name} (ID: ${docId})`);
        addedCount++;
      } else {
        // Check if document already exists before creating
        try {
          const docSnapshot = await getDoc(challengeRef);
          if (docSnapshot.exists()) {
            console.log(`⊘ Skipped challenge (already exists): ${challenge.name}`);
            skippedCount++;
          } else {
            await setDoc(challengeRef, challengeData);
            console.log(`✓ Added challenge: ${challenge.name} (ID: ${docId})`);
            addedCount++;
          }
        } catch (docError) {
          // If getDoc fails (e.g., offline), try to setDoc anyway
          if (docError.code === 'unavailable' || docError.message.includes('offline')) {
            console.warn(`Network issue with challenge ${challenge.name}, attempting to write anyway...`);
            try {
              await setDoc(challengeRef, challengeData);
              console.log(`✓ Added challenge: ${challenge.name} (ID: ${docId})`);
              addedCount++;
            } catch (writeError) {
              console.error(`Failed to add challenge ${challenge.name}:`, writeError);
              throw new Error(`Failed to add challenge "${challenge.name}": ${writeError.message}. Please check your Firebase configuration and network connection.`);
            }
          } else {
            throw docError;
          }
        }
      }
    }
    
    console.log(`\n✓ Successfully populated Firestore!`);
    console.log(`  Added: ${addedCount} challenges`);
    if (skippedCount > 0) {
      console.log(`  Skipped: ${skippedCount} challenges (may already exist)`);
      console.log(`  Tip: Use populateChallenges(dictionary, true) to overwrite existing challenges`);
    }
    
    return { 
      success: true, 
      added: addedCount, 
      skipped: skippedCount,
      total: FIXED_CHALLENGES.length 
    };
    
  } catch (error) {
    console.error('Error populating challenges:', error);
    
    // Provide more helpful error messages
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      throw new Error(
        'Firestore is offline or unavailable. Please check:\n' +
        '1. Your Firebase configuration in .env file\n' +
        '2. That Firestore is enabled in Firebase Console\n' +
        '3. Your internet connection\n' +
        '4. Firestore security rules allow writes'
      );
    } else if (error.message.includes('permission-denied') || error.code === 'permission-denied') {
      throw new Error(
        'Permission denied. Please check:\n' +
        '1. Firestore security rules allow writes\n' +
        '2. You are authenticated (if required)\n' +
        '3. Your Firebase project settings'
      );
    } else if (error.message.includes('Firebase')) {
      throw new Error(
        `Firebase error: ${error.message}\n` +
        'Please verify your Firebase configuration in .env file and that all required fields are set.'
      );
    }
    
    throw error;
  }
}

/**
 * Alternative function to populate with custom challenge data
 * Useful if you want to add challenges programmatically
 * 
 * @param {Object} challengeData - Challenge data object
 */
export async function addChallenge(challengeData) {
  try {
    const challengesCollection = collection(db, 'challenges');
    const challengeRef = doc(challengesCollection);
    
    const data = {
      ...challengeData,
      createdAt: new Date().toISOString(),
      isFixed: true
    };
    
    await setDoc(challengeRef, data);
    console.log(`✓ Added challenge: ${challengeData.name} (ID: ${challengeRef.id})`);
    
    return { success: true, id: challengeRef.id };
  } catch (error) {
    console.error('Error adding challenge:', error);
    throw error;
  }
}

// Export the fixed challenges for reference
export { FIXED_CHALLENGES };

// If running as a standalone script
if (typeof window === 'undefined' && require.main === module) {
  // This would run in Node.js environment
  // For React app, you'll call populateChallenges() from your app
  console.log('This script should be run from your React app, not as a standalone Node script.');
  console.log('Import populateChallenges and call it from your app.');
}

