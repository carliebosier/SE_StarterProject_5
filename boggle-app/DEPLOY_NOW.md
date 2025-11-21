# Deploy Your App to Firebase - Quick Start

## Prerequisites Check

✅ You have a Firebase project (`boggle-app-490f4`)  
✅ Firebase services are set up (Firestore, Authentication)  
✅ Your React app is working locally  

## Deployment Steps

### 1. Login to Firebase

Open your terminal in the `boggle-app` directory and run:

```bash
npx firebase-tools login
```

This opens your browser. Sign in with the Google account you used to create the Firebase project.

### 2. Link Your Project

```bash
npx firebase-tools use boggle-app-490f4
```

(If you used a different project name, use that instead)

### 3. Build Your App

```bash
npm run build
```

This creates an optimized production build in the `build` folder. Wait for it to complete.

### 4. Deploy!

```bash
npx firebase-tools deploy --only hosting
```

Firebase will:
- Upload your build files
- Deploy to Firebase Hosting
- Give you a URL like: `https://boggle-app-490f4.web.app`

### 5. Visit Your App!

Open the URL in your browser to see your deployed app!

## Important: Environment Variables

⚠️ **Your `.env` file won't work in production!**

You need to set environment variables during the build. Before running `npm run build`, set them:

```bash
export REACT_APP_FIREBASE_API_KEY=your-actual-api-key
export REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
export REACT_APP_FIREBASE_PROJECT_ID=your-project-id
export REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
export REACT_APP_FIREBASE_APP_ID=your-app-id

npm run build
```

Or create a script (see below).

## Create a Deploy Script

I've added a `deploy` script to `package.json`. After the first setup, you can just run:

```bash
npm run deploy
```

But first, make sure your environment variables are set in the build!

## Troubleshooting

### "Command not found: firebase"
- Use `npx firebase-tools` instead of `firebase`

### Build fails
- Check all dependencies are installed: `npm install`
- Check for syntax errors
- Make sure environment variables are set correctly

### Deploy fails
- Make sure you're logged in: `npx firebase-tools login`
- Check that the project is linked: `npx firebase-tools use boggle-app-490f4`
- Verify `build` folder exists: `ls build`

### App doesn't load after deployment
- Check Firebase Console → Hosting for deployment status
- Verify environment variables are set in the build
- Check browser console for errors

## What Gets Deployed?

- ✅ Your React app (built)
- ✅ All static assets
- ✅ Single-page app routing (configured in firebase.json)

## What Doesn't Get Deployed?

- ❌ `.env` file (need to set env vars during build)
- ❌ `node_modules` (not needed in production)
- ❌ Source files (only built files are deployed)

## Next Steps After Deployment

1. Test your deployed app
2. Verify Firebase features work (sign-in, leaderboard, etc.)
3. Share your app URL with others!
4. Optional: Set up a custom domain

