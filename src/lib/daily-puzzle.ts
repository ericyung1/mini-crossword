import type { Difficulty, DailyPuzzleInfo } from "@/types/game";
import { generatePuzzle } from "./generator";

/**
 * Daily puzzle system with consistent date-based seeds
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get date string for a specific offset from today
 */
export function getDateString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

/**
 * Generate a deterministic seed for a specific date and difficulty
 */
export function getDailySeed(date: string, difficulty: Difficulty): string {
  return `daily-${date}-${difficulty.toLowerCase()}`;
}

/**
 * Get the daily puzzle for a specific date and difficulty
 */
export function getDailyPuzzle(date: string, difficulty: Difficulty) {
  const seed = getDailySeed(date, difficulty);
  return generatePuzzle(seed, difficulty);
}

/**
 * Get today's puzzle for a specific difficulty
 */
export function getTodaysPuzzle(difficulty: Difficulty) {
  const today = getTodayDateString();
  return getDailyPuzzle(today, difficulty);
}

/**
 * Get puzzle info for the daily challenge
 */
export function getDailyPuzzleInfo(date: string, difficulty: Difficulty): DailyPuzzleInfo {
  // In a real app, this would come from a database or localStorage
  // For now, we'll return a basic structure
  return {
    date,
    seed: getDailySeed(date, difficulty),
    difficulty,
    isCompleted: false, // This would be checked against user progress
    hintsUsed: 0
  };
}

/**
 * Get the current daily challenge rotation
 * Monday = Easy, Tuesday = Medium, Wednesday = Hard, etc.
 */
export function getTodaysDifficulty(): Difficulty {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Rotate difficulty based on day of week
  const difficultyRotation: Difficulty[] = [
    "MEDIUM", // Sunday
    "EASY",   // Monday
    "MEDIUM", // Tuesday  
    "HARD",   // Wednesday
    "MEDIUM", // Thursday
    "EASY",   // Friday
    "HARD"    // Saturday
  ];
  
  return difficultyRotation[dayOfWeek];
}

/**
 * Get the daily challenge puzzle for today
 */
export function getTodaysDailyChallenge() {
  const today = getTodayDateString();
  const difficulty = getTodaysDifficulty();
  
  return {
    puzzle: getDailyPuzzle(today, difficulty),
    info: getDailyPuzzleInfo(today, difficulty),
    difficulty,
    date: today
  };
}

/**
 * Get puzzles for the past week
 */
export function getWeeklyPuzzles() {
  const puzzles = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = getDateString(-i);
    const dayOfWeek = new Date(date).getDay();
    const difficulty = [
      "MEDIUM", "EASY", "MEDIUM", "HARD", 
      "MEDIUM", "EASY", "HARD"
    ][dayOfWeek] as Difficulty;
    
    puzzles.push({
      date,
      difficulty,
      info: getDailyPuzzleInfo(date, difficulty),
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return puzzles;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
}
