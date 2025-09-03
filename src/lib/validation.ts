import type { Cell, Clue, Puzzle } from "@/types/crossword";

/**
 * Get all cells that belong to a specific clue
 */
export function cellsForClue(puzzle: Puzzle, clue: Clue): Cell[] {
  const cells: Cell[] = [];
  const { start, direction, length } = clue;
  
  for (let i = 0; i < length; i++) {
    const row = direction === "DOWN" ? start.row + i : start.row;
    const col = direction === "ACROSS" ? start.col + i : start.col;
    
    // Ensure we're within bounds
    if (row >= 0 && row < puzzle.size && col >= 0 && col < puzzle.size) {
      cells.push(puzzle.grid[row][col]);
    }
  }
  
  return cells;
}

/**
 * Check if a single cell has the correct guess
 */
export function isCellCorrect(cell: Cell): boolean {
  if (cell.isBlock) return true; // Blocks are always "correct"
  if (!cell.solution) return false; // No solution means incorrect
  if (!cell.guess) return false; // No guess means incorrect
  
  return cell.guess.toUpperCase() === cell.solution.toUpperCase();
}

/**
 * Check if all cells in a clue are correctly filled
 */
export function isClueFullyCorrect(puzzle: Puzzle, clue: Clue): boolean {
  const cells = cellsForClue(puzzle, clue);
  
  // All cells must have correct guesses
  return cells.every(cell => isCellCorrect(cell));
}

/**
 * Check if a clue is partially filled (has at least one guess)
 */
export function isCluePartiallyFilled(puzzle: Puzzle, clue: Clue): boolean {
  const cells = cellsForClue(puzzle, clue);
  
  // At least one cell must have a guess
  return cells.some(cell => !cell.isBlock && cell.guess && cell.guess.trim() !== "");
}

/**
 * Check if a clue is completely filled (all cells have guesses)
 */
export function isClueCompletelyFilled(puzzle: Puzzle, clue: Clue): boolean {
  const cells = cellsForClue(puzzle, clue);
  
  // All non-block cells must have guesses
  return cells.every(cell => 
    cell.isBlock || (cell.guess && cell.guess.trim() !== "")
  );
}

/**
 * Get the current guess for a clue as a string
 */
export function getClueGuess(puzzle: Puzzle, clue: Clue): string {
  const cells = cellsForClue(puzzle, clue);
  
  return cells
    .filter(cell => !cell.isBlock)
    .map(cell => cell.guess || " ")
    .join("");
}

/**
 * Get the solution for a clue as a string
 */
export function getClueSolution(puzzle: Puzzle, clue: Clue): string {
  const cells = cellsForClue(puzzle, clue);
  
  return cells
    .filter(cell => !cell.isBlock)
    .map(cell => cell.solution || " ")
    .join("");
}

/**
 * Check if the entire puzzle is solved correctly
 */
export function isPuzzleSolved(puzzle: Puzzle): boolean {
  // Check all cells in the grid
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      const cell = puzzle.grid[row][col];
      
      // Skip blocks
      if (cell.isBlock) continue;
      
      // All letter cells must be correctly filled
      if (!isCellCorrect(cell)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if the puzzle is completely filled (all cells have guesses)
 */
export function isPuzzleCompletelyFilled(puzzle: Puzzle): boolean {
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      const cell = puzzle.grid[row][col];
      
      // Skip blocks
      if (cell.isBlock) continue;
      
      // All letter cells must have guesses
      if (!cell.guess || cell.guess.trim() === "") {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Get puzzle completion percentage (0-100)
 */
export function getPuzzleCompletionPercentage(puzzle: Puzzle): number {
  let totalCells = 0;
  let filledCells = 0;
  
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      const cell = puzzle.grid[row][col];
      
      // Skip blocks
      if (cell.isBlock) continue;
      
      totalCells++;
      if (cell.guess && cell.guess.trim() !== "") {
        filledCells++;
      }
    }
  }
  
  return totalCells === 0 ? 100 : Math.round((filledCells / totalCells) * 100);
}

/**
 * Get puzzle correctness percentage (0-100)
 */
export function getPuzzleCorrectnessPercentage(puzzle: Puzzle): number {
  let totalCells = 0;
  let correctCells = 0;
  
  for (let row = 0; row < puzzle.size; row++) {
    for (let col = 0; col < puzzle.size; col++) {
      const cell = puzzle.grid[row][col];
      
      // Skip blocks
      if (cell.isBlock) continue;
      
      totalCells++;
      if (isCellCorrect(cell)) {
        correctCells++;
      }
    }
  }
  
  return totalCells === 0 ? 100 : Math.round((correctCells / totalCells) * 100);
}

/**
 * Find all clues that intersect with a given cell
 */
export function getIntersectingClues(puzzle: Puzzle, row: number, col: number): Clue[] {
  const intersectingClues: Clue[] = [];
  
  // Check across clues
  for (const clue of puzzle.clues.across) {
    const cells = cellsForClue(puzzle, clue);
    if (cells.some(cell => cell.row === row && cell.col === col)) {
      intersectingClues.push(clue);
    }
  }
  
  // Check down clues
  for (const clue of puzzle.clues.down) {
    const cells = cellsForClue(puzzle, clue);
    if (cells.some(cell => cell.row === row && cell.col === col)) {
      intersectingClues.push(clue);
    }
  }
  
  return intersectingClues;
}

/**
 * Validate that a puzzle is structurally correct
 */
export function validatePuzzleStructure(puzzle: Puzzle): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check grid size
  if (puzzle.grid.length !== puzzle.size) {
    errors.push(`Grid height ${puzzle.grid.length} does not match puzzle size ${puzzle.size}`);
  }
  
  // Check each row
  for (let row = 0; row < puzzle.grid.length; row++) {
    if (puzzle.grid[row].length !== puzzle.size) {
      errors.push(`Row ${row} has ${puzzle.grid[row].length} cells, expected ${puzzle.size}`);
    }
  }
  
  // Check that all clues have valid start positions and lengths
  const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
  for (const clue of allClues) {
    const { start, direction, length } = clue;
    
    // Check bounds
    if (start.row < 0 || start.row >= puzzle.size) {
      errors.push(`Clue ${clue.id} has invalid start row ${start.row}`);
    }
    if (start.col < 0 || start.col >= puzzle.size) {
      errors.push(`Clue ${clue.id} has invalid start col ${start.col}`);
    }
    
    // Check that clue doesn't go out of bounds
    const endRow = direction === "DOWN" ? start.row + length - 1 : start.row;
    const endCol = direction === "ACROSS" ? start.col + length - 1 : start.col;
    
    if (endRow >= puzzle.size) {
      errors.push(`Clue ${clue.id} extends beyond grid (end row ${endRow})`);
    }
    if (endCol >= puzzle.size) {
      errors.push(`Clue ${clue.id} extends beyond grid (end col ${endCol})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
