# Firebase Setup Guide

This guide will help you set up Firebase for the Boggle game application.

## Prerequisites

1. A Google account
2. Node.js installed on your machine
3. Firebase CLI installed (we'll install this)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "boggle-game")
4. Follow the setup wizard:
   - Disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Google** as a sign-in provider:
   - Click on Google
   - Toggle "Enable"
   - Enter a support email
   - Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (we'll update rules later)
3. Select a location for your database
4. Click "Enable"

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Boggle App")
5. Copy the Firebase configuration object

## Step 5: Configure Your App

1. Create a `.env` file in the `boggle-app` directory:
   ```bash
   cd boggle-app
   touch .env
   ```

2. Add your Firebase configuration to `.env`:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

3. Update `src/firebase/config.js` - the environment variables will be automatically used, or you can manually replace the placeholder values.

## Step 6: Set Up Firestore Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace the rules with the content from `firestore.rules` file
3. Click "Publish"

## Step 7: Create Firestore Indexes

1. In Firebase Console, go to **Firestore Database** > **Indexes**
2. Click "Create Index"
3. The indexes are defined in `firestore.indexes.json`
4. Firebase will automatically create them when you first query, or you can deploy them manually

## Step 8: Populate Challenges

### Option 1: Using Browser Console (Recommended)

1. Start your app: `npm start`
2. Open the app in your browser
3. Open browser console (F12)
4. Go to the Console tab
5. Import and run the populate script:

```javascript
// In browser console
import { populateChallenges } from './scripts/populateChallengesBrowser.js';
populateChallenges();
```

Or create a temporary admin component in your app to run this.

### Option 2: Using Node.js Script

1. Download your service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save it as `serviceAccountKey.json` in the `boggle-app` directory
   - **Important**: Add `serviceAccountKey.json` to `.gitignore`

2. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

3. Run the populate script:
   ```bash
   node scripts/populateChallenges.js
   ```

## Step 9: Deploy to Firebase Hosting

1. Install Firebase CLI globally (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   cd boggle-app
   firebase init
   ```
   - Select **Hosting** and **Firestore**
   - Select your Firebase project
   - Set public directory to `build`
   - Configure as a single-page app: **Yes**
   - Set up automatic builds: **No** (or Yes if using CI/CD)

4. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

5. Build your app:
   ```bash
   npm run build
   ```

6. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

Your app will be available at `https://your-project-id.web.app`

## Troubleshooting

### Authentication not working
- Make sure Google sign-in is enabled in Firebase Console
- Check that your API keys are correct in `.env`
- Verify the authorized domains in Firebase Console > Authentication > Settings > Authorized domains

### Firestore queries failing
- Make sure Firestore indexes are created (check the console for link to create them)
- Verify Firestore rules are published
- Check that your data structure matches the expected format

### Challenges not loading
- Verify challenges are populated in Firestore
- Check browser console for errors
- Ensure Firestore rules allow reading challenges

### Scores not submitting
- Make sure user is signed in
- Check Firestore rules allow writing to scores/leaderboard collections
- Verify the user ID matches in the score data

## Security Notes

- Never commit `.env` file or `serviceAccountKey.json` to git
- Add them to `.gitignore`
- Use environment variables for sensitive data
- Regularly review and update Firestore security rules

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

