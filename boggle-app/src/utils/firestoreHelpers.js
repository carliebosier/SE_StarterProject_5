/**
 * Helper functions for working with Firestore data
 * These functions handle the conversion between Firestore format and app format
 */

/**
 * Convert a flattened grid array back to a 2D array
 * @param {Array<string>} flattenedGrid - 1D array of letters
 * @param {number} size - Size of the grid (e.g., 3 for 3x3, 4 for 4x4)
 * @returns {Array<Array<string>>} 2D array representing the Boggle board
 */
export function unflattenGrid(flattenedGrid, size) {
  if (!Array.isArray(flattenedGrid) || !size || size <= 0) {
    throw new Error('Invalid grid data: flattenedGrid must be an array and size must be a positive number');
  }
  
  const grid = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      if (index < flattenedGrid.length) {
        row.push(flattenedGrid[index]);
      } else {
        throw new Error(`Grid data is incomplete. Expected ${size * size} elements, but got ${flattenedGrid.length}`);
      }
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Flatten a 2D grid array to a 1D array for Firestore storage
 * @param {Array<Array<string>>} grid - 2D array representing the Boggle board
 * @returns {Array<string>} 1D array of letters
 */
export function flattenGrid(grid) {
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error('Invalid grid: must be a non-empty 2D array');
  }
  
  return grid.flat();
}

/**
 * Convert a Firestore challenge document to app format
 * @param {Object} firestoreDoc - Firestore document data
 * @returns {Object} Challenge data in app format with 2D grid
 */
export function convertFirestoreChallengeToApp(firestoreDoc) {
  if (!firestoreDoc) {
    throw new Error('Invalid Firestore document');
  }
  
  const { grid: flattenedGrid, size, ...rest } = firestoreDoc;
  
  // Convert flattened grid to 2D array
  const grid = unflattenGrid(flattenedGrid, size);
  
  return {
    ...rest,
    size,
    grid
  };
}

/**
 * Convert app format challenge to Firestore format
 * @param {Object} challenge - Challenge data in app format with 2D grid
 * @returns {Object} Challenge data in Firestore format with flattened grid
 */
export function convertAppChallengeToFirestore(challenge) {
  if (!challenge || !challenge.grid) {
    throw new Error('Invalid challenge: must have a grid');
  }
  
  const { grid, ...rest } = challenge;
  
  // Convert 2D grid to flattened array
  const flattenedGrid = flattenGrid(grid);
  
  return {
    ...rest,
    grid: flattenedGrid
  };
}

