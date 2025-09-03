import type { PuzzleStats, Difficulty, GameSession } from "@/types/game";

/**
 * Local storage keys for game statistics
 */
const STATS_KEY = "mini-crossword-stats";
const SESSIONS_KEY = "mini-crossword-sessions";

/**
 * Default stats structure
 */
const DEFAULT_STATS: PuzzleStats = {
  totalSolved: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageTime: 0,
  bestTime: 0,
  difficultyStats: {
    EASY: { solved: 0, averageTime: 0, bestTime: 0 },
    MEDIUM: { solved: 0, averageTime: 0, bestTime: 0 },
    HARD: { solved: 0, averageTime: 0, bestTime: 0 }
  }
};

/**
 * Load stats from localStorage
 */
export function loadStats(): PuzzleStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new properties
      return {
        ...DEFAULT_STATS,
        ...parsed,
        difficultyStats: {
          ...DEFAULT_STATS.difficultyStats,
          ...parsed.difficultyStats
        }
      };
    }
  } catch (error) {
    console.warn("Failed to load stats:", error);
  }
  
  return DEFAULT_STATS;
}

/**
 * Save stats to localStorage
 */
export function saveStats(stats: PuzzleStats): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to save stats:", error);
  }
}

/**
 * Load game sessions from localStorage
 */
export function loadSessions(): GameSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Failed to load sessions:", error);
    return [];
  }
}

/**
 * Save game sessions to localStorage
 */
export function saveSessions(sessions: GameSession[]): void {
  if (typeof window === "undefined") return;
  
  try {
    // Keep only last 100 sessions to prevent storage bloat
    const trimmedSessions = sessions.slice(-100);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmedSessions));
  } catch (error) {
    console.warn("Failed to save sessions:", error);
  }
}

/**
 * Record a completed puzzle
 */
export function recordPuzzleCompletion(
  difficulty: Difficulty,
  timeInSeconds: number,
  hintsUsed: number,
  puzzleId: string
): PuzzleStats {
  const stats = loadStats();
  const sessions = loadSessions();
  
  // Update overall stats
  stats.totalSolved++;
  stats.currentStreak++; // This would need more logic for daily puzzles
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  
  // Update average time
  if (stats.averageTime === 0) {
    stats.averageTime = timeInSeconds;
  } else {
    stats.averageTime = (stats.averageTime * (stats.totalSolved - 1) + timeInSeconds) / stats.totalSolved;
  }
  
  // Update best time
  if (stats.bestTime === 0 || timeInSeconds < stats.bestTime) {
    stats.bestTime = timeInSeconds;
  }
  
  // Update difficulty-specific stats
  const diffStats = stats.difficultyStats[difficulty];
  diffStats.solved++;
  
  if (diffStats.averageTime === 0) {
    diffStats.averageTime = timeInSeconds;
  } else {
    diffStats.averageTime = (diffStats.averageTime * (diffStats.solved - 1) + timeInSeconds) / diffStats.solved;
  }
  
  if (diffStats.bestTime === 0 || timeInSeconds < diffStats.bestTime) {
    diffStats.bestTime = timeInSeconds;
  }
  
  // Record session
  const session: GameSession = {
    startTime: Date.now() - (timeInSeconds * 1000),
    endTime: Date.now(),
    hintsUsed,
    difficulty,
    puzzleId
  };
  
  sessions.push(session);
  
  // Save updated data
  saveStats(stats);
  saveSessions(sessions);
  
  return stats;
}

/**
 * Reset streak (for daily puzzles when a day is missed)
 */
export function resetStreak(): PuzzleStats {
  const stats = loadStats();
  stats.currentStreak = 0;
  saveStats(stats);
  return stats;
}

/**
 * Get recent performance (last N sessions)
 */
export function getRecentPerformance(count: number = 10): GameSession[] {
  const sessions = loadSessions();
  return sessions.slice(-count).reverse(); // Most recent first
}

/**
 * Get stats for a specific difficulty
 */
export function getDifficultyStats(difficulty: Difficulty): PuzzleStats["difficultyStats"][Difficulty] {
  const stats = loadStats();
  return stats.difficultyStats[difficulty];
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  if (seconds === 0) return "—";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get performance level based on solve time
 */
export function getPerformanceLevel(timeInSeconds: number, difficulty: Difficulty): {
  level: "EXCELLENT" | "GOOD" | "AVERAGE" | "SLOW";
  color: string;
  message: string;
} {
  // Rough benchmarks by difficulty (in seconds)
  const benchmarks = {
    EASY: { excellent: 60, good: 120, average: 180 },
    MEDIUM: { excellent: 90, good: 180, average: 270 },
    HARD: { excellent: 120, good: 240, average: 360 }
  };
  
  const bench = benchmarks[difficulty];
  
  if (timeInSeconds <= bench.excellent) {
    return {
      level: "EXCELLENT",
      color: "text-green-600",
      message: "Outstanding! 🏆"
    };
  } else if (timeInSeconds <= bench.good) {
    return {
      level: "GOOD", 
      color: "text-blue-600",
      message: "Great job! 👏"
    };
  } else if (timeInSeconds <= bench.average) {
    return {
      level: "AVERAGE",
      color: "text-yellow-600", 
      message: "Nice work! 👍"
    };
  } else {
    return {
      level: "SLOW",
      color: "text-gray-600",
      message: "Keep practicing! 💪"
    };
  }
}

/**
 * Export stats for sharing or backup
 */
export function exportStats(): string {
  const stats = loadStats();
  const sessions = loadSessions();
  
  return JSON.stringify({
    stats,
    sessions,
    exportDate: new Date().toISOString()
  }, null, 2);
}

/**
 * Import stats from backup
 */
export function importStats(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.stats) {
      saveStats(parsed.stats);
    }
    
    if (parsed.sessions) {
      saveSessions(parsed.sessions);
    }
    
    return true;
  } catch (error) {
    console.error("Failed to import stats:", error);
    return false;
  }
}

/**
 * Clear all stats and sessions
 */
export function clearAllStats(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
}
