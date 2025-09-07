import { CrosswordPuzzle, GenerationResult } from '@/types/crossword';
import { getWordBank } from '@/lib/wordbank';

/**
 * Simple, fast crossword generator for debugging
 * Uses only the open grid template and basic word placement
 */
export class SimpleGenerator {
  private wordBank = getWordBank();

  async generateSimple(): Promise<GenerationResult> {
    const startTime = performance.now();
    
    try {
      // Ensure word bank is ready
      await this.wordBank.initialize();
      
      // Use simple 5x5 open grid
      const grid = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ];

      // Get some random words
      const words5 = this.wordBank.getWordsByLength(5).slice(0, 10);
      const words3 = this.wordBank.getWordsByLength(3).slice(0, 10);
      
      if (words5.length === 0 || words3.length === 0) {
        return {
          success: false,
          error: 'No words available',
          attempts: 1,
          duration: performance.now() - startTime
        };
      }

      // Simple placement: fill row 0 and row 2 with 5-letter words
      const word1 = words5[0].word.toUpperCase();
      const word2 = words5[1] ? words5[1].word.toUpperCase() : words5[0].word.toUpperCase();
      
      // Fill rows
      for (let i = 0; i < 5; i++) {
        grid[0][i] = word1[i];
        grid[2][i] = word2[i];
      }

      // Fill columns 0 and 2 with words using existing letters
      const col0Pattern = `${grid[0][0]}?${grid[2][0]}??`;
      const col2Pattern = `${grid[0][2]}?${grid[2][2]}??`;
      
      const col0Matches = this.wordBank.findWordsMatching({ length: 5, pattern: col0Pattern.toLowerCase() });
      const col2Matches = this.wordBank.findWordsMatching({ length: 5, pattern: col2Pattern.toLowerCase() });
      
      if (col0Matches.length > 0) {
        const colWord = col0Matches[0].word.toUpperCase();
        for (let i = 0; i < 5; i++) {
          grid[i][0] = colWord[i];
        }
      }
      
      if (col2Matches.length > 0) {
        const colWord = col2Matches[0].word.toUpperCase();
        for (let i = 0; i < 5; i++) {
          grid[i][2] = colWord[i];
        }
      }

      // Fill remaining cells with random letters if needed
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!grid[row][col]) {
            grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          }
        }
      }

      const puzzle: CrosswordPuzzle = {
        grid,
        across: [
          { num: 1, answer: word1, row: 0, col: 0, length: 5, pattern: word1.toLowerCase() },
          { num: 6, answer: word2, row: 2, col: 0, length: 5, pattern: word2.toLowerCase() }
        ],
        down: [
          { num: 1, answer: grid.map(row => row[0]).join(''), row: 0, col: 0, length: 5, pattern: grid.map(row => row[0]).join('').toLowerCase() },
          { num: 3, answer: grid.map(row => row[2]).join(''), row: 0, col: 2, length: 5, pattern: grid.map(row => row[2]).join('').toLowerCase() }
        ],
        meta: {
          templateId: 'simple',
          generationTime: performance.now() - startTime
        }
      };

      return {
        success: true,
        puzzle,
        attempts: 1,
        duration: performance.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: 1,
        duration: performance.now() - startTime
      };
    }
  }
}
