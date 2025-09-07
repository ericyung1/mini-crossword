import { 
  CrosswordGrid, 
  CrosswordSlot, 
  CrosswordPuzzle, 
  GenerationOptions, 
  GenerationResult 
} from '@/types/crossword';
import { getWordBank } from '@/lib/wordbank';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getRandomTemplate, getTemplateById } from '@/lib/templates';

/**
 * Advanced crossword generator using MRV heuristic and forward checking
 * Implements constraint satisfaction with backtracking
 */
export class CrosswordGenerator {
  private wordBank = getWordBank();
  private usedWords = new Set<string>();
  private maxAttempts = 1000;
  private timeoutMs = 5000;
  
  constructor() {}
  
  /**
   * Generate a complete crossword puzzle
   */
  async generate(options: GenerationOptions = {}): Promise<GenerationResult> {
    const startTime = performance.now();
    const { seed, templateId, maxAttempts = 1000, timeoutMs = 5000 } = options;
    
    this.maxAttempts = maxAttempts;
    this.timeoutMs = timeoutMs;
    
    // Ensure word bank is initialized
    await this.wordBank.initialize();
    
    let attempts = 0;
    let lastError = '';
    
    while (attempts < this.maxAttempts) {
      const attemptStart = performance.now();
      
      // Check timeout
      if (performance.now() - startTime > this.timeoutMs) {
        return {
          success: false,
          error: 'Generation timeout exceeded',
          attempts,
          duration: performance.now() - startTime
        };
      }
      
      attempts++;
      this.usedWords.clear();
      
      try {
        // Select template
        const template = templateId ? 
          getTemplateById(templateId) : 
          getRandomTemplate(seed ? seed + attempts : undefined);
          
        if (!template) {
          lastError = `Template ${templateId} not found`;
          continue;
        }
        
        // Build grid structure
        const grid = GridAnalyzer.buildGrid(template);
        
        // Attempt to fill the grid
        const success = await this.fillGrid(grid, attemptStart);
        
        if (success) {
          const puzzle = this.buildPuzzleResult(grid, template.id, seed);
          return {
            success: true,
            puzzle,
            attempts,
            duration: performance.now() - startTime
          };
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Generation attempt ${attempts} failed:`, lastError);
      }
    }
    
    return {
      success: false,
      error: lastError || 'Max attempts exceeded',
      attempts,
      duration: performance.now() - startTime
    };
  }
  
  /**
   * Fill the grid using MRV heuristic with forward checking
   */
  private async fillGrid(grid: CrosswordGrid, startTime: number): Promise<boolean> {
    // Update all slot patterns and candidates
    this.updateAllCandidates(grid);
    
    // Check if any slot has zero candidates (early failure)
    for (const slot of grid.slots) {
      if (!slot.candidates || slot.candidates.length === 0) {
        return false; // Forward checking failure
      }
    }
    
    // Find slot with minimum remaining values (MRV heuristic)
    const targetSlot = this.selectSlotMRV(grid);
    
    if (!targetSlot) {
      return true; // All slots filled successfully
    }
    
    // Try each candidate word for the selected slot
    const candidates = [...(targetSlot.candidates || [])];
    
    // Sort candidates by frequency (higher frequency first) for better solutions
    candidates.sort((a, b) => {
      const aEntry = this.wordBank.getWordsByLength(targetSlot.length as 3|4|5)
        .find(entry => entry.word === a);
      const bEntry = this.wordBank.getWordsByLength(targetSlot.length as 3|4|5)
        .find(entry => entry.word === b);
      return (bEntry?.frequency || 0) - (aEntry?.frequency || 0);
    });
    
    for (const word of candidates) {
      // Check timeout
      if (performance.now() - startTime > 250) { // 250ms per attempt
        return false;
      }
      
      // Skip if word already used (soft constraint)
      if (this.usedWords.has(word)) continue;
      
      // Validate placement
      if (!GridAnalyzer.isValidPlacement(word, targetSlot, grid)) {
        continue;
      }
      
      // Save current state for backtracking
      const savedPatterns = this.saveSlotPatterns(grid);
      
      // Place the word
      GridAnalyzer.placeWord(word, targetSlot, grid);
      this.usedWords.add(word);
      
      // Recursively fill remaining slots
      const success = await this.fillGrid(grid, startTime);
      
      if (success) {
        return true;
      }
      
      // Backtrack: restore state
      this.restoreSlotPatterns(grid, savedPatterns);
      GridAnalyzer.removeWord(targetSlot, grid);
      this.usedWords.delete(word);
    }
    
    return false; // No valid word found for this slot
  }
  
  /**
   * Select slot with minimum remaining values (MRV heuristic)
   * Tie-breaking: prefer slots with more intersections
   */
  private selectSlotMRV(grid: CrosswordGrid): CrosswordSlot | null {
    let bestSlot: CrosswordSlot | null = null;
    let minCandidates = Infinity;
    let maxIntersections = -1;
    
    for (const slot of grid.slots) {
      // Skip slots that are already filled
      if (slot.pattern.indexOf('?') === -1) continue;
      
      const candidateCount = slot.candidates?.length || 0;
      
      if (candidateCount === 0) {
        // Slot with no candidates - immediate failure
        return slot;
      }
      
      const intersectionCount = GridAnalyzer.getIntersectingSlots(slot, grid.slots).length;
      
      // MRV: prefer slots with fewer candidates
      // Tie-breaking: prefer slots with more intersections
      if (candidateCount < minCandidates || 
          (candidateCount === minCandidates && intersectionCount > maxIntersections)) {
        bestSlot = slot;
        minCandidates = candidateCount;
        maxIntersections = intersectionCount;
      }
    }
    
    return bestSlot;
  }
  
  /**
   * Update candidates for all unfilled slots using forward checking
   */
  private updateAllCandidates(grid: CrosswordGrid): void {
    for (const slot of grid.slots) {
      if (slot.pattern.indexOf('?') !== -1) { // Slot not fully filled
        const candidates = this.wordBank.findWordsMatching({
          length: slot.length,
          pattern: slot.pattern
        });
        
        // Filter candidates that would create valid intersections
        slot.candidates = candidates
          .map(entry => entry.word)
          .filter(word => GridAnalyzer.isValidPlacement(word, slot, grid));
      } else {
        slot.candidates = []; // Slot already filled
      }
    }
  }
  
  /**
   * Save current slot patterns for backtracking
   */
  private saveSlotPatterns(grid: CrosswordGrid): Map<string, string> {
    const patterns = new Map<string, string>();
    for (const slot of grid.slots) {
      patterns.set(slot.id, slot.pattern);
    }
    return patterns;
  }
  
  /**
   * Restore slot patterns from saved state
   */
  private restoreSlotPatterns(grid: CrosswordGrid, savedPatterns: Map<string, string>): void {
    for (const slot of grid.slots) {
      const savedPattern = savedPatterns.get(slot.id);
      if (savedPattern) {
        slot.pattern = savedPattern;
        
        // Update grid cells to match pattern
        for (let i = 0; i < slot.cells.length; i++) {
          const cell = slot.cells[i];
          const letter = savedPattern[i];
          grid.cells[cell.row][cell.col].letter = letter === '?' ? undefined : letter;
        }
      }
    }
  }
  
  /**
   * Build the final puzzle result
   */
  private buildPuzzleResult(grid: CrosswordGrid, templateId: string, seed?: number): CrosswordPuzzle {
    const size = 5;
    const letterGrid: string[][] = [];
    
    // Build letter grid
    for (let row = 0; row < size; row++) {
      letterGrid[row] = [];
      for (let col = 0; col < size; col++) {
        const cell = grid.cells[row][col];
        letterGrid[row][col] = cell.type === '#' ? '#' : (cell.letter || '');
      }
    }
    
    // Build across entries
    const across = grid.acrossSlots.map(slot => ({
      num: slot.number,
      answer: slot.pattern.toUpperCase(),
      row: slot.startRow,
      col: slot.startCol,
      length: slot.length,
      pattern: slot.pattern
    }));
    
    // Build down entries  
    const down = grid.downSlots.map(slot => ({
      num: slot.number,
      answer: slot.pattern.toUpperCase(),
      row: slot.startRow,
      col: slot.startCol,
      length: slot.length,
      pattern: slot.pattern
    }));
    
    return {
      grid: letterGrid,
      across,
      down,
      meta: {
        templateId,
        seed,
        generationTime: Date.now()
      }
    };
  }
}

// Singleton instance
let generatorInstance: CrosswordGenerator | null = null;

/**
 * Get the singleton CrosswordGenerator instance
 */
export function getCrosswordGenerator(): CrosswordGenerator {
  if (!generatorInstance) {
    generatorInstance = new CrosswordGenerator();
  }
  return generatorInstance;
}
