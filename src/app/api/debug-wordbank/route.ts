import { NextResponse } from 'next/server';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🔍 DEBUG WORDBANK: Testing word bank queries...');
    
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    // Test specific queries
    console.log('📋 Testing pattern queries...');
    
    // Test 1: All 3-letter words
    const allThree = wordBank.findWordsMatching({ length: 3, pattern: '???' });
    console.log(`  Query "???" (length 3): ${allThree.length} results`);
    console.log(`    First 5: ${allThree.slice(0, 5).map(e => e.word).join(', ')}`);
    
    // Test 2: Words starting with A
    const startA = wordBank.findWordsMatching({ length: 3, pattern: 'A??' });
    console.log(`  Query "A??" (length 3): ${startA.length} results`);
    console.log(`    First 5: ${startA.slice(0, 5).map(e => e.word).join(', ')}`);
    
    // Test 3: Words with A in middle
    const midA = wordBank.findWordsMatching({ length: 3, pattern: '?A?' });
    console.log(`  Query "?A?" (length 3): ${midA.length} results`);
    console.log(`    First 5: ${midA.slice(0, 5).map(e => e.word).join(', ')}`);
    
    // Test 4: Specific word check
    const theWords = wordBank.findWordsMatching({ length: 3, pattern: 'THE' });
    console.log(`  Query "THE" (length 3): ${theWords.length} results`);
    if (theWords.length > 0) {
      console.log(`    Results: ${theWords.map(e => e.word).join(', ')}`);
    }
    
    // Test 5: Check if THE exists in all words
    const hasThe = allThree.some(entry => entry.word === 'THE');
    console.log(`  "THE" exists in word bank: ${hasThe}`);
    
    // Test 6: Manual pattern matching test
    console.log('🧪 Manual pattern matching test...');
    const testWords = ['THE', 'AND', 'CAT', 'DOG', 'SUN'];
    const testPattern = '???';
    
    for (const word of testWords) {
      const matches = wordBank.findWordsMatching({ length: 3, pattern: word });
      const shouldMatch = word.length === 3;
      console.log(`    "${word}" matches "${testPattern}": expected=${shouldMatch}, actual=${matches.length > 0}`);
    }
    
    return NextResponse.json({
      success: true,
      allThreeLetterWords: allThree.length,
      firstFiveWords: allThree.slice(0, 5).map(e => e.word),
      hasThe: allThree.some(entry => entry.word === 'THE'),
      queries: {
        'all_three': allThree.length,
        'start_A': startA.length,
        'mid_A': midA.length,
        'exact_THE': theWords.length
      },
      message: 'Check server console for detailed word bank analysis'
    });
    
  } catch (error) {
    console.error('💥 Debug wordbank error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
