import { getWordBank } from '@/lib/wordbank';

/**
 * Minimal test to isolate core issues
 * Tests word bank access and basic functionality
 */
export class MinimalTest {
  private wordBank = getWordBank();
  
  async runMinimalTest(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🧪 Starting minimal test...');
      
      // Test 1: Word bank initialization
      console.log('🔄 Test 1: Initializing word bank...');
      await this.wordBank.initialize();
      console.log('✅ Test 1: Word bank initialized');
      
      // Test 2: Get some 3-letter words
      console.log('🔄 Test 2: Getting 3-letter words...');
      const words3 = this.wordBank.getWordsByLength(3);
      console.log(`✅ Test 2: Found ${words3.length} 3-letter words`);
      console.log(`   First 5: ${words3.slice(0, 5).map(w => w.word).join(', ')}`);
      
      // Test 3: Pattern matching
      console.log('🔄 Test 3: Testing pattern matching...');
      const matches = this.wordBank.findWordsMatching({ length: 3, pattern: 'a??' });
      console.log(`✅ Test 3: Found ${matches.length} words matching 'a??'`);
      console.log(`   First 5: ${matches.slice(0, 5).map(w => w.word).join(', ')}`);
      
      // Test 4: Check if we have basic words
      console.log('🔄 Test 4: Looking for common words...');
      const commonWords = ['cat', 'dog', 'the', 'and', 'are'];
      const found = [];
      const missing = [];
      
      for (const word of commonWords) {
        const wordMatches = this.wordBank.findWordsMatching({ length: word.length, pattern: word });
        if (wordMatches.length > 0) {
          found.push(word);
        } else {
          missing.push(word);
        }
      }
      
      console.log(`✅ Test 4: Found words: ${found.join(', ')}`);
      console.log(`❌ Test 4: Missing words: ${missing.join(', ')}`);
      
      // Test 5: Simple intersection test
      console.log('🔄 Test 5: Testing intersection logic...');
      const word1 = words3[0]?.word; // First 3-letter word
      const word2 = words3.find(w => w.word[0] === word1?.[0]); // Word that shares first letter
      
      if (word1 && word2) {
        console.log(`✅ Test 5: Found intersecting words: ${word1} and ${word2.word}`);
      } else {
        console.log(`❌ Test 5: Could not find intersecting words`);
      }
      
      return {
        success: true,
        details: {
          totalWords3: words3.length,
          patternMatches: matches.length,
          foundCommon: found.length,
          missingCommon: missing.length,
          sampleWords: words3.slice(0, 10).map(w => w.word)
        }
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 Minimal test failed:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }
}

export async function runMinimalTest() {
  const test = new MinimalTest();
  return await test.runMinimalTest();
}
