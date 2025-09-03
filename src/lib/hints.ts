import type { Puzzle, Cell, Clue } from "@/types/crossword";
import type { HintType } from "@/types/game";
import { cellsForClue, isClueFullyCorrect } from "./validation";

/**
 * Available hint types with costs and descriptions
 */
export const HINT_TYPES: HintType[] = [
  {
    type: "LETTER",
    cost: 1,
    description: "Reveal one letter in the selected word"
  },
  {
    type: "WORD", 
    cost: 3,
    description: "Reveal the entire selected word"
  },
  {
    type: "CHECK",
    cost: 0,
    description: "Check if current answers are correct (free)"
  }
];

/**
 * Reveal a single letter hint for the selected clue
 */
export function revealLetterHint(puzzle: Puzzle, selectedClue: Clue): Puzzle {
  if (!selectedClue) return puzzle;
  
  const cells = cellsForClue(puzzle, selectedClue);
  const emptyCells = cells.filter(cell => !cell.guess || cell.guess === "");
  
  // If no empty cells, reveal a random incorrect cell
  const incorrectCells = cells.filter(cell => 
    cell.guess && cell.guess !== cell.solution
  );
  
  const targetCells = emptyCells.length > 0 ? emptyCells : incorrectCells;
  
  if (targetCells.length === 0) {
    return puzzle; // Word is already complete and correct
  }
  
  // Pick a random cell to reveal
  const randomCell = targetCells[Math.floor(Math.random() * targetCells.length)];
  
  const newGrid = puzzle.grid.map(row =>
    row.map(cell => 
      cell.row === randomCell.row && cell.col === randomCell.col
        ? { ...cell, guess: cell.solution || "" }
        : cell
    )
  );
  
  return { ...puzzle, grid: newGrid };
}

/**
 * Reveal the entire word for the selected clue
 */
export function revealWordHint(puzzle: Puzzle, selectedClue: Clue): Puzzle {
  if (!selectedClue) return puzzle;
  
  const cells = cellsForClue(puzzle, selectedClue);
  
  const newGrid = puzzle.grid.map(row =>
    row.map(cell => {
      const isInClue = cells.some(c => c.row === cell.row && c.col === cell.col);
      return isInClue 
        ? { ...cell, guess: cell.solution || "" }
        : cell;
    })
  );
  
  return { ...puzzle, grid: newGrid };
}

/**
 * Check all current answers and mark incorrect ones
 */
export function checkAnswersHint(puzzle: Puzzle): Puzzle {
  // This hint just triggers a re-render to show correct/incorrect colors
  // The visual feedback is handled by the UI components
  return { ...puzzle };
}

/**
 * Apply a hint to the puzzle
 */
export function applyHint(
  puzzle: Puzzle, 
  hintType: HintType["type"], 
  selectedClue?: Clue
): { puzzle: Puzzle; success: boolean; message: string } {
  switch (hintType) {
    case "LETTER":
      if (!selectedClue) {
        return { 
          puzzle, 
          success: false, 
          message: "Please select a clue first" 
        };
      }
      
      if (isClueFullyCorrect(puzzle, selectedClue)) {
        return {
          puzzle,
          success: false,
          message: "This word is already complete!"
        };
      }
      
      return {
        puzzle: revealLetterHint(puzzle, selectedClue),
        success: true,
        message: "Letter revealed!"
      };
      
    case "WORD":
      if (!selectedClue) {
        return { 
          puzzle, 
          success: false, 
          message: "Please select a clue first" 
        };
      }
      
      if (isClueFullyCorrect(puzzle, selectedClue)) {
        return {
          puzzle,
          success: false,
          message: "This word is already complete!"
        };
      }
      
      return {
        puzzle: revealWordHint(puzzle, selectedClue),
        success: true,
        message: `Word revealed: ${selectedClue.answer}`
      };
      
    case "CHECK":
      return {
        puzzle: checkAnswersHint(puzzle),
        success: true,
        message: "Answers checked! Look for red/green highlighting."
      };
      
    default:
      return {
        puzzle,
        success: false,
        message: "Unknown hint type"
      };
  }
}

/**
 * Get available hints for the current puzzle state
 */
export function getAvailableHints(puzzle: Puzzle, selectedClue?: Clue): HintType[] {
  const hints = [...HINT_TYPES];
  
  // Check if letter/word hints are applicable
  if (!selectedClue) {
    return hints.filter(hint => hint.type === "CHECK");
  }
  
  // If clue is already complete, only check hint is useful
  if (isClueFullyCorrect(puzzle, selectedClue)) {
    return hints.filter(hint => hint.type === "CHECK");
  }
  
  return hints;
}

/**
 * Calculate total hint cost
 */
export function calculateHintCost(hintType: HintType["type"]): number {
  const hint = HINT_TYPES.find(h => h.type === hintType);
  return hint?.cost || 0;
}

/**
 * Get hint description
 */
export function getHintDescription(hintType: HintType["type"]): string {
  const hint = HINT_TYPES.find(h => h.type === hintType);
  return hint?.description || "";
}
