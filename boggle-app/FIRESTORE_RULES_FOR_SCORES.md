# Firestore Security Rules for Scores Collection

## Current Issue

You're getting "Missing or insufficient permissions" when trying to save scores. This means your Firestore security rules need to be updated to allow authenticated users to write scores.

## Updated Security Rules

Go to **Firebase Console** → **Firestore Database** → **Rules** and replace your rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Challenges - anyone can read, only admins can write
    match /challenges/{challengeId} {
      allow read: if true;  // Anyone can read challenges
      allow write: if false; // No one can write via client (use Firebase Console or Admin SDK)
    }
    
    // Scores - anyone can read (for leaderboards), authenticated users can write their own
    match /scores/{scoreId} {
      allow read: if true;  // Anyone can read scores for leaderboards
      allow create: if request.auth != null;  // Any authenticated user can create scores
      allow update: if request.auth != null && 
                     request.auth.uid == resource.data.userId;  // Users can only update their own scores
      allow delete: if false;  // Prevent deletion
    }
  }
}
```

## What These Rules Do

1. **Challenges Collection**:
   - ✅ Anyone can read (needed for loading challenges)
   - ❌ No client-side writes (prevents accidental modifications)

2. **Scores Collection**:
   - ✅ Anyone can read (needed for leaderboards)
   - ✅ Authenticated users can create scores
   - ✅ Users can only update their own scores (if they beat their previous score)
   - ❌ No one can delete scores

## Steps to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`boggle-app-490f4`)
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the rules above
5. Click **Publish**
6. Rules take effect immediately

## Testing

After updating the rules:
1. Sign in with Google
2. Play a Firestore challenge
3. End the game
4. Check that the score saves without permission errors
5. Check the leaderboard loads (after creating the index)

