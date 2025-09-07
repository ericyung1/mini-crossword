import { NextResponse } from 'next/server';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🔍 CASE BUG TEST: Testing case sensitivity issue...');
    
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    // Test lowercase vs uppercase patterns
    console.log('📋 Testing case sensitivity...');
    
    // Test 1: Lowercase pattern (should work)
    const lowercasePattern = wordBank.findWordsMatching({ length: 3, pattern: '???' });
    console.log(`  Lowercase "???" (length 3): ${lowercasePattern.length} results`);
    console.log(`    First 5: ${lowercasePattern.slice(0, 5).map(e => e.word).join(', ')}`);
    
    // Test 2: Try finding "the" in lowercase
    const theResults = wordBank.findWordsMatching({ length: 3, pattern: 'the' });
    console.log(`  Pattern "the": ${theResults.length} results`);
    if (theResults.length > 0) {
      console.log(`    Found: ${theResults.map(e => e.word).join(', ')}`);
    }
    
    // Test 3: Try finding words starting with lowercase 'a'
    const aPattern = wordBank.findWordsMatching({ length: 3, pattern: 'a??' });
    console.log(`  Pattern "a??": ${aPattern.length} results`);
    console.log(`    First 5: ${aPattern.slice(0, 5).map(e => e.word).join(', ')}`);
    
    // Test 4: Try uppercase patterns (should fail)
    const uppercaseA = wordBank.findWordsMatching({ length: 3, pattern: 'A??' });
    console.log(`  Pattern "A??": ${uppercaseA.length} results`);
    
    const uppercaseTHE = wordBank.findWordsMatching({ length: 3, pattern: 'THE' });
    console.log(`  Pattern "THE": ${uppercaseTHE.length} results`);
    
    // Test 5: Check what happens with mixed case
    const mixedCase = wordBank.findWordsMatching({ length: 3, pattern: 'ThE' });
    console.log(`  Pattern "ThE": ${mixedCase.length} results`);
    
    return NextResponse.json({
      success: true,
      testResults: {
        lowercase_wildcard: lowercasePattern.length,
        lowercase_the: theResults.length,
        lowercase_a_pattern: aPattern.length,
        uppercase_A_pattern: uppercaseA.length,
        uppercase_THE: uppercaseTHE.length,
        mixed_ThE: mixedCase.length
      },
      firstWords: lowercasePattern.slice(0, 5).map(e => e.word),
      message: 'Case sensitivity test - check console for details'
    });
    
  } catch (error) {
    console.error('💥 Case bug test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
