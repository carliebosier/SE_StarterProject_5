# Firebase Deployment Guide

## Prerequisites

1. ✅ Firebase project created (you already have `boggle-app-490f4`)
2. ✅ Firebase services configured (Firestore, Authentication)
3. ✅ React app ready to deploy

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Or if you prefer using npx (no global install needed):
```bash
npx firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to sign in with your Google account (same account you used to create the Firebase project).

## Step 3: Initialize Firebase Hosting

Navigate to your `boggle-app` directory and run:

```bash
cd boggle-app
firebase init hosting
```

**When prompted:**
1. **Select Firebase project**: Choose `boggle-app-490f4` (or your project name)
2. **What do you want to use as your public directory?**: Type `build`
3. **Configure as a single-page app?**: Type `Yes`
4. **Set up automatic builds and deploys with GitHub?**: Type `No` (for now)
5. **File build/index.html already exists. Overwrite?**: Type `No`

## Step 4: Build Your React App

Before deploying, you need to build your React app:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Step 5: Deploy to Firebase

```bash
firebase deploy --only hosting
```

## Step 6: Access Your Deployed App

After deployment, Firebase will give you a URL like:
```
https://boggle-app-490f4.web.app
```
or
```
https://boggle-app-490f4.firebaseapp.com
```

## Important: Update Environment Variables

For production deployment, you have two options:

### Option A: Use Firebase Hosting Environment Variables (Recommended)

Firebase Hosting doesn't support `.env` files directly, but you can:
1. Build with environment variables at build time
2. Use Firebase Functions (more complex)
3. Or configure the values during build

### Option B: Update firebase.json to Include Rewrites

Make sure your `firebase.json` has proper rewrites for React Router (if you add routing later).

## Troubleshooting

### Build Fails
- Check that all dependencies are installed: `npm install`
- Check for any syntax errors in your code
- Try deleting `node_modules` and `package-lock.json`, then `npm install` again

### Deploy Fails
- Make sure you're logged in: `firebase login`
- Check that you selected the correct Firebase project
- Verify `firebase.json` exists and is configured correctly

### App Doesn't Load After Deployment
- Check Firebase Hosting console for deployment status
- Verify the build folder was created: `ls build`
- Check browser console for errors
- Verify environment variables are set correctly

## Quick Deploy Command

Once set up, you can deploy anytime with:
```bash
npm run build && firebase deploy --only hosting
```

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to add your domain

