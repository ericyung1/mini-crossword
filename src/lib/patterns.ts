/**
 * Valid 5x5 crossword patterns for mini crosswords
 * Each pattern is a 5x5 boolean array where true = block, false = letter cell
 * Patterns are designed to avoid 1-letter entries and create good word intersections
 */

export type Pattern = boolean[][];

/**
 * Pattern 1: Classic cross pattern
 * Creates good across/down word intersections
 */
const PATTERN_CROSS: Pattern = [
  [false, false, true,  false, false],
  [false, false, false, false, false],
  [true,  false, false, false, true ],
  [false, false, false, false, false],
  [false, false, true,  false, false]
];

/**
 * Pattern 2: Corner blocks
 * Blocks in corners create clean word boundaries
 */
const PATTERN_CORNERS: Pattern = [
  [true,  false, false, false, true ],
  [false, false, false, false, false],
  [false, false, true,  false, false],
  [false, false, false, false, false],
  [true,  false, false, false, true ]
];

/**
 * Pattern 3: Diagonal blocks
 * Creates interesting diagonal symmetry
 */
const PATTERN_DIAGONAL: Pattern = [
  [false, false, false, false, false],
  [false, true,  false, true,  false],
  [false, false, false, false, false],
  [false, true,  false, true,  false],
  [false, false, false, false, false]
];

/**
 * Pattern 4: Center plus
 * Central cross with additional strategic blocks
 */
const PATTERN_CENTER_PLUS: Pattern = [
  [false, false, false, false, false],
  [false, false, true,  false, false],
  [false, true,  false, true,  false],
  [false, false, true,  false, false],
  [false, false, false, false, false]
];

/**
 * Pattern 5: Side blocks
 * Blocks on sides create vertical emphasis
 */
const PATTERN_SIDES: Pattern = [
  [false, true,  false, true,  false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, true,  false, true,  false]
];

/**
 * Pattern 6: Scattered blocks
 * More distributed block placement
 */
const PATTERN_SCATTERED: Pattern = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [true,  false, false, false, true ],
  [false, false, false, false, false],
  [false, false, false, false, false]
];

/**
 * Pattern 7: T-shape pattern
 * Creates T-shaped word arrangements
 */
const PATTERN_T_SHAPE: Pattern = [
  [true,  false, false, false, true ],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, true,  false, false]
];

/**
 * Pattern 8: Minimal blocks
 * Very few blocks for maximum word density
 */
const PATTERN_MINIMAL: Pattern = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, true,  false, false],
  [false, false, false, false, false],
  [false, false, false, false, false]
];

/**
 * All available patterns for puzzle generation
 */
export const CROSSWORD_PATTERNS: Pattern[] = [
  PATTERN_CROSS,
  PATTERN_CORNERS,
  PATTERN_DIAGONAL,
  PATTERN_CENTER_PLUS,
  PATTERN_SIDES,
  PATTERN_SCATTERED,
  PATTERN_T_SHAPE,
  PATTERN_MINIMAL
];

/**
 * Get a specific pattern by index
 */
export function getPattern(index: number): Pattern {
  return CROSSWORD_PATTERNS[index % CROSSWORD_PATTERNS.length];
}

/**
 * Check if a pattern is valid (no isolated single cells)
 */
export function isValidPattern(pattern: Pattern): boolean {
  const size = pattern.length;
  
  // Check each non-block cell to ensure it's part of a word of length >= 2
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (pattern[row][col]) continue; // Skip blocks
      
      // Check horizontal word length
      let horizontalLength = 0;
      for (let c = col; c < size && !pattern[row][c]; c++) {
        horizontalLength++;
      }
      for (let c = col - 1; c >= 0 && !pattern[row][c]; c--) {
        horizontalLength++;
      }
      
      // Check vertical word length
      let verticalLength = 0;
      for (let r = row; r < size && !pattern[r][col]; r++) {
        verticalLength++;
      }
      for (let r = row - 1; r >= 0 && !pattern[r][col]; r--) {
        verticalLength++;
      }
      
      // Cell must be part of at least one word of length >= 2
      if (horizontalLength < 2 && verticalLength < 2) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Create a copy of a pattern
 */
export function clonePattern(pattern: Pattern): Pattern {
  return pattern.map(row => [...row]);
}
