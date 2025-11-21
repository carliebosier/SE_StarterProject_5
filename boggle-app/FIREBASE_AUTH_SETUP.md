# Firebase Authentication Setup Guide

## Enable Google Sign-In in Firebase

### Step 1: Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** in the left menu
4. Click **Get Started** (if you haven't enabled it yet)

### Step 2: Enable Google Sign-In Provider

1. In the Authentication page, click on the **Sign-in method** tab
2. Click on **Google** from the list of providers
3. Toggle **Enable** to ON
4. Enter your project support email (or leave default)
5. Click **Save**

### Step 3: Configure OAuth Consent Screen (if required)

If you see any OAuth consent screen errors:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Complete the required fields:
   - User Type: External (for testing)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
5. Click **Save and Continue**
6. Add scopes if needed (default should work)
7. Add test users if in testing mode

### Step 4: Add Authorized Domains (if deploying)

1. In Firebase Console > Authentication > Settings
2. Scroll to **Authorized domains**
3. Add your deployment domain (e.g., `your-app.web.app`)
4. `localhost` should already be authorized for development

## Firestore Security Rules for Scores

Update your Firestore security rules to allow score reads and writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Challenges - anyone can read, only admins can write
    match /challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Scores - anyone can read (for leaderboards), authenticated users can write their own
    match /scores/{scoreId} {
      allow read: if true;  // Anyone can read scores for leaderboards
      allow create: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow delete: if false;  // Prevent deletion
    }
  }
}
```

## Testing Google Sign-In

1. Start your React app: `npm start`
2. Click the "Sign in with Google" button in the top right
3. Select your Google account
4. You should see your name and photo in the top right
5. Play a Firestore challenge and check that scores are saved
6. View the leaderboard after ending a game

## Troubleshooting

### Error: "auth/unauthorized-domain"
- Make sure your domain is authorized in Firebase Console
- For local development, `localhost` should work automatically
- Check Firebase Console > Authentication > Settings > Authorized domains

### Error: "auth/popup-closed-by-user"
- User closed the sign-in popup - this is normal
- Just try again

### Scores not saving
- Make sure user is signed in
- Check Firestore security rules allow writes
- Check browser console for errors
- Verify challengeId is set when playing a Firestore challenge

### Leaderboard not showing
- Make sure you're playing a Firestore challenge (not a saved game)
- Check that scores collection exists in Firestore
- Verify Firestore security rules allow reads

