import type { Puzzle, Cell, Clue, Direction } from "@/types/crossword";
import { createRNG, type SeededRNG } from "./seed";
import { CROSSWORD_PATTERNS, getPattern, type Pattern } from "./patterns";
import { getWordsByLength, WORD_BANK } from "./wordbank";

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
 * Generate a complete crossword puzzle from a seed string
 */
export function generatePuzzle(seed: string): Puzzle {
  const rng = createRNG(seed);
  
  // Use simpler patterns that are easier to fill
  const easyPatterns = [0, 1, 5, 7]; // Cross, corners, scattered, minimal
  const patternIndex = easyPatterns[rng.nextInt(0, easyPatterns.length)];
  const pattern = getPattern(patternIndex);
  
  // Find all word entries in the pattern
  const entries = findWordEntries(pattern);
  
  // Try multiple times with different word shuffles
  let filledEntries = null;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!filledEntries && attempts < maxAttempts) {
    try {
      filledEntries = fillPuzzleWithBacktracking(entries, rng, 1000); // Add timeout
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        // Fallback to a guaranteed-to-work simple puzzle
        return generateSimpleFallbackPuzzle(seed);
      }
    }
  }
  
  if (!filledEntries) {
    return generateSimpleFallbackPuzzle(seed);
  }
  
  // Create the grid and clues
  const { grid, clues } = createGridAndClues(pattern, filledEntries);
  
  return {
    id: `puzzle-${seed}`,
    seed,
    size: 5,
    grid,
    clues
  };
}

/**
 * Find all word entries (across and down) in a pattern
 */
function findWordEntries(pattern: Pattern): WordEntry[] {
  const entries: WordEntry[] = [];
  const size = pattern.length;
  
  // Find ACROSS entries first (as specified)
  for (let row = 0; row < size; row++) {
    let col = 0;
    while (col < size) {
      if (pattern[row][col]) {
        col++;
        continue;
      }
      
      // Found start of a potential word
      const startCol = col;
      let length = 0;
      
      // Count consecutive non-block cells
      while (col < size && !pattern[row][col]) {
        length++;
        col++;
      }
      
      // Only add if length >= 2 (no single letters)
      if (length >= 2) {
        entries.push({
          row,
          col: startCol,
          direction: "ACROSS",
          length
        });
      }
    }
  }
  
  // Find DOWN entries
  for (let col = 0; col < size; col++) {
    let row = 0;
    while (row < size) {
      if (pattern[row][col]) {
        row++;
        continue;
      }
      
      // Found start of a potential word
      const startRow = row;
      let length = 0;
      
      // Count consecutive non-block cells
      while (row < size && !pattern[row][col]) {
        length++;
        row++;
      }
      
      // Only add if length >= 2 (no single letters)
      if (length >= 2) {
        entries.push({
          row: startRow,
          col,
          direction: "DOWN",
          length
        });
      }
    }
  }
  
  return entries;
}

/**
 * Fill puzzle using backtracking algorithm with timeout
 */
function fillPuzzleWithBacktracking(entries: WordEntry[], rng: SeededRNG, maxIterations: number = 1000): WordEntry[] | null {
  // Sort entries: ACROSS first (as specified), then by position
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.direction !== b.direction) {
      return a.direction === "ACROSS" ? -1 : 1;
    }
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
  
  // Get available words by length - use more common words first
  const wordsByLength = new Map<number, string[]>();
  for (let length = 2; length <= 5; length++) {
    const words = getWordsByLength(length);
    // Prioritize shorter, more common words
    const shuffledWords = rng.shuffle([...words]);
    wordsByLength.set(length, shuffledWords.slice(0, Math.min(50, shuffledWords.length))); // Limit to 50 words per length
  }
  
  let iterations = 0;
  return backtrackFill(sortedEntries, 0, [], wordsByLength, { current: iterations, max: maxIterations });
}

/**
 * Recursive backtracking to fill entries with iteration limit
 */
function backtrackFill(
  entries: WordEntry[],
  entryIndex: number,
  currentSolution: WordEntry[],
  wordsByLength: Map<number, string[]>,
  iterationCounter: { current: number; max: number }
): WordEntry[] | null {
  // Check iteration limit to prevent infinite loops
  iterationCounter.current++;
  if (iterationCounter.current > iterationCounter.max) {
    return null;
  }
  
  // Base case: all entries filled
  if (entryIndex >= entries.length) {
    return [...currentSolution];
  }
  
  const entry = entries[entryIndex];
  const availableWords = wordsByLength.get(entry.length) || [];
  
  // Try each available word for this entry (limit to first 20 for speed)
  const wordsToTry = availableWords.slice(0, 20);
  
  for (const word of wordsToTry) {
    const candidateEntry = { ...entry, word };
    
    // Check if this word is compatible with existing constraints
    if (isWordCompatible(candidateEntry, currentSolution)) {
      // Add to current solution and recurse
      currentSolution.push(candidateEntry);
      
      const result = backtrackFill(entries, entryIndex + 1, currentSolution, wordsByLength, iterationCounter);
      if (result) {
        return result;
      }
      
      // Backtrack
      currentSolution.pop();
    }
  }
  
  return null; // No valid word found for this entry
}

/**
 * Check if a word is compatible with existing entries (crossing constraints)
 */
function isWordCompatible(candidateEntry: WordEntry, existingEntries: WordEntry[]): boolean {
  if (!candidateEntry.word) return false;
  
  for (const existingEntry of existingEntries) {
    if (!existingEntry.word) continue;
    
    // Check if entries intersect
    const intersection = findIntersection(candidateEntry, existingEntry);
    if (intersection) {
      const candidateLetter = candidateEntry.word[intersection.candidateIndex];
      const existingLetter = existingEntry.word[intersection.existingIndex];
      
      if (candidateLetter !== existingLetter) {
        return false; // Letters don't match at intersection
      }
    }
  }
  
  return true;
}

/**
 * Find intersection point between two entries
 */
function findIntersection(entry1: WordEntry, entry2: WordEntry): {
  candidateIndex: number;
  existingIndex: number;
} | null {
  // Entries must be perpendicular to intersect
  if (entry1.direction === entry2.direction) {
    return null;
  }
  
  const [across, down] = entry1.direction === "ACROSS" ? [entry1, entry2] : [entry2, entry1];
  
  // Check if they actually intersect
  const acrossRowInRange = down.row <= across.row && across.row < down.row + down.length;
  const downColInRange = across.col <= down.col && down.col < across.col + across.length;
  
  if (!acrossRowInRange || !downColInRange) {
    return null;
  }
  
  // Calculate indices
  const acrossIndex = down.col - across.col;
  const downIndex = across.row - down.row;
  
  return entry1.direction === "ACROSS" 
    ? { candidateIndex: acrossIndex, existingIndex: downIndex }
    : { candidateIndex: downIndex, existingIndex: acrossIndex };
}

/**
 * Create grid and clues from filled entries
 */
function createGridAndClues(pattern: Pattern, entries: WordEntry[]): {
  grid: Cell[][];
  clues: { across: Clue[]; down: Clue[] };
} {
  const size = pattern.length;
  
  // Initialize grid
  const grid: Cell[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = {
        row,
        col,
        isBlock: pattern[row][col]
      };
    }
  }
  
  // Fill letters from entries
  for (const entry of entries) {
    if (!entry.word) continue;
    
    for (let i = 0; i < entry.length; i++) {
      const row = entry.direction === "DOWN" ? entry.row + i : entry.row;
      const col = entry.direction === "ACROSS" ? entry.col + i : entry.col;
      
      if (row < size && col < size) {
        grid[row][col].solution = entry.word[i];
        grid[row][col].guess = ""; // Empty guess initially
      }
    }
  }
  
  // Number the grid and create clues
  let clueNumber = 1;
  const acrossClues: Clue[] = [];
  const downClues: Clue[] = [];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].isBlock) continue;
      
      const startsAcross = col === 0 || grid[row][col - 1]?.isBlock;
      const startsDown = row === 0 || grid[row - 1]?.[col]?.isBlock;
      
      if (startsAcross || startsDown) {
        grid[row][col].number = clueNumber;
        
        // Find corresponding entries and create clues
        if (startsAcross) {
          const entry = entries.find(e => 
            e.direction === "ACROSS" && e.row === row && e.col === col
          );
          if (entry && entry.word) {
            acrossClues.push({
              id: `${clueNumber}-across`,
              number: clueNumber,
              direction: "ACROSS",
              text: generateClueText(entry.word),
              answer: entry.word,
              start: { row, col },
              length: entry.length
            });
          }
        }
        
        if (startsDown) {
          const entry = entries.find(e => 
            e.direction === "DOWN" && e.row === row && e.col === col
          );
          if (entry && entry.word) {
            downClues.push({
              id: `${clueNumber}-down`,
              number: clueNumber,
              direction: "DOWN",
              text: generateClueText(entry.word),
              answer: entry.word,
              start: { row, col },
              length: entry.length
            });
          }
        }
        
        clueNumber++;
      }
    }
  }
  
  return {
    grid,
    clues: { across: acrossClues, down: downClues }
  };
}

/**
 * Generate a simple fallback puzzle when backtracking fails
 */
function generateSimpleFallbackPuzzle(seed: string): Puzzle {
  const rng = createRNG(seed + "-fallback");
  
  // Choose from a few simple patterns
  const simplePatterns = [
    // Pattern 1: Center block only
    [
      [false, false, false, false, false],
      [false, false, false, false, false], 
      [false, false, true,  false, false],
      [false, false, false, false, false],
      [false, false, false, false, false]
    ],
    // Pattern 2: Two corner blocks
    [
      [true,  false, false, false, false],
      [false, false, false, false, false], 
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, true ]
    ],
    // Pattern 3: No blocks (all letters)
    [
      [false, false, false, false, false],
      [false, false, false, false, false], 
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false]
    ]
  ];
  
  const pattern = simplePatterns[rng.nextInt(0, simplePatterns.length)];
  
  // Create the grid
  const grid: Cell[][] = [];
  
  // Initialize grid
  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    for (let col = 0; col < 5; col++) {
      grid[row][col] = {
        row,
        col,
        isBlock: pattern[row][col],
        guess: ""
      };
    }
  }
  
  // Choose solutions based on pattern - ensure all are valid 5-letter words
  let solutions: string[];
  if (pattern[2][2]) { // Center block pattern
    solutions = [
      "ABOUT", // Row 0
      "BELOW", // Row 1  
      "BEACH", // Row 2 - changed to avoid space issue
      "ABOVE", // Row 3
      "TOWER"  // Row 4
    ];
  } else if (pattern[0][0] || pattern[4][4]) { // Corner blocks  
    solutions = [
      "ROUND", // Row 0
      "OUGHT", // Row 1  
      "UNDER", // Row 2
      "NEVER", // Row 3
      "TOWER"  // Row 4
    ];
  } else { // No blocks
    solutions = [
      "ABOUT", // Row 0
      "ROUND", // Row 1  
      "OUGHT", // Row 2
      "UNDER", // Row 3
      "TOWER"  // Row 4
    ];
  }
  
  // Fill grid with solutions - ensure every non-block cell gets a letter
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (!grid[row][col].isBlock) {
        // Get the appropriate letter from the solution word
        const solutionWord = solutions[row];
        if (col < solutionWord.length) {
          grid[row][col].solution = solutionWord[col];
        } else {
          // Shouldn't happen with 5-letter words, but safety fallback
          grid[row][col].solution = "A";
        }
      }
    }
  }
  
  // Numbers will be added dynamically in clue generation
  
  // Create simple clues based on the actual solutions
  const acrossClues: Clue[] = [];
  const downClues: Clue[] = [];
  let clueNumber = 1;
  
  // Generate across clues for each row
  for (let row = 0; row < 5; row++) {
    // Check if this row has a valid word (no blocks interrupting)
    let hasValidWord = true;
    let wordLength = 0;
    for (let col = 0; col < 5; col++) {
      if (grid[row][col].isBlock) {
        if (wordLength > 0 && wordLength < 5) {
          hasValidWord = false;
          break;
        }
      } else {
        wordLength++;
      }
    }
    
    if (hasValidWord && wordLength >= 2) {
      // Get the word from solutions, ensuring it matches the grid length
      let answer = solutions[row].replace(/ /g, "");
      if (answer.length > wordLength) {
        answer = answer.substring(0, wordLength);
      }
      if (answer.length >= 2 && answer.length === wordLength) {
        if (!grid[row][0].isBlock) {
          grid[row][0].number = clueNumber;
          acrossClues.push({
            id: `${clueNumber}-across`,
            number: clueNumber,
            direction: "ACROSS",
            text: `Word: ${answer}`,
            answer: answer,
            start: { row, col: 0 },
            length: wordLength
          });
          clueNumber++;
        }
      }
    }
  }
  
  // Generate one simple down clue
  if (!grid[0][0].isBlock && !grid[1][0].isBlock) {
    const downAnswer = (grid[0][0].solution || "A") + (grid[1][0].solution || "B");
    if (!grid[0][0].number) grid[0][0].number = 1;
    downClues.push({
      id: "1-down",
      number: grid[0][0].number,
      direction: "DOWN",
      text: `Letters: ${downAnswer}`,
      answer: downAnswer,
      start: { row: 0, col: 0 },
      length: 2
    });
  }
  
  return {
    id: `fallback-${seed}`,
    seed,
    size: 5,
    grid,
    clues: { across: acrossClues, down: downClues }
  };
}

/**
 * Generate a simple clue text for a word (placeholder implementation)
 * TODO: Replace with proper clue generation logic
 */
function generateClueText(word: string): string {
  // Simple placeholder clues - in a real implementation, 
  // you'd have a database of clues or clue generation logic
  const simpleClues: Record<string, string> = {
    CAT: "Feline pet",
    DOG: "Canine companion", 
    BAT: "Flying mammal",
    RAT: "Small rodent",
    CAR: "Vehicle",
    ANT: "Industrious insect",
    BEE: "Buzzing insect",
    SUN: "Solar star",
    SKY: "Blue expanse above",
    SEA: "Large body of water",
    ICE: "Frozen water",
    HOT: "Very warm",
    OLD: "Not young",
    NEW: "Not old",
    BIG: "Large in size",
    RED: "Color of roses",
    BLUE: "Color of sky",
    TREE: "Woody plant",
    BIRD: "Flying animal",
    FISH: "Swimming creature",
    HELLO: "Greeting word",
    EATEN: "Consumed food",
    LOVED: "Adored",
    OWNED: "Possessed",
    HELP: "Assistance"
  };
  
  return simpleClues[word] || `Word: ${word}`;
}
