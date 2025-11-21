// Firebase configuration
// TODO: Replace with your Firebase project configuration
// You can find this in your Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => {
    const value = firebaseConfig[field];
    return !value || 
           value === undefined || 
           value === 'your-api-key' || 
           value === 'your-project.firebaseapp.com' ||
           value === 'your-project-id' ||
           value === 'your-project.appspot.com' ||
           value === '123456789' ||
           value === 'your-app-id' ||
           value.includes('your-');
  });
  
  if (missingFields.length > 0) {
    console.error('Firebase configuration is missing or incomplete.');
    console.error('Missing or invalid fields:', missingFields);
    console.error('Current config values:', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING'
    });
    console.error('Please check your .env file and make sure all Firebase environment variables are set with real values.');
    return false;
  }
  return true;
};

// Check if config is valid before initializing
if (!validateFirebaseConfig()) {
  console.warn('Firebase configuration is incomplete. Some features may not work.');
}

// Initialize Firebase
let app;
let db;
let auth;
let googleProvider;
let initializationError = null;

try {
  // Only initialize if we have valid config
  const hasValidConfig = validateFirebaseConfig();
  
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Enable network (in case it was disabled)
    enableNetwork(db).catch(err => {
      console.warn('Failed to enable network (this is okay if Firestore is not yet set up):', err);
    });
    
    console.log('Firebase initialized successfully');
  } else {
    console.error('Firebase configuration is incomplete. Please set up your .env file with Firebase credentials.');
    initializationError = new Error('Firebase configuration is incomplete');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  initializationError = error;
  // Don't throw here - let the app load and show error in UI
}

export { db, auth, googleProvider, initializationError };
export default app;

