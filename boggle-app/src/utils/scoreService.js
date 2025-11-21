/**
 * Score Service
 * Handles saving and retrieving scores from Firestore
 */

import { db } from '../firebase/config';
import { collection, doc, setDoc, query, where, getDocs, orderBy, limit, getDoc } from 'firebase/firestore';

/**
 * Save or update a user's score for a challenge
 * @param {string} userId - Firebase user ID
 * @param {string} challengeId - Challenge document ID
 * @param {number} score - Number of words found
 * @param {Object} userInfo - User display name and photo URL
 * @returns {Promise<void>}
 */
export async function saveScore(userId, challengeId, score, userInfo = {}) {
  if (!userId || !challengeId || score === undefined) {
    throw new Error('userId, challengeId, and score are required');
  }

  try {
    // Create a document ID that's a combination of userId and challengeId
    // This ensures one score per user per challenge (we'll update if better score)
    const scoreDocId = `${userId}_${challengeId}`;
    const scoresCollection = collection(db, 'scores');
    const scoreRef = doc(scoresCollection, scoreDocId);

    // Get existing score if any (use getDoc instead of query)
    const scoreDoc = await getDoc(scoreRef);
    const existingScore = scoreDoc.exists() ? scoreDoc.data() : null;

    // Only update if this score is higher than existing score
    // Also check that the user owns this score (security check)
    if (existingScore) {
      if (existingScore.userId !== userId) {
        throw new Error('Cannot update score: user does not own this score record');
      }
      if (existingScore.score >= score) {
        console.log(`Score ${score} is not higher than existing score ${existingScore.score}. Not updating.`);
        return { updated: false, reason: 'score_not_higher' };
      }
    }

    // Save/update the score
    const scoreData = {
      userId,
      challengeId,
      score,
      userName: userInfo.displayName || userInfo.email || 'Anonymous',
      userPhotoURL: userInfo.photoURL || null,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If existing score, merge to preserve createdAt
    if (existingScore && existingScore.createdAt) {
      scoreData.createdAt = existingScore.createdAt;
    } else {
      scoreData.createdAt = new Date().toISOString();
    }

    await setDoc(scoreRef, scoreData, { merge: true });
    console.log(`Score saved: ${score} words for challenge ${challengeId} by user ${userId}`);
    
    return { updated: true, scoreData };
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

/**
 * Get top scores for a specific challenge
 * @param {string} challengeId - Challenge document ID
 * @param {number} topN - Number of top scores to retrieve (default: 10)
 * @returns {Promise<Array>} Array of score documents sorted by score descending
 */
export async function getTopScoresForChallenge(challengeId, topN = 10) {
  if (!challengeId) {
    throw new Error('challengeId is required');
  }

  try {
    const scoresCollection = collection(db, 'scores');
    
    // Query with where and orderBy requires a composite index
    // If index doesn't exist, Firestore will throw an error with a link to create it
    const scoresQuery = query(
      scoresCollection,
      where('challengeId', '==', challengeId),
      orderBy('score', 'desc'),
      limit(topN)
    );

    const snapshot = await getDocs(scoresQuery);
    const scores = [];
    
    snapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return scores;
  } catch (error) {
    console.error('Error getting top scores:', error);
    
    // If the error is about missing index, provide helpful message with link
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      console.error('⚠️ Firestore composite index required!');
      console.error('📋 Error details:', error);
      if (error.message) {
        // The error message usually contains a URL to create the index
        const urlMatch = error.message.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          console.error('🔗 Create index here:', urlMatch[0]);
          throw new Error(`Firestore index required. Click here to create it: ${urlMatch[0]}`);
        }
      }
      throw new Error('Firestore composite index required. Check browser console for the index creation link.');
    }
    
    // For permission errors
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Check Firestore security rules allow reads for scores collection.');
    }
    
    // For other errors, throw with original message
    throw error;
  }
}

/**
 * Get a user's best score for a specific challenge
 * @param {string} userId - Firebase user ID
 * @param {string} challengeId - Challenge document ID
 * @returns {Promise<Object|null>} Score document or null if no score exists
 */
export async function getUserScoreForChallenge(userId, challengeId) {
  if (!userId || !challengeId) {
    throw new Error('userId and challengeId are required');
  }

  try {
    const scoreDocId = `${userId}_${challengeId}`;
    const scoresCollection = collection(db, 'scores');
    const scoreRef = doc(scoresCollection, scoreDocId);
    
    const scoreDoc = await getDoc(scoreRef);
    
    if (scoreDoc.exists()) {
      return {
        id: scoreDoc.id,
        ...scoreDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user score:', error);
    throw error;
  }
}

