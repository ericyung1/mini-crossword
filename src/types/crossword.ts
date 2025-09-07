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
  candidates?: string[]; // Available words for this slot
}

export interface CrosswordGrid {
  cells: GridCell[][];
  slots: CrosswordSlot[];
  acrossSlots: CrosswordSlot[];
  downSlots: CrosswordSlot[];
}

export interface CrosswordPuzzle {
  grid: string[][]; // Final letter grid
  across: Array<{
    num: number;
    answer: string;
    row: number;
    col: number;
    length: number;
    pattern: string;
  }>;
  down: Array<{
    num: number;
    answer: string;
    row: number;
    col: number;
    length: number;
    pattern: string;
  }>;
  meta: {
    templateId: string;
    seed?: number;
    generationTime: number;
  };
}

export interface GenerationOptions {
  seed?: number;
  templateId?: string; // If not specified, random template
  maxAttempts?: number;
  timeoutMs?: number;
}

export interface GenerationResult {
  success: boolean;
  puzzle?: CrosswordPuzzle;
  error?: string;
  attempts: number;
  duration: number;
}
