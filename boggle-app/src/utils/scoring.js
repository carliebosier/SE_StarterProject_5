/**
 * Calculate Boggle score based on word length
 * Standard Boggle scoring:
 * - 3-4 letters: 1 point
 * - 5 letters: 2 points
 * - 6 letters: 3 points
 * - 7 letters: 5 points
 * - 8+ letters: 11 points
 */
export function calculateWordScore(word) {
  const length = word.length;
  if (length < 3) return 0;
  if (length <= 4) return 1;
  if (length === 5) return 2;
  if (length === 6) return 3;
  if (length === 7) return 5;
  return 11; // 8+ letters
}

/**
 * Calculate total score from an array of words
 */
export function calculateTotalScore(words) {
  return words.reduce((total, word) => total + calculateWordScore(word), 0);
}

/**
 * Get score breakdown by word length
 */
export function getScoreBreakdown(words) {
  const breakdown = {
    3: { count: 0, points: 0 },
    4: { count: 0, points: 0 },
    5: { count: 0, points: 0 },
    6: { count: 0, points: 0 },
    7: { count: 0, points: 0 },
    8: { count: 0, points: 0 }
  };
  
  words.forEach(word => {
    const length = word.length;
    const score = calculateWordScore(word);
    
    if (length >= 8) {
      breakdown[8].count++;
      breakdown[8].points += score;
    } else if (breakdown[length]) {
      breakdown[length].count++;
      breakdown[length].points += score;
    }
  });
  
  return breakdown;
}

