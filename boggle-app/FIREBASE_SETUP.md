# Firebase Setup Guide

This guide will help you set up Firebase and populate Firestore with fixed challenge grids.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Enable Firestore Database:
   - Go to Firestore Database in the left menu
   - Click "Create database"
   - Start in test mode (for development) or production mode
   - Choose a location for your database

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on the Web icon (</>)
4. Register your app with a nickname (e.g., "Boggle App")
5. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key-here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

## Step 4: Set Up Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and set up appropriate rules:

### ⚠️ Important Security Note

The warning "Your security rules are defined as public, so anyone can steal, modify, or delete data in your database" means your rules allow **anyone on the internet** to read and write to your database. This is **ONLY acceptable for initial development/testing** and should **NEVER be used in production**.

### Development Rules (Temporary - Use Only for Testing)

**Option 1: Completely Open (Easiest for Initial Setup)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
⚠️ **WARNING**: This allows anyone to read/write/delete everything. Only use this while:
- You're just testing and populating challenges
- Your database doesn't contain sensitive data
- You're working locally and haven't deployed yet
- You will change these rules before going to production

**Option 2: Read-Only for Challenges (Safer Development Rule)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Challenges - anyone can read, but only you can write (via Firebase Console or Admin SDK)
    match /challenges/{challengeId} {
      allow read: if true;  // Anyone can read challenges
      allow write: if false; // No one can write via client (use Firebase Console to populate)
    }
  }
}
```
✅ **Better**: This allows anyone to read challenges (which you want), but prevents client-side writes. You'll populate challenges using the Firebase Console or a one-time script.

**Option 3: Time-Limited Development Rule**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Only allow access for 30 days from now (change the timestamp!)
      allow read, write: if request.time < timestamp.date(2024, 12, 11);
    }
  }
}
```
⚠️ This automatically expires after a set date, forcing you to update the rules.

### Production Rules (Use Once Authentication is Set Up)

**Recommended Production Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Challenges - anyone can read, only authenticated admins can write
    match /challenges/{challengeId} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;  // Only admins
    }
    
    // User scores - users can read all, write only their own
    match /scores/{userId} {
      allow read: if true;  // Anyone can read scores (for leaderboard)
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;  // Prevent deletion
    }
    
    // User profiles - users can read/write their own
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### When to Use Which Rules

1. **Initial Setup (Now)**: Use Option 1 (completely open) or Option 2 (read-only) just to populate challenges and test
2. **During Development**: Once you add authentication, switch to Option 2 or start using production-like rules
3. **Before Deploying**: **MUST** switch to production rules
4. **In Production**: Always use production rules with proper authentication

### Current Recommendation for Your Setup

Since you're just starting and need to populate challenges:
1. Use **Option 1** (completely open) temporarily to populate challenges
2. After populating, switch to **Option 2** (read-only for challenges) for development
3. Once you add Google Sign-In, implement the production rules
4. **Before deploying to production**, make sure you have proper authentication and production rules

## Step 5: Populate Firestore with Challenges

### Option 1: Using the React Component

1. Import and use the `PopulateChallengesButton` component in your app:
   ```javascript
   import PopulateChallengesButton from './components/PopulateChallengesButton';
   
   // In your component
   <PopulateChallengesButton />
   ```

2. Click the "Populate Challenges" button to add challenges to Firestore

### Option 2: Using the Script Directly

1. Import the function in your app:
   ```javascript
   import { populateChallenges } from './scripts/populateChallenges';
   ```

2. Call it from your app (e.g., in a useEffect or button click):
   ```javascript
   // Populate without overwriting existing challenges
   await populateChallenges();
   
   // Or overwrite existing challenges
   await populateChallenges(null, true);
   ```

### Option 3: Using Firebase Console

You can also manually add challenges through the Firebase Console:
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `challenges`
4. Add documents with the following fields:
   - `name` (string): Challenge name
   - `size` (number): Grid size
   - `grid` (array): 2D array of letters
   - `solutions` (array): Array of valid words
   - `createdAt` (string): ISO date string
   - `isFixed` (boolean): true
   - `solutionCount` (number): Number of solutions

## Step 6: Verify Challenges in Firestore

1. Go to Firestore Database in Firebase Console
2. You should see a `challenges` collection
3. Each document should have the challenge data
4. Verify that solutions are calculated correctly

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Check that your API key is correct in `.env`
- Make sure you've copied the `.env.example` to `.env`
- Restart your React app after changing `.env`

### Error: "Permission denied"
- Check your Firestore security rules
- For development, you can use test mode (allow all reads/writes)
- Make sure you're authenticated if using production rules

### Challenges not appearing
- Check the browser console for errors
- Verify that Firestore is enabled in your Firebase project
- Check that the `challenges` collection exists in Firestore
- Verify your Firebase configuration is correct

### Solutions not calculated
- Make sure `full-wordlist.json` is loaded correctly
- Check that the boggle solver is working correctly
- Verify that the grid format is correct (2D array of strings)

## Next Steps

After populating Firestore with challenges, you can:
1. Update your app to read challenges from Firestore instead of the Django backend
2. Implement the "Load Challenge" functionality using Firestore
3. Add leaderboard functionality
4. Implement user authentication with Google Sign-In
5. Deploy to Firebase Hosting

