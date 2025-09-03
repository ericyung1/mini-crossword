import { describe, it, expect } from "vitest";

import { generatePuzzle } from "@/lib/generator";
import { validatePuzzleStructure, isPuzzleSolved, cellsForClue } from "@/lib/validation";
import { isValidWord } from "@/lib/wordbank";

describe("Puzzle Generator", () => {
  describe("generatePuzzle", () => {
    it("produces a valid 5×5 puzzle", () => {
      const puzzle = generatePuzzle("test-seed-1");
      
      // Check basic structure
      expect(puzzle.size).toBe(5);
      expect(puzzle.grid).toHaveLength(5);
      expect(puzzle.grid[0]).toHaveLength(5);
      expect(puzzle.seed).toBe("test-seed-1");
      expect(puzzle.id).toContain("test-seed-1");
      
      // Validate structure
      const validation = validatePuzzleStructure(puzzle);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }, 10000); // 10 second timeout

    it("generates same puzzle for same seed", () => {
      const seed = "deterministic-test";
      const puzzle1 = generatePuzzle(seed);
      const puzzle2 = generatePuzzle(seed);
      
      // Should have identical structure
      expect(puzzle1.seed).toBe(puzzle2.seed);
      expect(puzzle1.grid).toEqual(puzzle2.grid);
      expect(puzzle1.clues).toEqual(puzzle2.clues);
      
      // Check that solutions are identical
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          expect(puzzle1.grid[row][col].solution).toBe(puzzle2.grid[row][col].solution);
          expect(puzzle1.grid[row][col].isBlock).toBe(puzzle2.grid[row][col].isBlock);
          expect(puzzle1.grid[row][col].number).toBe(puzzle2.grid[row][col].number);
        }
      }
    }, 10000);

    it("generates different puzzles for different seeds", () => {
      const puzzle1 = generatePuzzle("seed-1");
      const puzzle2 = generatePuzzle("seed-2");
      
      // Should have different IDs and seeds
      expect(puzzle1.seed).not.toBe(puzzle2.seed);
      expect(puzzle1.id).not.toBe(puzzle2.id);
      
      // Should have valid structures
      expect(puzzle1.size).toBe(5);
      expect(puzzle2.size).toBe(5);
      expect(puzzle1.clues.across.length + puzzle1.clues.down.length).toBeGreaterThan(0);
      expect(puzzle2.clues.across.length + puzzle2.clues.down.length).toBeGreaterThan(0);
    }, 10000);

    it("ensures all crossings match", () => {
      const puzzle = generatePuzzle("crossing-test");
      
      // Check every intersection between across and down clues
      for (const acrossClue of puzzle.clues.across) {
        const acrossCells = cellsForClue(puzzle, acrossClue);
        
        for (const downClue of puzzle.clues.down) {
          const downCells = cellsForClue(puzzle, downClue);
          
          // Find intersection
          for (let i = 0; i < acrossCells.length; i++) {
            const acrossCell = acrossCells[i];
            
            for (let j = 0; j < downCells.length; j++) {
              const downCell = downCells[j];
              
              // If cells are at same position, they must have same solution
              if (acrossCell.row === downCell.row && acrossCell.col === downCell.col) {
                expect(acrossCell.solution).toBe(downCell.solution);
                expect(acrossCell.solution).toBeDefined();
                expect(acrossCell.solution).not.toBe("");
              }
            }
          }
        }
      }
    });

    it("has no 1-letter entries", () => {
      const puzzle = generatePuzzle("no-single-letters");
      
      // Check all clues have length >= 2
      for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
        expect(clue.length).toBeGreaterThanOrEqual(2);
        expect(clue.answer.length).toBeGreaterThanOrEqual(2);
        expect(clue.answer.length).toBe(clue.length);
      }
    }, 10000);

    it("uses valid words from word bank", () => {
      const puzzle = generatePuzzle("valid-words-test");
      
      // Check all answers are valid words
      for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
        expect(isValidWord(clue.answer)).toBe(true);
      }
    }, 10000);

    it("has properly numbered cells", () => {
      const puzzle = generatePuzzle("numbering-test");
      
      // Collect all numbered cells
      const numberedCells: Array<{ row: number; col: number; number: number }> = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = puzzle.grid[row][col];
          if (cell.number) {
            numberedCells.push({ row, col, number: cell.number });
          }
        }
      }
      
      // Numbers should be sequential starting from 1
      numberedCells.sort((a, b) => a.number - b.number);
      for (let i = 0; i < numberedCells.length; i++) {
        expect(numberedCells[i].number).toBe(i + 1);
      }
      
      // Each numbered cell should correspond to at least one clue
      for (const numberedCell of numberedCells) {
        const hasAcrossClue = puzzle.clues.across.some(clue => 
          clue.number === numberedCell.number &&
          clue.start.row === numberedCell.row &&
          clue.start.col === numberedCell.col
        );
        
        const hasDownClue = puzzle.clues.down.some(clue => 
          clue.number === numberedCell.number &&
          clue.start.row === numberedCell.row &&
          clue.start.col === numberedCell.col
        );
        
        expect(hasAcrossClue || hasDownClue).toBe(true);
      }
    });

    it("has all cells properly filled", () => {
      const puzzle = generatePuzzle("filled-test");
      
      // All non-block cells should have solutions
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = puzzle.grid[row][col];
          if (!cell.isBlock) {
            expect(cell.solution).toBeDefined();
            expect(cell.solution).toMatch(/^[A-Z]$/);
            expect(cell.guess).toBe(""); // Should start empty
          }
        }
      }
    });

    it("creates unique clue IDs", () => {
      const puzzle = generatePuzzle("unique-ids-test");
      
      const allClues = [...puzzle.clues.across, ...puzzle.clues.down];
      const clueIds = allClues.map(clue => clue.id);
      const uniqueIds = new Set(clueIds);
      
      expect(uniqueIds.size).toBe(clueIds.length);
    });

    it("handles different pattern types", () => {
      // Test multiple seeds to ensure we get different patterns
      const seeds = ["pattern-1", "pattern-2", "pattern-3", "pattern-4", "pattern-5"];
      const puzzles = seeds.map(seed => generatePuzzle(seed));
      
      // All should be valid
      for (const puzzle of puzzles) {
        const validation = validatePuzzleStructure(puzzle);
        expect(validation.isValid).toBe(true);
      }
      
      // Should have some variety in block placement
      const blockPatterns = puzzles.map(puzzle => 
        puzzle.grid.map(row => row.map(cell => cell.isBlock))
      );
      
      // Not all patterns should be identical (very unlikely with 8 different patterns)
      let hasVariation = false;
      for (let i = 1; i < blockPatterns.length; i++) {
        if (JSON.stringify(blockPatterns[0]) !== JSON.stringify(blockPatterns[i])) {
          hasVariation = true;
          break;
        }
      }
      expect(hasVariation).toBe(true);
    });

    it("maintains grid consistency", () => {
      const puzzle = generatePuzzle("consistency-test");
      
      // Verify each clue's cells match the grid
      for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
        const cells = cellsForClue(puzzle, clue);
        
        expect(cells).toHaveLength(clue.length);
        
        // Build word from cells
        const wordFromCells = cells.map(cell => cell.solution).join("");
        expect(wordFromCells).toBe(clue.answer);
        
        // Check position consistency
        for (let i = 0; i < cells.length; i++) {
          const expectedRow = clue.direction === "DOWN" ? clue.start.row + i : clue.start.row;
          const expectedCol = clue.direction === "ACROSS" ? clue.start.col + i : clue.start.col;
          
          expect(cells[i].row).toBe(expectedRow);
          expect(cells[i].col).toBe(expectedCol);
          expect(cells[i].isBlock).toBe(false);
        }
      }
    });
  });
});
