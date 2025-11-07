/**
 * Browser-based script to populate Firestore with challenge grids
 * 
 * Usage:
 * 1. Make sure Firebase is configured in src/firebase/config.js
 * 2. Open your app in the browser
 * 3. Open browser console (F12)
 * 4. Copy and paste this script, or import it in your app
 * 
 * This script creates fixed challenge grids that users can play
 */

import { createChallenge } from '../src/firebase/firestoreService';

// Pre-defined challenge grids
const challenges = [
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

export async function populateChallenges() {
  try {
    console.log('Starting to populate challenges...');
    
    for (const challenge of challenges) {
      try {
        const challengeId = await createChallenge(
          challenge.name,
          challenge.grid,
          challenge.foundwords,
          challenge.size,
          challenge.description
        );
        console.log(`✓ Added challenge "${challenge.name}" with ID: ${challengeId}`);
      } catch (error) {
        console.error(`Error adding challenge "${challenge.name}":`, error);
      }
    }
    
    console.log('✓ All challenges populated successfully!');
    return true;
  } catch (error) {
    console.error('Error populating challenges:', error);
    return false;
  }
}

// For use in browser console
if (typeof window !== 'undefined') {
  window.populateChallenges = populateChallenges;
}

