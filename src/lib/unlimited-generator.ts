import { 
  CrosswordGrid, 
  CrosswordSlot, 
  CrosswordPuzzle, 
  GenerationResult 
} from '@/types/crossword';
import { getWordBank } from '@/lib/wordbank';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getTemplateById } from '@/lib/templates';

/**
 * Unlimited crossword generator for testing - NO TIMEOUTS OR LIMITS
 * This will help determine if the algorithm can ever complete or is truly stuck
 */
export class UnlimitedGenerator {
  private wordBank = getWordBank();
  private usedWords = new Set<string>();
  private recursionDepth = 0;
  private maxRecursionSeen = 0;
  private totalCandidatesChecked = 0;
  
  constructor() {}
  
  async generateUnlimited(): Promise<GenerationResult> {
    const startTime = performance.now();
    
    console.log(`🚀 Starting UNLIMITED generation - no timeouts, no limits!`);
    
    // Reset counters
    this.recursionDepth = 0;
    this.maxRecursionSeen = 0;
    this.totalCandidatesChecked = 0;
    
    // Ensure word bank is initialized
    await this.wordBank.initialize();
    
    let attempts = 0;
    let lastError = '';
    
    // Try up to 100 attempts (but no timeout per attempt)
    while (attempts < 100) {
      const attemptStart = performance.now();
      attempts++;
      this.usedWords.clear();
      
      console.log(`🔄 UNLIMITED Attempt ${attempts}/100`);
      
      try {
        // Use only t1 (open grid) template
        const template = getTemplateById('t1');
          
        if (!template) {
          lastError = `Template t1 not found`;
          console.error(lastError);
          continue;
        }
        
        console.log(`📋 Using template: ${template.name}`);
        
        // Build grid structure
        const grid = GridAnalyzer.buildGrid(template);
        console.log(`🏗️ Grid built with ${grid.slots.length} slots`);
        
        // Reset recursion tracking
        this.recursionDepth = 0;
        this.maxRecursionSeen = 0;
        this.totalCandidatesChecked = 0;
        
        // Attempt to fill the grid - NO TIMEOUT!
        const success = await this.fillGridUnlimited(grid);
        
        const attemptTime = performance.now() - attemptStart;
        console.log(`📊 Attempt ${attempts} stats:`);
        console.log(`   Time: ${attemptTime.toFixed(2)}ms`);
        console.log(`   Max recursion depth: ${this.maxRecursionSeen}`);
        console.log(`   Total candidates checked: ${this.totalCandidatesChecked}`);
        
        if (success) {
          console.log(`✅ UNLIMITED Generation successful!`);
          const puzzle = this.buildPuzzleResult(grid, template.id);
          return {
            success: true,
            puzzle,
            attempts,
            duration: performance.now() - startTime
          };
        } else {
          console.log(`❌ UNLIMITED Attempt ${attempts} failed`);
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`💥 UNLIMITED Generation attempt ${attempts} failed:`, lastError);
      }
    }
    
    console.log(`🚫 All 100 UNLIMITED attempts failed`);
    console.log(`📊 Final stats:`);
    console.log(`   Max recursion depth seen: ${this.maxRecursionSeen}`);
    console.log(`   Total candidates checked: ${this.totalCandidatesChecked}`);
    
    return {
      success: false,
      error: lastError || 'Max attempts exceeded',
      attempts,
      duration: performance.now() - startTime
    };
  }
  
  /**
   * Fill grid with NO TIMEOUT - will run until completion or failure
   */
  private async fillGridUnlimited(grid: CrosswordGrid): Promise<boolean> {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionSeen) {
      this.maxRecursionSeen = this.recursionDepth;
    }
    
    // Log every 1000 recursions to show progress
    if (this.recursionDepth % 1000 === 0) {
      console.log(`🔄 Recursion depth: ${this.recursionDepth}, candidates checked: ${this.totalCandidatesChecked}`);
    }

    // Update all slot patterns and candidates
    this.updateAllCandidates(grid);
    
    // Check if any slot has zero candidates (early failure)
    for (const slot of grid.slots) {
      if (!slot.candidates || slot.candidates.length === 0) {
        console.log(`❌ Slot ${slot.id} has no candidates (pattern: ${slot.pattern})`);
        this.recursionDepth--;
        return false;
      }
    }
    
    // Find slot with minimum remaining values (MRV heuristic)
    const targetSlot = this.selectSlotMRV(grid);
    
    if (!targetSlot) {
      console.log(`✅ All slots filled successfully at depth ${this.recursionDepth}`);
      this.recursionDepth--;
      return true;
    }
    
    if (this.recursionDepth <= 10) { // Only log first 10 levels to avoid spam
      console.log(`🎯 [Depth ${this.recursionDepth}] Filling slot ${targetSlot.id} (${targetSlot.pattern}) with ${targetSlot.candidates?.length || 0} candidates`);
    }
    
    // Try ALL candidates (no limit)
    const candidates = [...(targetSlot.candidates || [])];
    
    // Sort by frequency (higher first)
    candidates.sort((a, b) => {
      const aEntry = this.wordBank.getWordsByLength(targetSlot.length as 3|4|5)
        .find(entry => entry.word === a);
      const bEntry = this.wordBank.getWordsByLength(targetSlot.length as 3|4|5)
        .find(entry => entry.word === b);
      return (bEntry?.frequency || 0) - (aEntry?.frequency || 0);
    });
    
    for (const word of candidates) {
      this.totalCandidatesChecked++;
      
      // Skip if word already used
      if (this.usedWords.has(word)) {
        continue;
      }
      
      // Validate placement
      if (!GridAnalyzer.isValidPlacement(word, targetSlot, grid)) {
        continue;
      }
      
      if (this.recursionDepth <= 5) { // Only log first 5 levels
        console.log(`✅ [Depth ${this.recursionDepth}] Trying word: ${word}`);
      }
      
      // Save current state for backtracking
      const savedPatterns = this.saveSlotPatterns(grid);
      
      // Place the word
      GridAnalyzer.placeWord(word, targetSlot, grid);
      this.usedWords.add(word);
      
      // Recursively fill remaining slots - NO TIMEOUT!
      const success = await this.fillGridUnlimited(grid);
      
      if (success) {
        this.recursionDepth--;
        return true;
      }
      
      if (this.recursionDepth <= 5) {
        console.log(`🔙 [Depth ${this.recursionDepth}] Backtracking from word: ${word}`);
      }
      
      // Backtrack: restore state
      this.restoreSlotPatterns(grid, savedPatterns);
      GridAnalyzer.removeWord(targetSlot, grid);
      this.usedWords.delete(word);
    }
    
    if (this.recursionDepth <= 10) {
      console.log(`❌ [Depth ${this.recursionDepth}] No valid word found for slot ${targetSlot.id}`);
    }
    this.recursionDepth--;
    return false;
  }
  
  /**
   * Select slot with minimum remaining values (MRV heuristic)
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
