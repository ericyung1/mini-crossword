import { CrosswordMask, CrosswordSlot, CrosswordGrid, GridCell } from '@/types/crossword';
import { WordEntry } from '@/types/wordbank';
import { getWordBank } from './wordbank';
import { generateCluesForPuzzle } from './openai-clues';
import { getWordHistory } from './word-history';

/**
 * Advanced Crossword Generator using Backtracking with Constraint Satisfaction
 * 
 * Algorithm Overview:
 * 1. Slot Detection: Extract all word slots from template
 * 2. Constraint Ordering: Sort slots by difficulty (most constrained first)
 * 3. Backtracking Search: Place words while maintaining consistency
 * 4. Intersection Validation: Ensure crossing words share correct letters
 * 5. Frequency Optimization: Prefer higher frequency words for better puzzles
 * 6. Word History: Prevent repetition across recent puzzles
 * 7. Alphabet Randomization: Ensure diverse starting letters
 */

export interface GeneratedCrossword {
  grid: GridCell[][];
  slots: CrosswordSlot[];
  acrossSlots: CrosswordSlot[];
  downSlots: CrosswordSlot[];
  words: Array<{
    slot: CrosswordSlot;
    word: string;
    clue?: string;
  }>;
  templateId: string;
  generationTime: number;
}

export class CrosswordGenerator {
  private wordBank = getWordBank();
  private maxAttempts = 1000;
  private maxBacktracks = 50;

  /**
   * Generate a complete crossword puzzle from a template
   */
  async generateCrossword(template: CrosswordMask, generateClues = true): Promise<GeneratedCrossword> {
    const startTime = performance.now();
    
    // Ensure word bank is initialized
    await this.wordBank.initialize();
    
    // Step 1: Extract all word slots from template
    const slots = this.extractSlots(template);
    
    // Step 2: Initialize grid
    const grid = this.initializeGrid(template);
    
    // Step 3: Sort slots by constraint level (Most Constrained Variable heuristic)
    const sortedSlots = this.sortSlotsByConstraints(slots);
    
    // Step 4: Attempt to fill grid using backtracking
    const solution = await this.backtrackFill(grid, sortedSlots, new Map());
    
    if (!solution) {
      throw new Error(`Failed to generate crossword for template ${template.id} after ${this.maxAttempts} attempts`);
    }
    
    const { filledGrid, wordPlacements } = solution;
    
    // Step 5: Generate clues if requested
    let clueMap = new Map<string, string>();
    if (generateClues) {
      const wordsForClues = Array.from(wordPlacements.entries()).map(([slotId, word]) => {
        const slot = slots.find(s => s.id === slotId)!;
        return { word, direction: slot.direction };
      });
      clueMap = await generateCluesForPuzzle(wordsForClues);
    }
    
    const words = Array.from(wordPlacements.entries()).map(([slotId, word]) => {
      const slot = slots.find(s => s.id === slotId)!;
      return {
        slot,
        word,
        clue: generateClues ? clueMap.get(word) : undefined
      };
    });
    
    const generationTime = performance.now() - startTime;

    // Step 6: Track words in history to prevent repetition
    const wordHistory = getWordHistory();
    const puzzleId = `${template.id}-${Date.now()}`;
    const usedWords = Array.from(wordPlacements.values());
    wordHistory.addPuzzleWords(usedWords, puzzleId);
    
    return {
      grid: filledGrid,
      slots,
      acrossSlots: slots.filter(s => s.direction === 'across'),
      downSlots: slots.filter(s => s.direction === 'down'),
      words,
      templateId: template.id,
      generationTime: Math.round(generationTime * 100) / 100
    };
  }

  /**
   * Extract all word slots (across and down) from a crossword template
   * Uses proper crossword numbering - each starting position gets a number
   */
  private extractSlots(template: CrosswordMask): CrosswordSlot[] {
    const slots: CrosswordSlot[] = [];
    const numberedPositions = new Map<string, number>();
    let clueNumber = 1;
    
    // First pass: identify all starting positions and assign numbers
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (template.grid[row][col] === '.') {
          let needsNumber = false;
          
          // Check if this starts an across word (3+ letters)
          if (col === 0 || template.grid[row][col - 1] === '#') {
            let acrossLength = 0;
            for (let c = col; c < 5 && template.grid[row][c] === '.'; c++) {
              acrossLength++;
            }
            if (acrossLength >= 3) needsNumber = true;
          }
          
          // Check if this starts a down word (3+ letters)
          if (row === 0 || template.grid[row - 1][col] === '#') {
            let downLength = 0;
            for (let r = row; r < 5 && template.grid[r][col] === '.'; r++) {
              downLength++;
            }
            if (downLength >= 3) needsNumber = true;
          }
          
          if (needsNumber) {
            numberedPositions.set(`${row}-${col}`, clueNumber++);
          }
        }
      }
    }
    
    // Second pass: create slots using the numbered positions
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const posKey = `${row}-${col}`;
        const number = numberedPositions.get(posKey);
        
        if (number && template.grid[row][col] === '.') {
          // Check for across slot starting here
          if (col === 0 || template.grid[row][col - 1] === '#') {
            const cells: Array<{ row: number; col: number }> = [];
            for (let c = col; c < 5 && template.grid[row][c] === '.'; c++) {
              cells.push({ row, col: c });
            }
            
            if (cells.length >= 3) {
              slots.push({
                id: `${number}A`,
                direction: 'across',
                startRow: row,
                startCol: col,
                length: cells.length,
                cells: [...cells], // Create a copy
                number,
                pattern: '?'.repeat(cells.length),
                candidates: []
              });
            }
          }
          
          // Check for down slot starting here
          if (row === 0 || template.grid[row - 1][col] === '#') {
            const cells: Array<{ row: number; col: number }> = [];
            for (let r = row; r < 5 && template.grid[r][col] === '.'; r++) {
              cells.push({ row: r, col });
            }
            
            if (cells.length >= 3) {
              slots.push({
                id: `${number}D`,
                direction: 'down',
                startRow: row,
                startCol: col,
                length: cells.length,
                cells: [...cells], // Create a copy
                number,
                pattern: '?'.repeat(cells.length),
                candidates: []
              });
            }
          }
        }
      }
    }
    
    return slots;
  }

  /**
   * Initialize grid with black and white cells from template
   */
  private initializeGrid(template: CrosswordMask): GridCell[][] {
    return template.grid.map(row => 
      row.map(cell => ({
        type: cell,
        letter: undefined,
        number: undefined
      }))
    );
  }

  /**
   * Sort slots by constraint level - Most Constrained Variable (MCV) heuristic
   * Prioritizes slots with fewer available word candidates
   */
  private sortSlotsByConstraints(slots: CrosswordSlot[]): CrosswordSlot[] {
    // Calculate initial candidates for each slot
    const slotsWithCandidates = slots.map(slot => {
      const candidates = this.wordBank.findWordsMatching({
        length: slot.length,
        pattern: slot.pattern
      });
      
      return {
        ...slot,
        candidates: candidates.slice(0, 100) // Limit for performance
      };
    });
    
    // Sort by number of candidates (ascending) and then by length (descending)
    return slotsWithCandidates.sort((a, b) => {
      const candidateDiff = a.candidates!.length - b.candidates!.length;
      if (candidateDiff !== 0) return candidateDiff;
      return b.length - a.length; // Prefer longer words for tie-breaking
    });
  }

  /**
   * Backtracking algorithm to fill the crossword grid with randomized word selection
   * Uses Constraint Satisfaction with forward checking and alphabet diversity
   */
  private async backtrackFill(
    grid: GridCell[][],
    slots: CrosswordSlot[],
    assignments: Map<string, string>,
    slotIndex = 0,
    backtrackCount = 0
  ): Promise<{ filledGrid: GridCell[][]; wordPlacements: Map<string, string> } | null> {
    
    // Base case: all slots filled
    if (slotIndex >= slots.length) {
      return {
        filledGrid: grid.map(row => row.map(cell => ({ ...cell }))),
        wordPlacements: new Map(assignments)
      };
    }
    
    // Prevent infinite backtracking
    if (backtrackCount > this.maxBacktracks) {
      return null;
    }
    
    const currentSlot = slots[slotIndex];
    
    // Safety check: ensure slot has required properties
    if (!currentSlot || !currentSlot.cells || currentSlot.cells.length === 0) {
      console.error('Invalid slot at index', slotIndex, currentSlot);
      return null;
    }
    
    const currentPattern = this.getSlotPattern(grid, currentSlot);
    
    // Get candidate words that match current pattern
    const allCandidates = this.wordBank.findWordsMatching({
      length: currentSlot.length,
      pattern: currentPattern
    });
    
    // Filter out recently used words to ensure variety
    const wordHistory = getWordHistory();
    const freshCandidates = wordHistory.filterRecentWords(allCandidates, 10);
    
    // Use fresh candidates if available, otherwise fall back to all candidates
    const baseCandidates = freshCandidates.length > 0 ? freshCandidates : allCandidates;
    
    // Diversify word selection for better alphabet coverage
    const diversifiedCandidates = this.diversifyWordSelection(baseCandidates, 50);
    
    // Try each candidate word
    for (const candidate of diversifiedCandidates) {
      const word = candidate.word.toLowerCase();
      
      // Skip if word already used
      if (Array.from(assignments.values()).includes(word)) {
        continue;
      }
      
      // Check if word placement is valid (intersections)
      if (this.isValidPlacement(grid, currentSlot, word, assignments)) {
        // Place the word
        this.placeWord(grid, currentSlot, word);
        assignments.set(currentSlot.id, word);
        
        // Recursively try to fill remaining slots
        const result = await this.backtrackFill(
          grid, 
          slots, 
          assignments, 
          slotIndex + 1, 
          backtrackCount
        );
        
        if (result) {
          return result;
        }
        
        // Backtrack: remove the word
        this.removeWord(grid, currentSlot, assignments, slots);
        assignments.delete(currentSlot.id);
      }
    }
    
    // No valid word found, backtrack
    if (slotIndex === 0) {
      // Can't backtrack further, no solution found
      return null;
    }
    
    return await this.backtrackFill(
      grid, 
      slots, 
      assignments, 
      slotIndex - 1, 
      backtrackCount + 1
    );
  }

  /**
   * Diversify word selection for better alphabet coverage
   * Mixes high-frequency words with random selections for variety
   */
  private diversifyWordSelection<T extends { word: string; frequency: number }>(
    candidates: T[], 
    maxCandidates = 50
  ): T[] {
    if (candidates.length <= maxCandidates) {
      return this.shuffleArray([...candidates]);
    }

    // Strategy: Mix high-frequency words with random selections for diversity
    const sortedByFreq = [...candidates].sort((a, b) => b.frequency - a.frequency);
    
    // Take top 30% for quality, but shuffle them
    const topTier = this.shuffleArray(sortedByFreq.slice(0, Math.floor(candidates.length * 0.3)));
    
    // Take random 70% from remaining for diversity
    const remaining = sortedByFreq.slice(Math.floor(candidates.length * 0.3));
    const randomTier = this.shuffleArray(remaining).slice(0, maxCandidates - topTier.length);
    
    // Combine and shuffle the final selection
    return this.shuffleArray([...topTier, ...randomTier]).slice(0, maxCandidates);
  }

  /**
   * Fisher-Yates shuffle algorithm for true randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get current pattern for a slot based on grid state
   */
  private getSlotPattern(grid: GridCell[][], slot: CrosswordSlot): string {
    return slot.cells
      .map(({ row, col }) => grid[row][col].letter || '?')
      .join('');
  }

  /**
   * Check if placing a word in a slot creates valid intersections
   */
  private isValidPlacement(
    grid: GridCell[][],
    slot: CrosswordSlot,
    word: string,
    assignments: Map<string, string>
  ): boolean {
    for (let i = 0; i < slot.cells.length; i++) {
      const { row, col } = slot.cells[i];
      const letter = word[i].toLowerCase();
      const currentLetter = grid[row][col].letter;
      
      // If cell already has a letter, it must match exactly
      if (currentLetter && currentLetter.toLowerCase() !== letter) {
        return false;
      }
      
      // Additional validation: check bounds
      if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        return false;
      }
      
      // Make sure we're not placing in a black cell
      if (grid[row][col].type === '#') {
        return false;
      }
    }
    return true;
  }

  /**
   * Place a word in the grid
   */
  private placeWord(grid: GridCell[][], slot: CrosswordSlot, word: string): void {
    slot.cells.forEach(({ row, col }, index) => {
      grid[row][col].letter = word[index].toLowerCase();
      if (index === 0) {
        grid[row][col].number = slot.number;
      }
    });
  }

  /**
   * Remove a word from the grid (but preserve intersecting letters from other words)
   */
  private removeWord(grid: GridCell[][], slot: CrosswordSlot, assignments: Map<string, string>, allSlots: CrosswordSlot[]): void {
    slot.cells.forEach(({ row, col }, index) => {
      // Check if this cell is part of another placed word
      const isPartOfOtherWord = allSlots.some(otherSlot => {
        if (otherSlot.id === slot.id) return false; // Skip the current slot
        if (!assignments.has(otherSlot.id)) return false; // Skip unplaced words
        
        return otherSlot.cells.some(cell => cell.row === row && cell.col === col);
      });
      
      // Only remove letter if it's not part of another placed word
      if (!isPartOfOtherWord) {
        grid[row][col].letter = undefined;
      }
      
      // Only remove number if this is the starting cell and no other word starts here
      if (index === 0) {
        const otherWordStartsHere = allSlots.some(otherSlot => {
          if (otherSlot.id === slot.id) return false;
          if (!assignments.has(otherSlot.id)) return false;
          return otherSlot.startRow === row && otherSlot.startCol === col;
        });
        
        if (!otherWordStartsHere) {
          grid[row][col].number = undefined;
        }
      }
    });
  }
}

// Export singleton instance
let generatorInstance: CrosswordGenerator | null = null;

export function getCrosswordGenerator(): CrosswordGenerator {
  if (!generatorInstance) {
    generatorInstance = new CrosswordGenerator();
  }
  return generatorInstance;
}
