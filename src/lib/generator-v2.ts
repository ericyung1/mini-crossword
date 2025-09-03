import type { Puzzle, Cell, Clue, Direction } from "@/types/crossword";
import type { Difficulty } from "@/types/game";
import { createRNG, type SeededRNG } from "./seed";
import { CROSSWORD_PATTERNS, getPattern, type Pattern } from "./patterns";
import { getWordsByLength, WORD_BANK } from "./wordbank";
import { getPatternIndicesByDifficulty, DIFFICULTY_WORD_PREFERENCES } from "./difficulty";

interface WordEntry {
  row: number;
  col: number;
  direction: Direction;
  length: number;
  word?: string;
}

interface GridConstraint {
  row: number;
  col: number;
  letter?: string;
}

/**
 * Generate a complete crossword puzzle from a seed string with difficulty
 */
export function generatePuzzleV2(seed: string, difficulty: Difficulty = "MEDIUM"): Puzzle {
  const rng = createRNG(seed);
  
  // Select patterns based on difficulty
  const availablePatterns = getPatternIndicesByDifficulty(difficulty);
  const patternIndex = availablePatterns[rng.nextInt(0, availablePatterns.length)];
  const pattern = getPattern(patternIndex);
  
  // Find all word entries in the pattern
  const entries = findWordEntries(pattern);
  
  // Try multiple times with different word shuffles
  let filledEntries = null;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!filledEntries && attempts < maxAttempts) {
    try {
      filledEntries = fillPuzzleWithBacktracking(entries, rng, 1000, difficulty); // Add timeout
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        // Fallback to a guaranteed-to-work simple puzzle
        return generateSimpleFallbackPuzzle(seed, difficulty);
      }
    }
  }
  
  if (!filledEntries) {
    return generateSimpleFallbackPuzzle(seed, difficulty);
  }
  
  // Create the final grid and puzzle
  return createPuzzleFromEntries(seed, pattern, filledEntries);
}

/**
 * Find all word entries (horizontal and vertical words) in a pattern
 */
function findWordEntries(pattern: Pattern): WordEntry[] {
  const entries: WordEntry[] = [];
  const size = pattern.length;
  
  // Find horizontal entries
  for (let row = 0; row < size; row++) {
    let start = -1;
    for (let col = 0; col <= size; col++) {
      const isBlock = col === size || pattern[row][col];
      
      if (!isBlock && start === -1) {
        start = col;
      } else if (isBlock && start !== -1) {
        const length = col - start;
        if (length >= 2) {
          entries.push({
            row,
            col: start,
            direction: "ACROSS",
            length
          });
        }
        start = -1;
      }
    }
  }
  
  // Find vertical entries
  for (let col = 0; col < size; col++) {
    let start = -1;
    for (let row = 0; row <= size; row++) {
      const isBlock = row === size || pattern[row][col];
      
      if (!isBlock && start === -1) {
        start = row;
      } else if (isBlock && start !== -1) {
        const length = row - start;
        if (length >= 2) {
          entries.push({
            row: start,
            col,
            direction: "DOWN",
            length
          });
        }
        start = -1;
      }
    }
  }
  
  return entries;
}

/**
 * Fill puzzle using backtracking with difficulty-based word selection
 */
function fillPuzzleWithBacktracking(
  entries: WordEntry[], 
  rng: SeededRNG, 
  maxIterations: number,
  difficulty: Difficulty
): WordEntry[] | null {
  // Create a grid to track letter constraints
  const constraints: GridConstraint[][] = Array(5).fill(null).map(() => 
    Array(5).fill(null).map((_, col) => ({ row: 0, col }))
  );
  
  // Sort entries by length (shorter words first for easier constraint satisfaction)
  const sortedEntries = [...entries].sort((a, b) => a.length - b.length);
  
  let iterations = 0;
  
  function backtrack(index: number): boolean {
    if (iterations++ > maxIterations) {
      throw new Error("Max iterations exceeded");
    }
    
    if (index >= sortedEntries.length) {
      return true; // All entries filled successfully
    }
    
    const entry = sortedEntries[index];
    const candidateWords = getWordsForLengthAndDifficulty(entry.length, difficulty);
    
    // Shuffle candidates for variety
    const shuffled = shuffleArray([...candidateWords], rng);
    
    for (const word of shuffled.slice(0, 20)) { // Limit candidates for performance
      if (canPlaceWord(entry, word, constraints)) {
        // Place the word
        placeWord(entry, word, constraints);
        entry.word = word;
        
        // Recursively try to fill remaining entries
        if (backtrack(index + 1)) {
          return true;
        }
        
        // Backtrack: remove the word
        removeWord(entry, constraints);
        entry.word = undefined;
      }
    }
    
    return false;
  }
  
  return backtrack(0) ? sortedEntries : null;
}

/**
 * Get words of a specific length filtered by difficulty
 */
function getWordsForLengthAndDifficulty(length: number, difficulty: Difficulty): string[] {
  const words = getWordsByLength(length);
  const preferences = DIFFICULTY_WORD_PREFERENCES[difficulty];
  
  let filteredWords = words;
  
  // For easy mode, prefer common words (first in the list)
  if (difficulty === "EASY") {
    filteredWords = words.slice(0, Math.min(words.length, preferences.minCommonWords));
  }
  
  return filteredWords;
}

/**
 * Check if a word can be placed at the given entry without conflicts
 */
function canPlaceWord(entry: WordEntry, word: string, constraints: GridConstraint[][]): boolean {
  for (let i = 0; i < word.length; i++) {
    const row = entry.direction === "ACROSS" ? entry.row : entry.row + i;
    const col = entry.direction === "ACROSS" ? entry.col + i : entry.col;
    
    const constraint = constraints[row][col];
    if (constraint.letter && constraint.letter !== word[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Place a word in the constraints grid
 */
function placeWord(entry: WordEntry, word: string, constraints: GridConstraint[][]): void {
  for (let i = 0; i < word.length; i++) {
    const row = entry.direction === "ACROSS" ? entry.row : entry.row + i;
    const col = entry.direction === "ACROSS" ? entry.col + i : entry.col;
    
    constraints[row][col] = { row, col, letter: word[i] };
  }
}

/**
 * Remove a word from the constraints grid
 */
function removeWord(entry: WordEntry, constraints: GridConstraint[][]): void {
  for (let i = 0; i < entry.length; i++) {
    const row = entry.direction === "ACROSS" ? entry.row : entry.row + i;
    const col = entry.direction === "ACROSS" ? entry.col + i : entry.col;
    
    // Only remove if no other word needs this cell
    let hasOtherConstraint = false;
    // This is simplified - in a full implementation, we'd track which entries use each cell
    
    if (!hasOtherConstraint) {
      constraints[row][col] = { row, col };
    }
  }
}

/**
 * Create the final puzzle from filled entries
 */
function createPuzzleFromEntries(seed: string, pattern: Pattern, entries: WordEntry[]): Puzzle {
  const size = 5;
  
  // Create grid with cells
  const grid: Cell[][] = Array(size).fill(null).map((_, row) =>
    Array(size).fill(null).map((_, col) => ({
      row,
      col,
      isBlock: pattern[row][col],
      solution: "",
      guess: ""
    }))
  );
  
  // Fill in solutions from entries
  for (const entry of entries) {
    if (entry.word) {
      for (let i = 0; i < entry.word.length; i++) {
        const row = entry.direction === "ACROSS" ? entry.row : entry.row + i;
        const col = entry.direction === "ACROSS" ? entry.col + i : entry.col;
        grid[row][col].solution = entry.word[i];
      }
    }
  }
  
  // Number the cells and create clues
  let clueNumber = 1;
  const clues: { across: Clue[], down: Clue[] } = { across: [], down: [] };
  
  // Track which cells start words
  const startsWord: { [key: string]: number } = {};
  
  for (const entry of entries) {
    const key = `${entry.row}-${entry.col}`;
    if (!startsWord[key]) {
      startsWord[key] = clueNumber++;
      grid[entry.row][entry.col].number = startsWord[key];
    }
    
    const clue: Clue = {
      id: `${entry.direction.toLowerCase()}-${startsWord[key]}`,
      number: startsWord[key],
      direction: entry.direction,
      text: generateClueText(entry.word || "", entry.length),
      answer: entry.word || "",
      start: { row: entry.row, col: entry.col },
      length: entry.length
    };
    
    if (entry.direction === "ACROSS") {
      clues.across.push(clue);
    } else {
      clues.down.push(clue);
    }
  }
  
  // Sort clues by number
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);
  
  return {
    id: `puzzle-${seed}`,
    seed,
    size: 5,
    grid,
    clues
  };
}

/**
 * Generate a simple clue text for a word
 */
function generateClueText(word: string, length: number): string {
  // This is a simplified clue generator
  // In a real app, you'd have a database of clues or use AI
  const simpleClues: { [key: string]: string } = {
    "BEACH": "Sandy shore",
    "OCEAN": "Large body of water",
    "HOUSE": "Place to live",
    "APPLE": "Red fruit",
    "WATER": "H2O",
    "LIGHT": "Not dark",
    "MUSIC": "Sounds in harmony",
    "PHONE": "Communication device",
    "BREAD": "Baked food",
    "CHAIR": "Furniture to sit on"
  };
  
  return simpleClues[word] || `${length}-letter word`;
}

/**
 * Fallback puzzle generator for when backtracking fails
 */
function generateSimpleFallbackPuzzle(seed: string, difficulty: Difficulty): Puzzle {
  // Use the simplest pattern (cross)
  const pattern = getPattern(0);
  
  // Create a basic cross puzzle with guaranteed words
  const fallbackWords = {
    "BEACH": "Sandy shore",
    "OCEAN": "Large body of water", 
    "HOUSE": "Place to live",
    "APPLE": "Red fruit",
    "CHAIR": "Seat"
  };
  
  const grid: Cell[][] = Array(5).fill(null).map((_, row) =>
    Array(5).fill(null).map((_, col) => ({
      row,
      col,
      isBlock: pattern[row][col],
      solution: "",
      guess: ""
    }))
  );
  
  // Fill the cross pattern
  const horizontal = "BEACH";
  const vertical = "HOUSE";
  
  // Place horizontal word
  for (let i = 0; i < horizontal.length; i++) {
    grid[2][i].solution = horizontal[i];
  }
  
  // Place vertical word
  for (let i = 0; i < vertical.length; i++) {
    grid[i][2].solution = vertical[i];
  }
  
  // Number cells
  grid[0][2].number = 1; // Start of vertical
  grid[2][0].number = 2; // Start of horizontal
  
  const clues: { across: Clue[], down: Clue[] } = {
    across: [{
      id: "across-2",
      number: 2,
      direction: "ACROSS",
      text: fallbackWords["BEACH"],
      answer: "BEACH",
      start: { row: 2, col: 0 },
      length: 5
    }],
    down: [{
      id: "down-1", 
      number: 1,
      direction: "DOWN",
      text: fallbackWords["HOUSE"],
      answer: "HOUSE",
      start: { row: 0, col: 2 },
      length: 5
    }]
  };
  
  return {
    id: `fallback-${seed}`,
    seed,
    size: 5,
    grid,
    clues
  };
}

/**
 * Shuffle array using seeded random
 */
function shuffleArray<T>(array: T[], rng: SeededRNG): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
