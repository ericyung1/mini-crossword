export type Direction = "ACROSS" | "DOWN";

export type Cell = {
  row: number;
  col: number;
  isBlock: boolean;
  solution?: string;
  guess?: string;
  number?: number;
};

export type Clue = {
  id: string;
  number: number;
  direction: Direction;
  text: string;
  answer: string;
  start: { row: number; col: number };
  length: number;
};

export type Puzzle = {
  id: string;
  seed: string;
  size: 5;
  grid: Cell[][];
  clues: {
    across: Clue[];
    down: Clue[];
  };
};

export type PuzzleState = {
  puzzle: Puzzle;
  selectedClue?: string;
  selectedCell?: { row: number; col: number };
  isComplete: boolean;
  startTime?: Date;
  endTime?: Date;
};

export type GameStats = {
  puzzlesSolved: number;
  currentStreak: number;
  bestTime?: number;
  averageTime?: number;
};
