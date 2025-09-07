import { 
  CrosswordGrid, 
  CrosswordSlot, 
  CrosswordPuzzle, 
  GenerationResult 
} from '@/types/crossword';
import { getWordBank } from '@/lib/wordbank';
import { GridAnalyzer } from '@/lib/grid-analyzer';

/**
 * FIXED Diagnostic generator with the simplest possible template
 * Just 2 slots with 1 intersection to test algorithm logic
 */
export class DiagnosticGeneratorFixed {
  private wordBank = getWordBank();
  private usedWords = new Set<string>();
  private logCount = 0;
  
  constructor() {}
  
  async generateDiagnostic(): Promise<GenerationResult> {
    const startTime = performance.now();
    
    console.log(`🔬 Starting FIXED DIAGNOSTIC generation with simplest template`);
    
    // Ensure word bank is initialized
    await this.wordBank.initialize();
    
    try {
      // Create the SIMPLEST possible template: 2 slots, 1 intersection
      const simpleTemplate = {
        id: 'diagnostic-fixed',
        name: 'Diagnostic Fixed',
        description: 'Simplest: 1 across (3 letters) + 1 down (3 letters) + 1 intersection',
        grid: [
          ['.', '.', '.', '#', '#'],  // 3-letter across word (row 0, cols 0-2)
          ['.', '#', '#', '#', '#'],  // 1st letter of down word (row 1, col 0)
          ['.', '#', '#', '#', '#'],  // 2nd letter of down word (row 2, col 0)
          ['#', '#', '#', '#', '#'],  // All black
          ['#', '#', '#', '#', '#']   // All black
        ]
      };
      
      console.log(`📋 Using fixed diagnostic template`);
      console.log(`📐 Template creates:`);
      console.log(`   - 1 across slot: (0,0) to (0,2) - 3 letters`);
      console.log(`   - 1 down slot: (0,0) to (2,0) - 3 letters`);
      console.log(`   - 1 intersection: at (0,0)`);
      
      // Build grid structure
      console.log(`🏗️ Building grid from template:`, simpleTemplate.grid);
      let grid;
      try {
        grid = GridAnalyzer.buildGrid(simpleTemplate);
        console.log(`🏗️ Fixed diagnostic grid built with ${grid.slots.length} slots`);
      } catch (error) {
        console.error(`💥 Error building grid:`, error);
        throw error;
      }
      
      // Log slot details
      for (const slot of grid.slots) {
        console.log(`   Slot ${slot.id}: ${slot.direction} ${slot.length} letters at (${slot.startRow},${slot.startCol})`);
        console.log(`   Slot ${slot.id} cells:`, slot.cells);
      }
      
      // Log grid cells
      console.log(`🔍 Grid cells state:`);
      for (let row = 0; row < 5; row++) {
        const rowStr = grid.cells[row].map(cell => cell.type).join(' ');
        console.log(`   Row ${row}: ${rowStr}`);
      }
      
      // Verify we have exactly 2 slots
      if (grid.slots.length !== 2) {
        throw new Error(`Expected 2 slots, got ${grid.slots.length}`);
      }
      
      this.usedWords.clear();
      this.logCount = 0;
      
      // Attempt to fill the grid
      console.log(`🚀 Starting fillGridDiagnostic...`);
      let success;
      try {
        success = await this.fillGridDiagnostic(grid);
        console.log(`🏁 fillGridDiagnostic completed, success: ${success}`);
      } catch (error) {
        console.error(`💥 Error in fillGridDiagnostic:`, error);
        return {
          success: false,
          error: `fillGridDiagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          attempts: 1,
          duration: performance.now() - startTime
        };
      }
      
      if (success) {
        console.log(`✅ FIXED DIAGNOSTIC Generation successful!`);
        const puzzle = this.buildPuzzleResult(grid, simpleTemplate.id);
        return {
          success: true,
          puzzle,
          attempts: 1,
          duration: performance.now() - startTime
        };
      } else {
        console.log(`❌ FIXED DIAGNOSTIC Generation failed - no valid solution found`);
        return {
          success: false,
          error: 'Fixed diagnostic generation failed - no valid solution found',
          attempts: 1,
          duration: performance.now() - startTime
        };
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`💥 FIXED DIAGNOSTIC Generation error:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        attempts: 1,
        duration: performance.now() - startTime
      };
    }
  }
  
  /**
   * Fill grid with simple brute force approach (like the working simple-two-slot)
   */
  private async fillGridDiagnostic(grid: CrosswordGrid): Promise<boolean> {
    console.log(`🔍 SIMPLIFIED: Using brute force approach like simple-two-slot`);
    
    // For 2-slot puzzle, just try first valid combination
    const acrossSlot = grid.slots.find(s => s.direction === 'across');
    const downSlot = grid.slots.find(s => s.direction === 'down');
    
    if (!acrossSlot || !downSlot) {
      console.log(`❌ Missing slots: across=${!!acrossSlot}, down=${!!downSlot}`);
      return false;
    }
    
    console.log(`📐 Filling across slot ${acrossSlot.id} first...`);
    
    // Get candidates for across slot
    const acrossCandidates = this.wordBank.findWordsMatching({
      length: acrossSlot.length,
      pattern: acrossSlot.pattern.toLowerCase()
    });
    
    console.log(`🔍 Across candidates: ${acrossCandidates.length}`);
    
    // Try first 10 across candidates
    for (let i = 0; i < Math.min(10, acrossCandidates.length); i++) {
      const acrossWord = acrossCandidates[i].word;
      console.log(`\n🧪 [${i+1}] Trying across word: "${acrossWord}"`);
      
      // Place across word
      GridAnalyzer.placeWord(acrossWord, acrossSlot, grid);
      console.log(`   After placing "${acrossWord}": down pattern = "${downSlot.pattern}"`);
      
      // Get candidates for down slot
      const downCandidates = this.wordBank.findWordsMatching({
        length: downSlot.length,
        pattern: downSlot.pattern.toLowerCase()
      });
      
      console.log(`   Down candidates: ${downCandidates.length}`);
      
      if (downCandidates.length > 0) {
        // Try first down candidate
        const downWord = downCandidates[0].word;
        console.log(`   Trying down word: "${downWord}"`);
        
        // Check if valid
        const isValid = GridAnalyzer.isValidPlacement(downWord, downSlot, grid);
        console.log(`   "${downWord}" valid: ${isValid}`);
        
        if (isValid) {
          // Place it
          GridAnalyzer.placeWord(downWord, downSlot, grid);
          
          console.log(`✅ SOLUTION FOUND!`);
          console.log(`   Across: "${acrossWord}" at (${acrossSlot.startRow},${acrossSlot.startCol})`);
          console.log(`   Down: "${downWord}" at (${downSlot.startRow},${downSlot.startCol})`);
          
          return true;
        }
      }
      
      // Backtrack: remove across word
      console.log(`   Backtracking from "${acrossWord}"`);
      GridAnalyzer.removeWord(acrossSlot, grid);
    }
    
    console.log(`❌ No solution found in first 10 attempts`);
    return false;
  }
  
  /**
   * Select slot with minimum remaining values (MRV heuristic)
   */
  private selectSlotMRV(grid: CrosswordGrid): CrosswordSlot | null {
    let bestSlot: CrosswordSlot | null = null;
    let minCandidates = Infinity;
    
    for (const slot of grid.slots) {
      // Skip slots that are already filled
      if (slot.pattern.indexOf('?') === -1) continue;
      
      const candidateCount = slot.candidates?.length || 0;
      
      if (candidateCount === 0) {
        // Slot with no candidates - immediate failure
        return slot;
      }
      
      if (candidateCount < minCandidates) {
        bestSlot = slot;
        minCandidates = candidateCount;
      }
    }
    
    return bestSlot;
  }
  
  /**
   * Update candidates for all unfilled slots
   */
  private updateAllCandidates(grid: CrosswordGrid): void {
    console.log(`🔄 updateAllCandidates called`);
    for (const slot of grid.slots) {
      if (slot.pattern.indexOf('?') !== -1) { // Slot not fully filled
        console.log(`   Finding candidates for slot ${slot.id} (length=${slot.length}, pattern="${slot.pattern}")`);
        
        try {
          const candidates = this.wordBank.findWordsMatching({
            length: slot.length,
            pattern: slot.pattern.toLowerCase()
          });
          
          console.log(`   Raw candidates found: ${candidates.length}`);
          if (candidates.length > 0) {
            console.log(`   First 5 raw candidates: ${candidates.slice(0, 5).map(e => e.word).join(', ')}`);
          }
          
          // Filter candidates that would create valid intersections
          const validCandidates = candidates
            .map(entry => entry.word)
            .filter(word => {
              const isValid = GridAnalyzer.isValidPlacement(word, slot, grid);
              if (!isValid && candidates.length <= 10) { // Only log for small candidate sets
                console.log(`     Rejected ${word} - invalid placement`);
              }
              return isValid;
            });
          
          slot.candidates = validCandidates;
          console.log(`   Valid candidates after filtering: ${validCandidates.length}`);
          if (validCandidates.length > 0) {
            console.log(`   First 5 valid candidates: ${validCandidates.slice(0, 5).join(', ')}`);
          }
        } catch (error) {
          console.error(`   Error finding candidates for slot ${slot.id}:`, error);
          slot.candidates = [];
        }
      } else {
        slot.candidates = []; // Slot already filled
        console.log(`   Slot ${slot.id} already filled (pattern="${slot.pattern}")`);
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
  private buildPuzzleResult(grid: CrosswordGrid, templateId: string): CrosswordPuzzle {
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
        generationTime: Date.now()
      }
    };
  }
}
