export interface WordEntry {
  word: string;
  frequency: number;
}

export interface WordBank {
  // Words organized by length (3, 4, 5)
  wordsByLength: {
    3: WordEntry[];
    4: WordEntry[];
    5: WordEntry[];
  };
  
  // Positional indexes for pattern matching
  // e.g., positionIndex[3]['a'][0] = all 3-letter words starting with 'a'
  positionIndex: {
    [length: number]: {
      [letter: string]: {
        [position: number]: WordEntry[];
      };
    };
  };
  
  // Pattern cache for common queries like "a?e??"
  patternCache: Map<string, WordEntry[]>;
}

export interface WordQuery {
  length: number;
  pattern: string; // e.g., "a?e??" where ? = any letter
}

export interface WordBankStats {
  totalWords: number;
  wordsByLength: {
    3: number;
    4: number;
    5: number;
  };
  averageFrequency: number;
  topWords: WordEntry[];
}
