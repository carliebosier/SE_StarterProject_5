import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collections
const CHALLENGES_COLLECTION = 'challenges';
const LEADERBOARD_COLLECTION = 'leaderboard';
const SCORES_COLLECTION = 'scores';

/**
 * Get all challenges from Firestore
 */
export async function getChallenges() {
  try {
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const querySnapshot = await getDocs(challengesRef);
    const challenges = [];
    
    querySnapshot.forEach((doc) => {
      challenges.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return challenges;
  } catch (error) {
    console.error('Error getting challenges:', error);
    throw error;
  }
}

/**
 * Get a specific challenge by ID
 */
export async function getChallenge(challengeId) {
  try {
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const challengeSnap = await getDoc(challengeRef);
    
    if (challengeSnap.exists()) {
      return {
        id: challengeSnap.id,
        ...challengeSnap.data()
      };
    } else {
      throw new Error('Challenge not found');
    }
  } catch (error) {
    console.error('Error getting challenge:', error);
    throw error;
  }
}

/**
 * Get high score for a challenge
 */
export async function getChallengeHighScore(challengeId) {
  try {
    // Check leaderboard collection first (most up-to-date)
    const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);
    const leaderboardQuery = query(
      leaderboardRef,
      orderBy('score', 'desc')
    );
    
    const leaderboardSnapshot = await getDocs(leaderboardQuery);
    let highScore = 0;
    let highScoreData = null;
    
    leaderboardSnapshot.forEach((doc) => {
      const scoreData = doc.data();
      if (scoreData.challengeId === challengeId && scoreData.score > highScore) {
        highScore = scoreData.score;
        highScoreData = scoreData;
      }
    });
    
    // If no score found in leaderboard, check scores collection
    if (highScore === 0) {
      const scoresRef = collection(db, SCORES_COLLECTION);
      const scoresQuery = query(
        scoresRef,
        orderBy('score', 'desc')
      );
      
      const scoresSnapshot = await getDocs(scoresQuery);
      scoresSnapshot.forEach((doc) => {
        const scoreData = doc.data();
        if (scoreData.challengeId === challengeId && scoreData.score > highScore) {
          highScore = scoreData.score;
          highScoreData = scoreData;
        }
      });
    }
    
    return { highScore, highScoreData };
  } catch (error) {
    console.error('Error getting high score:', error);
    // If query fails (e.g., index not created), return 0
    return { highScore: 0, highScoreData: null };
  }
}

/**
 * Get high scores for all challenges
 */
export async function getAllChallengeHighScores() {
  try {
    const challenges = await getChallenges();
    const highScores = {};
    
    for (const challenge of challenges) {
      const { highScore } = await getChallengeHighScore(challenge.id);
      highScores[challenge.id] = highScore;
    }
    
    return highScores;
  } catch (error) {
    console.error('Error getting all high scores:', error);
    return {};
  }
}

/**
 * Submit a score to the leaderboard
 */
export async function submitScore(userId, userName, userEmail, challengeId, challengeName, score, wordsFound, totalTime) {
  try {
    const scoreData = {
      userId,
      userName,
      userEmail,
      challengeId,
      challengeName,
      score,
      wordsFound,
      totalTime,
      timestamp: serverTimestamp(),
      date: new Date().toISOString()
    };
    
    // Add to scores collection
    await addDoc(collection(db, SCORES_COLLECTION), scoreData);
    
    // Also add/update in leaderboard collection (for easy querying)
    const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, `${userId}_${challengeId}`);
    const existingDoc = await getDoc(leaderboardRef);
    
    if (existingDoc.exists()) {
      const existingData = existingDoc.data();
      // Only update if this is a higher score
      if (score > existingData.score) {
        await updateDoc(leaderboardRef, {
          ...scoreData,
          updatedAt: serverTimestamp()
        });
      }
    } else {
      await setDoc(leaderboardRef, scoreData);
    }
    
    return scoreData;
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

/**
 * Get leaderboard for a specific challenge
 */
export async function getChallengeLeaderboard(challengeId, limitCount = 10) {
  try {
    const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);
    const q = query(
      leaderboardRef,
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.challengeId === challengeId) {
        leaderboard.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Create a challenge (for manual population)
 */
export async function createChallenge(name, grid, foundwords, size, description = '') {
  try {
    const challengeData = {
      name,
      grid: JSON.stringify(grid),
      foundwords: JSON.stringify(foundwords),
      size,
      description,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), challengeData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
}

