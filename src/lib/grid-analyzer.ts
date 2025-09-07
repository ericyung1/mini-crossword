import { CrosswordMask, CrosswordGrid, CrosswordSlot, GridCell } from '@/types/crossword';

/**
 * Analyzes a crossword mask and builds the slot structure
 * Detects across and down slots, assigns clue numbers
 */
export class GridAnalyzer {
  
  /**
   * Build a CrosswordGrid from a mask template
   */
  static buildGrid(mask: CrosswordMask): CrosswordGrid {
    const size = 5;
    const cells: GridCell[][] = [];
    
    // Initialize cells
    for (let row = 0; row < size; row++) {
      cells[row] = [];
      for (let col = 0; col < size; col++) {
        cells[row][col] = {
          type: mask.grid[row][col],
          letter: undefined,
          number: undefined
        };
      }
    }
    
    // Detect slots
    const slots = this.detectSlots(mask);
    const acrossSlots = slots.filter(slot => slot.direction === 'across');
    const downSlots = slots.filter(slot => slot.direction === 'down');
    
    // Assign clue numbers
    this.assignClueNumbers(cells, slots);
    
    return {
      cells,
      slots,
      acrossSlots,
      downSlots
    };
  }
  
  /**
   * Detect all word slots (3+ consecutive white squares)
   */
  private static detectSlots(mask: CrosswordMask): CrosswordSlot[] {
    const slots: CrosswordSlot[] = [];
    const size = 5;
    let slotId = 0;
    
    // Find across slots
    for (let row = 0; row < size; row++) {
      let start = -1;
      for (let col = 0; col <= size; col++) {
        const isWhite = col < size && mask.grid[row][col] === '.';
        
        if (isWhite && start === -1) {
          start = col; // Start of potential slot
        } else if (!isWhite && start !== -1) {
          // End of slot
          const length = col - start;
          if (length >= 3 && length <= 5) {
            const cells = [];
            for (let c = start; c < col; c++) {
              cells.push({ row, col: c });
            }
            
            slots.push({
              id: `across_${slotId++}`,
              direction: 'across',
              startRow: row,
              startCol: start,
              length,
              cells,
              number: 0, // Will be assigned later
              pattern: '?'.repeat(length)
            });
          }
          start = -1;
        }
      }
    }
    
    // Find down slots
    for (let col = 0; col < size; col++) {
      let start = -1;
      for (let row = 0; row <= size; row++) {
        const isWhite = row < size && mask.grid[row][col] === '.';
        
        if (isWhite && start === -1) {
          start = row; // Start of potential slot
        } else if (!isWhite && start !== -1) {
          // End of slot
          const length = row - start;
          if (length >= 3 && length <= 5) {
            const cells = [];
            for (let r = start; r < row; r++) {
              cells.push({ row: r, col });
            }
            
            slots.push({
              id: `down_${slotId++}`,
              direction: 'down',
              startRow: start,
              startCol: col,
              length,
              cells,
              number: 0, // Will be assigned later
              pattern: '?'.repeat(length)
            });
          }
          start = -1;
        }
      }
    }
    
    return slots;
  }
  
  /**
   * Assign clue numbers to slots and cells
   * Numbers are assigned in reading order (left-to-right, top-to-bottom)
   */
  private static assignClueNumbers(cells: GridCell[][], slots: CrosswordSlot[]): void {
    const size = 5;
    let clueNumber = 1;
    
    // Process cells in reading order
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (cells[row][col].type === '#') continue;
        
        // Check if this cell starts any slots
        const startingSlots = slots.filter(slot => 
          slot.startRow === row && slot.startCol === col
        );
        
        if (startingSlots.length > 0) {
          // Assign the same number to all slots starting here
          for (const slot of startingSlots) {
            slot.number = clueNumber;
          }
          cells[row][col].number = clueNumber;
          clueNumber++;
        }
      }
    }
  }
  
  /**
   * Update slot patterns based on current grid state
   */
  static updateSlotPatterns(grid: CrosswordGrid): void {
    for (const slot of grid.slots) {
      let pattern = '';
      for (const cell of slot.cells) {
        const gridCell = grid.cells[cell.row][cell.col];
        pattern += gridCell.letter || '?';
      }
      slot.pattern = pattern;
    }
  }
  
  /**
   * Get all slots that intersect with a given slot
   */
  static getIntersectingSlots(targetSlot: CrosswordSlot, allSlots: CrosswordSlot[]): Array<{
    slot: CrosswordSlot;
    targetIndex: number;
    intersectIndex: number;
  }> {
    const intersections = [];
    
    for (const slot of allSlots) {
      if (slot.id === targetSlot.id || slot.direction === targetSlot.direction) {
        continue;
      }
      
      // Check each cell in target slot against each cell in this slot
      for (let targetIndex = 0; targetIndex < targetSlot.cells.length; targetIndex++) {
        const targetCell = targetSlot.cells[targetIndex];
        
        for (let intersectIndex = 0; intersectIndex < slot.cells.length; intersectIndex++) {
          const intersectCell = slot.cells[intersectIndex];
          
          if (targetCell.row === intersectCell.row && targetCell.col === intersectCell.col) {
            intersections.push({
              slot,
              targetIndex,
              intersectIndex
            });
          }
        }
      }
    }
    
    return intersections;
  }
  
  /**
   * Check if placing a word in a slot would create valid intersections
   */
  static isValidPlacement(
    word: string, 
    slot: CrosswordSlot, 
    grid: CrosswordGrid
  ): boolean {
    if (word.length !== slot.length) return false;
    
    const intersections = this.getIntersectingSlots(slot, grid.slots);
    
    for (const intersection of intersections) {
      const { slot: intersectSlot, targetIndex, intersectIndex } = intersection;
      const requiredLetter = word[targetIndex];
      const existingLetter = intersectSlot.pattern[intersectIndex];
      
      // If intersection slot has a letter, it must match
      if (existingLetter !== '?' && existingLetter !== requiredLetter) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Place a word in a slot and update the grid
   */
  static placeWord(word: string, slot: CrosswordSlot, grid: CrosswordGrid): void {
    if (word.length !== slot.length) {
      throw new Error(`Word length ${word.length} doesn't match slot length ${slot.length}`);
    }
    
    // Update grid cells
    for (let i = 0; i < word.length; i++) {
      const cell = slot.cells[i];
      grid.cells[cell.row][cell.col].letter = word[i];
    }
    
    // Update all slot patterns
    this.updateSlotPatterns(grid);
  }
  
  /**
   * Remove a word from a slot and update patterns
   */
  static removeWord(slot: CrosswordSlot, grid: CrosswordGrid): void {
    // Clear letters from cells that only belong to this slot
    for (const cell of slot.cells) {
      const { row, col } = cell;
      
      // Check if any other slots use this cell
      const otherSlots = grid.slots.filter(s => 
        s.id !== slot.id && 
        s.cells.some(c => c.row === row && c.col === col)
      );
      
      // If no other slots use this cell, clear it
      if (otherSlots.length === 0) {
        grid.cells[row][col].letter = undefined;
      }
    }
    
    // Update all slot patterns
    this.updateSlotPatterns(grid);
  }
}
