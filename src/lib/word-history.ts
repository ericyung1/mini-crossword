/**
 * Word History Manager - Prevents repetition of words across recent puzzles
 * Maintains a rolling history of used words to ensure variety
 */

export interface WordHistoryEntry {
  word: string;
  timestamp: number;
  puzzleId: string;
}

export class WordHistoryManager {
  private history: WordHistoryEntry[] = [];
  private maxHistorySize: number;
  private maxAge: number; // milliseconds

  constructor(maxHistorySize = 100, maxAgeHours = 24) {
    this.maxHistorySize = maxHistorySize;
    this.maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  /**
   * Add words from a completed puzzle to history
   */
  addPuzzleWords(words: string[], puzzleId: string): void {
    const timestamp = Date.now();
    
    // Add new words to history
    for (const word of words) {
      this.history.push({
        word: word.toLowerCase(),
        timestamp,
        puzzleId
      });
    }

    // Clean up old entries
    this.cleanup();
  }

  /**
   * Check if a word was used recently
   */
  isWordRecentlyUsed(word: string): boolean {
    const cleanWord = word.toLowerCase();
    const cutoffTime = Date.now() - this.maxAge;
    
    return this.history.some(entry => 
      entry.word === cleanWord && entry.timestamp > cutoffTime
    );
  }

  /**
   * Get words used in the last N puzzles
   */
  getRecentWords(lastNPuzzles = 10): Set<string> {
    // Get unique puzzle IDs, sorted by timestamp (newest first)
    const recentPuzzleIds = [...new Set(
      this.history
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(entry => entry.puzzleId)
    )].slice(0, lastNPuzzles);

    // Get all words from those puzzles
    const recentWords = new Set<string>();
    for (const entry of this.history) {
      if (recentPuzzleIds.includes(entry.puzzleId)) {
        recentWords.add(entry.word);
      }
    }

    return recentWords;
  }

  /**
   * Filter out recently used words from a candidate list
   */
  filterRecentWords<T extends { word: string }>(
    candidates: T[], 
    lastNPuzzles = 10
  ): T[] {
    const recentWords = this.getRecentWords(lastNPuzzles);
    return candidates.filter(candidate => 
      !recentWords.has(candidate.word.toLowerCase())
    );
  }

  /**
   * Clean up old entries to prevent memory bloat
   */
  private cleanup(): void {
    const cutoffTime = Date.now() - this.maxAge;
    
    // Remove entries older than maxAge
    this.history = this.history.filter(entry => entry.timestamp > cutoffTime);
    
    // If still too many entries, keep only the most recent
    if (this.history.length > this.maxHistorySize) {
      this.history.sort((a, b) => b.timestamp - a.timestamp);
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get statistics about word usage
   */
  getStats(): {
    totalEntries: number;
    uniqueWords: number;
    uniquePuzzles: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    if (this.history.length === 0) {
      return {
        totalEntries: 0,
        uniqueWords: 0,
        uniquePuzzles: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }

    const timestamps = this.history.map(entry => entry.timestamp);
    
    return {
      totalEntries: this.history.length,
      uniqueWords: new Set(this.history.map(entry => entry.word)).size,
      uniquePuzzles: new Set(this.history.map(entry => entry.puzzleId)).size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }

  /**
   * Clear all history (useful for testing)
   */
  clear(): void {
    this.history = [];
  }
}

// Singleton instance
let wordHistoryInstance: WordHistoryManager | null = null;

/**
 * Get the singleton WordHistoryManager instance
 */
export function getWordHistory(): WordHistoryManager {
  if (!wordHistoryInstance) {
    wordHistoryInstance = new WordHistoryManager(100, 24); // 100 words, 24 hours
  }
  return wordHistoryInstance;
}
