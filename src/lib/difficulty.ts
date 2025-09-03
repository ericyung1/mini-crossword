import type { Difficulty } from "@/types/game";
import type { Pattern } from "./patterns";
import { CROSSWORD_PATTERNS } from "./patterns";

/**
 * Difficulty-based pattern selection and word bank filtering
 */

// Easy patterns - more open, better connectivity
export const EASY_PATTERN_INDICES = [0, 1, 7]; // Cross, Corners, Minimal

// Medium patterns - balanced complexity
export const MEDIUM_PATTERN_INDICES = [2, 3, 4]; // Diagonal, Center Plus, Sides

// Hard patterns - more isolated sections
export const HARD_PATTERN_INDICES = [5, 6]; // Scattered, T-shape

/**
 * Get pattern indices based on difficulty
 */
export function getPatternIndicesByDifficulty(difficulty: Difficulty): number[] {
  switch (difficulty) {
    case "EASY":
      return EASY_PATTERN_INDICES;
    case "MEDIUM":
      return MEDIUM_PATTERN_INDICES;
    case "HARD":
      return HARD_PATTERN_INDICES;
    default:
      return EASY_PATTERN_INDICES;
  }
}

/**
 * Get patterns for a specific difficulty
 */
export function getPatternsByDifficulty(difficulty: Difficulty): Pattern[] {
  const indices = getPatternIndicesByDifficulty(difficulty);
  return indices.map(index => CROSSWORD_PATTERNS[index]);
}

/**
 * Word length preferences by difficulty
 */
export const DIFFICULTY_WORD_PREFERENCES = {
  EASY: {
    preferredLengths: [3, 4, 5], // Prefer common word lengths
    minCommonWords: 80, // Require more common words
    allowObscureWords: false
  },
  MEDIUM: {
    preferredLengths: [2, 3, 4, 5], // Allow shorter words
    minCommonWords: 60,
    allowObscureWords: false
  },
  HARD: {
    preferredLengths: [2, 3, 4, 5], // All lengths
    minCommonWords: 40,
    allowObscureWords: true
  }
} as const;

/**
 * Get difficulty label and description
 */
export function getDifficultyInfo(difficulty: Difficulty) {
  const info = {
    EASY: {
      label: "Easy",
      description: "Open patterns with common words",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-300"
    },
    MEDIUM: {
      label: "Medium", 
      description: "Balanced challenge with mixed words",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100", 
      borderColor: "border-yellow-300"
    },
    HARD: {
      label: "Hard",
      description: "Complex patterns with varied vocabulary",
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-300"
    }
  };
  
  return info[difficulty];
}

/**
 * Calculate difficulty score for a completed puzzle
 */
export function calculateDifficultyScore(
  difficulty: Difficulty,
  timeInSeconds: number,
  hintsUsed: number
): number {
  const baseScore = {
    EASY: 100,
    MEDIUM: 200,
    HARD: 300
  }[difficulty];
  
  // Time bonus (faster = better)
  const timeBonus = Math.max(0, 300 - timeInSeconds);
  
  // Hint penalty
  const hintPenalty = hintsUsed * 50;
  
  return Math.max(0, baseScore + timeBonus - hintPenalty);
}
