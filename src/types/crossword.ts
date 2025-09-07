export type CellType = '.' | '#'; // . = white (fillable), # = black
export type GridCell = {
  type: CellType;
  letter?: string;
  number?: number; // Clue number if this starts a word
};

export interface CrosswordMask {
  id: string;
  name: string;
  grid: CellType[][]; // 5x5 grid
  description: string;
}

export interface CrosswordSlot {
  id: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
  cells: Array<{ row: number; col: number }>;
  number: number; // Clue number
  pattern: string; // Current pattern with ? for empty cells
  candidates?: any[]; // Available words for this slot (WordEntry[] or string[])
}

export interface CrosswordGrid {
  cells: GridCell[][];
  slots: CrosswordSlot[];
  acrossSlots: CrosswordSlot[];
  downSlots: CrosswordSlot[];
}

// Removed unused puzzle generation types - will be added back when building the generator
