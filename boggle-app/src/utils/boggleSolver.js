// Simple Boggle solver using prefix sets, adapted from the provided Python logic

function buildPrefixIndex(dictionary) {
  const words = new Set();
  const prefixes = new Set();
  for (const raw of dictionary) {
    const word = (raw || '').toLowerCase();
    if (!word) continue;
    words.add(word);
    for (let i = 1; i <= word.length; i++) {
      prefixes.add(word.slice(0, i));
    }
  }
  return { words, prefixes };
}

function isGridValid(grid) {
  if (!Array.isArray(grid) || grid.length === 0) return false;
  const n = grid.length;
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) return false;
    for (const cell of row) {
      if (typeof cell !== 'string' || !/^[a-zA-Z]+$/.test(cell)) return false;
    }
  }
  return true;
}

function toLowerGrid(grid) {
  return grid.map(row => row.map(ch => ch.toLowerCase()));
}

export function solveBoggle(grid, dictionary) {
  // Accept either an array of words or an object with { words: [] }
  const dictArray = Array.isArray(dictionary)
    ? dictionary
    : (dictionary && Array.isArray(dictionary.words) ? dictionary.words : []);
  if (!grid || !dictionary) return [];
  if (!isGridValid(grid)) return [];

  const loweredGrid = toLowerGrid(grid);
  const n = loweredGrid.length;
  const { words, prefixes } = buildPrefixIndex(dictArray);
  const results = new Set();

  function dfs(y, x, visited, current) {
    if (y < 0 || x < 0 || y >= n || x >= n) return;
    if (visited[y][x]) return;

    const nextWord = current + loweredGrid[y][x];
    if (!prefixes.has(nextWord)) return;

    visited[y][x] = true;
    if (nextWord.length >= 3 && words.has(nextWord)) {
      results.add(nextWord);
    }
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        dfs(y + dy, x + dx, visited, nextWord);
      }
    }
    visited[y][x] = false;
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const visited = Array.from({ length: n }, () => Array(n).fill(false));
      dfs(y, x, visited, '');
    }
  }

  return Array.from(results).sort();
}

export function generateBoard(size) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const board = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      // Small chance to place 'Qu' to mimic Boggle dice
      if (Math.random() < 0.06) {
        row.push('Qu');
      } else {
        const ch = alphabet[Math.floor(Math.random() * alphabet.length)];
        row.push(ch);
      }
    }
    board.push(row);
  }
  return board;
}


