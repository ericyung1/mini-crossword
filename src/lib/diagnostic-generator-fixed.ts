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
      const grid = GridAnalyzer.buildGrid(simpleTemplate);
      console.log(`🏗️ Fixed diagnostic grid built with ${grid.slots.length} slots`);
      
      // Log slot details
      for (const slot of grid.slots) {
        console.log(`   Slot ${slot.id}: ${slot.direction} ${slot.length} letters at (${slot.startRow},${slot.startCol})`);
      }
      
      // Verify we have exactly 2 slots
      if (grid.slots.length !== 2) {
        throw new Error(`Expected 2 slots, got ${grid.slots.length}`);
      }
      
      this.usedWords.clear();
      this.logCount = 0;
      
      // Attempt to fill the grid
      const success = await this.fillGridDiagnostic(grid);
      
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
        console.log(`❌ FIXED DIAGNOSTIC Generation failed`);
        return {
          success: false,
          error: 'Fixed diagnostic generation failed',
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
   * Fill grid with extensive logging for diagnosis
   */
  private async fillGridDiagnostic(grid: CrosswordGrid): Promise<boolean> {
    this.logCount++;
    
    console.log(`🔍 [${this.logCount}] fillGridDiagnostic called`);

    // Update all slot patterns and candidates
    console.log(`🔄 [${this.logCount}] Updating candidates...`);
    this.updateAllCandidates(grid);
    
    // Log current state
    for (const slot of grid.slots) {
      console.log(`   Slot ${slot.id}: pattern="${slot.pattern}" candidates=${slot.candidates?.length || 0}`);
      if (slot.candidates && slot.candidates.length > 0) {
        console.log(`      First 5: ${slot.candidates.slice(0, 5).join(', ')}`);
      }
    }
    
    // Check if any slot has zero candidates (early failure)
    for (const slot of grid.slots) {
      if (!slot.candidates || slot.candidates.length === 0) {
        console.log(`❌ [${this.logCount}] Slot ${slot.id} has no candidates (pattern: ${slot.pattern})`);
        return false;
      }
    }
    
    // Find slot with minimum remaining values (MRV heuristic)
    const targetSlot = this.selectSlotMRV(grid);
    
    if (!targetSlot) {
      console.log(`✅ [${this.logCount}] All slots filled successfully`);
      return true;
    }
    
    console.log(`🎯 [${this.logCount}] Selected slot ${targetSlot.id} (${targetSlot.candidates?.length || 0} candidates)`);
    
    // Try candidates (limit to 5 for debugging)
    const candidates = [...(targetSlot.candidates || [])].slice(0, 5);
    
    console.log(`🔍 [${this.logCount}] Trying candidates: ${candidates.join(', ')}`);
    
    for (const word of candidates) {
      // Skip if word already used
      if (this.usedWords.has(word)) {
        console.log(`⏭️ [${this.logCount}] Skipping already used word: ${word}`);
        continue;
      }
      
      // Validate placement
      if (!GridAnalyzer.isValidPlacement(word, targetSlot, grid)) {
        console.log(`❌ [${this.logCount}] Invalid placement for word: ${word}`);
        continue;
      }
      
      console.log(`✅ [${this.logCount}] Trying word: ${word}`);
      
      // Save current state for backtracking
      const savedPatterns = this.saveSlotPatterns(grid);
      
      // Place the word
      GridAnalyzer.placeWord(word, targetSlot, grid);
      this.usedWords.add(word);
      
      console.log(`📝 [${this.logCount}] Placed word: ${word}`);
      
      // Prevent infinite recursion by limiting depth
      if (this.logCount > 10) {
        console.log(`⚠️ [${this.logCount}] Stopping at depth 10 to prevent infinite recursion`);
        this.restoreSlotPatterns(grid, savedPatterns);
        GridAnalyzer.removeWord(targetSlot, grid);
        this.usedWords.delete(word);
        return false;
      }
      
      // Recursively fill remaining slots
      const success = await this.fillGridDiagnostic(grid);
      
      if (success) {
        return true;
      }
      
      console.log(`🔙 [${this.logCount}] Backtracking from word: ${word}`);
      
      // Backtrack: restore state
      this.restoreSlotPatterns(grid, savedPatterns);
      GridAnalyzer.removeWord(targetSlot, grid);
      this.usedWords.delete(word);
    }
    
    console.log(`❌ [${this.logCount}] No valid word found for slot ${targetSlot.id}`);
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
