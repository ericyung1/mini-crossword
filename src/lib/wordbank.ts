import { WordEntry, WordBank, WordQuery, WordBankStats } from '@/types/wordbank';
import * as fs from 'fs';
import * as path from 'path';

export class WordBankProcessor {
  private wordBank: WordBank;
  private initialized = false;

  constructor() {
    this.wordBank = {
      wordsByLength: { 3: [], 4: [], 5: [] },
      positionIndex: {},
      patternCache: new Map(),
    };
  }

  /**
   * Load and process the word bank from spreadthewordlist.txt
   * Filters to only 3-5 letter words and builds indexes
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const filePath = path.join(process.cwd(), 'spreadthewordlist.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');

    console.log(`Processing ${lines.length} entries from word bank...`);

    // Process each line
    for (const line of lines) {
      const [word, frequencyStr] = line.split(';');
      if (!word || !frequencyStr) continue;

      const cleanWord = word.toLowerCase().trim();
      const frequency = parseInt(frequencyStr, 10);

      // Filter: only 3-5 letter words, alphabetic only
      if (cleanWord.length >= 3 && cleanWord.length <= 5 && /^[a-z]+$/.test(cleanWord)) {
        const wordEntry: WordEntry = { word: cleanWord, frequency };
        
        // Add to length-based buckets
        this.wordBank.wordsByLength[cleanWord.length as 3 | 4 | 5].push(wordEntry);
        
        // Build positional indexes
        this.addToPositionIndex(wordEntry);
      }
    }

    // Sort all arrays by frequency (descending) for better performance
    this.sortByFrequency();
    
    this.initialized = true;
    console.log('Word bank initialized:', this.getStats());
  }

  /**
   * Add word to positional indexes for fast pattern matching
   */
  private addToPositionIndex(entry: WordEntry): void {
    const { word } = entry;
    const length = word.length;

    if (!this.wordBank.positionIndex[length]) {
      this.wordBank.positionIndex[length] = {};
    }

    // Index by each position
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      
      if (!this.wordBank.positionIndex[length][letter]) {
        this.wordBank.positionIndex[length][letter] = {};
      }
      
      if (!this.wordBank.positionIndex[length][letter][i]) {
        this.wordBank.positionIndex[length][letter][i] = [];
      }
      
      this.wordBank.positionIndex[length][letter][i].push(entry);
    }
  }

  /**
   * Sort all word arrays by frequency (descending) for tie-breaking
   */
  private sortByFrequency(): void {
    const sortFn = (a: WordEntry, b: WordEntry) => b.frequency - a.frequency;
    
    this.wordBank.wordsByLength[3].sort(sortFn);
    this.wordBank.wordsByLength[4].sort(sortFn);
    this.wordBank.wordsByLength[5].sort(sortFn);

    // Sort position indexes
    for (const lengthIndex of Object.values(this.wordBank.positionIndex)) {
      for (const letterIndex of Object.values(lengthIndex)) {
        for (const positionArray of Object.values(letterIndex)) {
          positionArray.sort(sortFn);
        }
      }
    }
  }

  /**
   * Find words matching a pattern like "a?e??" where ? = any letter
   * Uses positional indexes for fast lookup
   */
  findWordsMatching(query: WordQuery): WordEntry[] {
    if (!this.initialized) {
      throw new Error('WordBank not initialized. Call initialize() first.');
    }

    const { length, pattern } = query;
    
    // Check cache first
    const cacheKey = `${length}:${pattern}`;
    if (this.wordBank.patternCache.has(cacheKey)) {
      return this.wordBank.patternCache.get(cacheKey)!;
    }

    // If pattern is all wildcards, return all words of that length
    if (pattern === '?'.repeat(length)) {
      const result = [...this.wordBank.wordsByLength[length as 3 | 4 | 5]];
      this.wordBank.patternCache.set(cacheKey, result);
      return result;
    }

    // Find the most constrained position (first non-wildcard)
    let constrainedPos = -1;
    let constrainedChar = '';
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== '?') {
        constrainedPos = i;
        constrainedChar = pattern[i];
        break;
      }
    }

    let candidates: WordEntry[] = [];

    if (constrainedPos >= 0) {
      // Start with words that have the required character at the constrained position
      const posIndex = this.wordBank.positionIndex[length];
      if (posIndex && posIndex[constrainedChar] && posIndex[constrainedChar][constrainedPos]) {
        candidates = [...posIndex[constrainedChar][constrainedPos]];
      }
    } else {
      // No constraints, use all words of this length
      candidates = [...this.wordBank.wordsByLength[length as 3 | 4 | 5]];
    }

    // Filter candidates against full pattern
    const result = candidates.filter(entry => this.matchesPattern(entry.word, pattern));
    
    // Cache and return
    this.wordBank.patternCache.set(cacheKey, result);
    return result;
  }

  /**
   * Check if a word matches a pattern
   */
  private matchesPattern(word: string, pattern: string): boolean {
    if (word.length !== pattern.length) return false;
    
    for (let i = 0; i < word.length; i++) {
      if (pattern[i] !== '?' && pattern[i] !== word[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get statistics about the word bank
   */
  getStats(): WordBankStats {
    const words3 = this.wordBank.wordsByLength[3];
    const words4 = this.wordBank.wordsByLength[4];
    const words5 = this.wordBank.wordsByLength[5];
    
    const totalWords = words3.length + words4.length + words5.length;
    
    // Calculate average frequency
    const totalFreq = [...words3, ...words4, ...words5]
      .reduce((sum, entry) => sum + entry.frequency, 0);
    const averageFrequency = totalWords > 0 ? totalFreq / totalWords : 0;
    
    // Get top 10 words by frequency
    const allWords = [...words3, ...words4, ...words5]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      totalWords,
      wordsByLength: {
        3: words3.length,
        4: words4.length,
        5: words5.length,
      },
      averageFrequency: Math.round(averageFrequency * 100) / 100,
      topWords: allWords,
    };
  }

  /**
   * Get all words of a specific length
   */
  getWordsByLength(length: 3 | 4 | 5): WordEntry[] {
    if (!this.initialized) {
      throw new Error('WordBank not initialized. Call initialize() first.');
    }
    return [...this.wordBank.wordsByLength[length]];
  }

  /**
   * Clear pattern cache (useful for memory management)
   */
  clearCache(): void {
    this.wordBank.patternCache.clear();
  }
}

// Singleton instance
let wordBankInstance: WordBankProcessor | null = null;

/**
 * Get the singleton WordBank instance
 */
export function getWordBank(): WordBankProcessor {
  if (!wordBankInstance) {
    wordBankInstance = new WordBankProcessor();
  }
  return wordBankInstance;
}
