# Quick Deployment Steps

## Step 1: Login to Firebase

```bash
cd boggle-app
npx firebase-tools login
```

This will open a browser for you to sign in with your Google account.

## Step 2: Initialize Firebase Hosting

```bash
npx firebase-tools init hosting
```

**When prompted:**
1. **Select a default Firebase project**: Choose `boggle-app-490f4` (use arrow keys, press Enter)
2. **What do you want to use as your public directory?**: Type `build` and press Enter
3. **Configure as a single-page app (rewrite all urls to /index.html)?**: Type `Yes` (Y) and press Enter
4. **Set up automatic builds and deploys with GitHub?**: Type `No` (N) and press Enter
5. **File build/index.html already exists. Overwrite?**: Type `No` (N) and press Enter

## Step 3: Build Your React App

```bash
npm run build
```

Wait for the build to complete. This creates an optimized production build.

## Step 4: Deploy to Firebase

```bash
npx firebase-tools deploy --only hosting
```

This will deploy your app to Firebase Hosting.

## Step 5: Access Your App

After deployment, Firebase will display your app URL, something like:
```
https://boggle-app-490f4.web.app
```

Visit this URL to see your deployed app!

## Important Notes

### Environment Variables in Production

Your `.env` file won't work in production. For Firebase Hosting, you have a few options:

**Option A: Set environment variables during build (Recommended)**
```bash
REACT_APP_FIREBASE_API_KEY=your-key \
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain \
REACT_APP_FIREBASE_PROJECT_ID=your-project-id \
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket \
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id \
REACT_APP_FIREBASE_APP_ID=your-app-id \
npm run build
```

**Option B: Create a production build script**

Or you can add a script to package.json (see below).

### Future Deployments

After the first deployment, you can deploy anytime with:
```bash
npm run build && npx firebase-tools deploy --only hosting
```

Or create a deploy script (see package.json updates below).

