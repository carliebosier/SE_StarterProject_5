# Next Steps After Firestore Setup

## Step 1: Verify Firebase Configuration ✅

1. **Check your `.env` file** exists and has your Firebase credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

2. **Verify Firestore is enabled** in Firebase Console:
   - Go to Firebase Console > Firestore Database
   - Make sure database is created
   - Check that security rules are set (can be open for now)

## Step 2: Populate Firestore with Challenges 🎯

### Option A: Using the Admin Panel (Easiest)

1. **Start your React app**:
   ```bash
   cd boggle-app
   npm start
   ```

2. **Open the app** in your browser (http://localhost:3000)

3. **Click "Show Admin Panel (Firestore Setup)"** button at the top

4. **Click "Populate Challenges"** button

5. **Wait for the process to complete** - you should see:
   - "Calculating solutions for challenge: [name]..."
   - "Found X valid words"
   - "✓ Added challenge: [name]"

6. **Verify success message** showing how many challenges were added

### Option B: Using Browser Console

1. Open your React app in browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
   ```javascript
   import { populateChallenges } from './scripts/populateChallenges';
   await populateChallenges();
   ```

## Step 3: Verify Challenges in Firestore 🔍

1. **Go to Firebase Console**
2. **Navigate to Firestore Database**
3. **Check the `challenges` collection**
4. **Verify you see 7 challenge documents**:
   - easy-starter
   - classic-4x4
   - word-builder
   - mixed-challenge
   - quick-words
   - letter-mix
   - big-grid

5. **Click on a challenge document** to verify it has:
   - `name` (string)
   - `size` (number)
   - `grid` (array)
   - `solutions` (array)
   - `solutionCount` (number)
   - `createdAt` (string)
   - `isFixed` (boolean: true)

## Step 4: Update Security Rules 🔒

After populating challenges, update your Firestore rules to read-only:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /challenges/{challengeId} {
      allow read: if true;      // Anyone can read challenges
      allow write: if false;    // No one can write via client
    }
  }
}
```

This protects your challenges from being modified or deleted.

## Step 5: Test Reading from Firestore 🧪

Once challenges are populated, we'll update the app to read from Firestore. But first, let's verify everything is working:

1. Challenges should be in Firestore ✅
2. Security rules should be updated ✅
3. Firebase configuration should be correct ✅

## Step 6: Integrate Firestore into "Load Challenge" 🔄

Next, we'll update the `ChallengeList` component to:
1. Read challenges from Firestore instead of Django backend
2. Display Firestore challenges in the modal
3. Load challenges from Firestore when selected

## Troubleshooting

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Check your `.env` file has correct Firebase credentials
- Make sure `.env` file is in the `boggle-app` directory
- Restart your React app after changing `.env`

### Error: "Permission denied"
- Check Firestore security rules
- For initial setup, use open rules:
  ```javascript
  allow read, write: if true;
  ```

### Challenges not appearing
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Check that `challenges` collection exists
- Verify Firebase configuration is correct

### Solutions not calculated
- Check that `full-wordlist.json` is loaded
- Verify boggle solver is working
- Check browser console for errors

## What's Next?

After successfully populating Firestore:

1. ✅ **Update "Load Challenge" to read from Firestore**
2. ✅ **Add leaderboard functionality**
3. ✅ **Implement Google Sign-In**
4. ✅ **Deploy to Firebase Hosting**

Let me know when you've populated the challenges and we'll move on to integrating Firestore into the "Load Challenge" functionality!

