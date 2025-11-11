# Quick Fix for "Client is Offline" Error

## Immediate Steps

### 1. Check Your .env File

Open `boggle-app/.env` and verify it has ALL of these with REAL values (not placeholders):

```env
REACT_APP_FIREBASE_API_KEY=AIza... (should start with AIza)
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id (no .firebaseapp.com)
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789 (numbers only)
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef (should have colons)
```

### 2. Restart Your React App

**This is critical!** Environment variables are only loaded when the app starts.

1. Stop your app: Press `Ctrl+C` in the terminal where it's running
2. Start it again: `npm start`
3. Wait for it to fully load
4. Try the populate button again

### 3. Verify Firestore is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database" in the left menu
4. If you see "Create database", click it and create one
5. Choose "Start in test mode"
6. Select a location (choose the closest to you)
7. Wait for it to be created

### 4. Check Security Rules

1. In Firestore Database, click on "Rules" tab
2. Make sure you have this (for development):
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
3. Click "Publish"

### 5. Check Browser Console

1. Open your app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for:
   - "Firebase initialized successfully" ✅
   - Any error messages ❌
5. Check what the Connection Status says in the Admin Panel

## Most Common Issue

**The #1 issue is not restarting the React app after creating/updating .env**

Solution: Stop and restart your React app!

## Still Not Working?

Check the Connection Status in the Admin Panel - it will tell you exactly what's wrong.

The error message will guide you to the specific issue:
- Configuration incomplete → Check .env file
- Permission denied → Check security rules  
- Offline → Check Firestore is enabled
- Network error → Check internet connection

