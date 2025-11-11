/**
 * Utility to test Firebase connection
 * Use this to verify your Firebase configuration is correct
 */

import { db } from '../firebase/config';
import { collection, getDocs, enableNetwork } from 'firebase/firestore';

/**
 * Test Firestore connection
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testFirestoreConnection() {
  try {
    // Check if db is available
    if (!db) {
      return {
        success: false,
        message: '❌ Firestore database is not initialized.\n\n' +
                 'This usually means:\n' +
                 '1. Your .env file is missing or incomplete\n' +
                 '2. You haven\'t restarted your React app after creating .env\n' +
                 '3. Firebase configuration values are incorrect\n\n' +
                 'Please check the browser console for detailed error messages.'
      };
    }
    
    // Try to enable network
    try {
      await enableNetwork(db);
    } catch (enableError) {
      // This is okay - network might already be enabled or there might be a connection issue
      console.warn('Could not explicitly enable network:', enableError.message);
    }
    
    // Try to read from challenges collection (this will fail if offline or not configured)
    const testCollection = collection(db, 'challenges');
    const snapshot = await getDocs(testCollection);
    
    return {
      success: true,
      message: `✅ Firestore connection successful! Found ${snapshot.size} document(s) in challenges collection.`
    };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    
    let message = '❌ Firestore connection failed.\n\n';
    
    if (error.code === 'unavailable' || error.message.includes('offline') || error.message.includes('Failed to get document')) {
      message += 'Firestore appears to be offline or unavailable.\n\n';
      message += 'Please check:\n';
      message += '1. Your .env file has all Firebase credentials (REACT_APP_FIREBASE_*)\n';
      message += '2. You have restarted your React app after creating/updating .env\n';
      message += '3. Firestore is enabled in Firebase Console\n';
      message += '4. Your internet connection is working\n';
      message += '5. Firestore security rules allow reads (use test mode for now)';
    } else if (error.code === 'permission-denied') {
      message += 'Permission denied.\n\n';
      message += 'Please check Firestore security rules allow reads.';
    } else if (error.message && error.message.includes('Firebase')) {
      message += `Firebase configuration error:\n${error.message}`;
    } else if (error.message) {
      message += error.message;
    } else {
      message += 'Unknown error. Check browser console for details.';
    }
    
    return {
      success: false,
      message: message
    };
  }
}

/**
 * Verify Firebase configuration
 * @returns {boolean}
 */
export function verifyFirebaseConfig() {
  const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
  
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field] || config[field].includes('your-'));
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
}

