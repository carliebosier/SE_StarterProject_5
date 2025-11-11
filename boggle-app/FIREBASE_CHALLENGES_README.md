# Firestore Challenge Population Feature

This feature allows you to manually populate Firestore with a set of fixed challenge grids.

## What Was Created

### 1. Firebase Configuration (`src/firebase/config.js`)
- Firebase app initialization
- Firestore database connection
- Environment variable support for configuration

### 2. Population Script (`src/scripts/populateChallenges.js`)
- Main function: `populateChallenges(dictionary, overwrite)`
- Predefined fixed challenge grids (7 challenges of various sizes)
- Automatic solution calculation using the boggle solver
- Handles duplicate challenges (skips if exists, or overwrites if specified)

### 3. React Component (`src/components/PopulateChallengesButton.js`)
- UI component to trigger population
- Shows loading state and results
- Supports overwrite mode

### 4. Documentation
- `FIREBASE_SETUP.md` - Complete setup guide
- This README - Quick reference

## Fixed Challenges Included

1. **Easy Starter** (3x3) - Simple grid for beginners
2. **Classic 4x4** - Traditional Boggle-style grid
3. **Word Builder** (4x4) - Grid with many word-building opportunities
4. **Mixed Challenge** (5x5) - Larger grid with mixed letters
5. **Quick Words** (3x3) - Simple common words
6. **Letter Mix** (4x4) - Mixed letter combinations
7. **Big Grid** (6x6) - Large challenge grid

## Quick Start

### 1. Set Up Firebase
Follow the instructions in `FIREBASE_SETUP.md` to:
- Create a Firebase project
- Get your Firebase configuration
- Set up environment variables
- Configure Firestore security rules

### 2. Populate Challenges

#### Option A: Using the React Component
```javascript
import PopulateChallengesButton from './components/PopulateChallengesButton';

// In your component
<PopulateChallengesButton />
```

#### Option B: Using the Script Directly
```javascript
import { populateChallenges } from './scripts/populateChallenges';

// Populate without overwriting existing challenges
await populateChallenges();

// Or overwrite existing challenges
await populateChallenges(null, true);
```

### 3. Verify in Firestore
- Go to Firebase Console > Firestore Database
- Check the `challenges` collection
- Verify that all challenges are present with their solutions

## Challenge Data Structure

Each challenge document in Firestore has:
- `name` (string): Challenge display name
- `size` (number): Grid size (e.g., 3, 4, 5, 6)
- `grid` (array): 2D array of letters
- `solutions` (array): All valid words found on the board
- `solutionCount` (number): Number of solutions (for quick reference)
- `createdAt` (string): ISO date string
- `isFixed` (boolean): true (indicates this is a fixed challenge)

## Adding New Challenges

To add more fixed challenges, edit `src/scripts/populateChallenges.js`:

```javascript
const FIXED_CHALLENGES = [
  // ... existing challenges
  {
    name: "My New Challenge",
    size: 4,
    grid: [
      ['L', 'E', 'T', 'T'],
      ['E', 'R', 'S', 'O'],
      ['T', 'S', 'O', 'N'],
      ['T', 'O', 'N', 'E']
    ],
    solutions: [] // Will be calculated automatically
  }
];
```

Then run the population script again.

## Next Steps

After populating Firestore with challenges, you can:
1. Update your app to read challenges from Firestore
2. Implement the "Load Challenge" functionality using Firestore
3. Add leaderboard functionality
4. Implement user authentication
5. Deploy to Firebase Hosting

## Troubleshooting

### Challenges not appearing in Firestore
- Check Firebase configuration in `.env`
- Verify Firestore security rules allow writes
- Check browser console for errors
- Ensure Firebase project is correctly set up

### Solutions not calculated
- Verify `full-wordlist.json` is loaded correctly
- Check that boggle solver is working
- Verify grid format is correct (2D array of strings)

### Permission errors
- Check Firestore security rules
- Ensure you're authenticated (if using production rules)
- For development, use test mode rules

## Notes

- Document IDs are generated from challenge names (sanitized)
- Solutions are calculated automatically using the boggle solver
- The script checks for existing challenges before adding new ones
- Use `overwrite: true` to update existing challenges

