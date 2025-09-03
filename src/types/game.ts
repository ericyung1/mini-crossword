export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface GameSettings {
  difficulty: Difficulty;
  showTimer: boolean;
  autoCheck: boolean;
  showHints: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
}

export interface PuzzleStats {
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  averageTime: number;
  bestTime: number;
  difficultyStats: {
    [key in Difficulty]: {
      solved: number;
      averageTime: number;
      bestTime: number;
    };
  };
}

export interface DailyPuzzleInfo {
  date: string;
  seed: string;
  difficulty: Difficulty;
  isCompleted: boolean;
  completionTime?: number;
  hintsUsed: number;
}

export interface HintType {
  type: "LETTER" | "WORD" | "CHECK";
  cost: number;
  description: string;
}

export interface GameSession {
  startTime: number;
  endTime?: number;
  hintsUsed: number;
  difficulty: Difficulty;
  puzzleId: string;
}
