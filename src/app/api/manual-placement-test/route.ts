import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🧪 MANUAL PLACEMENT TEST: Testing manual word placement...');
    
    // Step 1: Create template
    const simpleTemplate = {
      id: 'manual-test',
      name: 'Manual Test',
      description: 'Manual word placement test',
      grid: [
        ['.', '.', '.', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#']
      ]
    };
    
    // Step 2: Build grid
    const grid = GridAnalyzer.buildGrid(simpleTemplate);
    const acrossSlot = grid.slots.find(s => s.direction === 'across')!;
    const downSlot = grid.slots.find(s => s.direction === 'down')!;
    
    console.log(`📐 Across slot: ${acrossSlot.id} at (${acrossSlot.startRow},${acrossSlot.startCol})`);
    console.log(`📐 Down slot: ${downSlot.id} at (${downSlot.startRow},${downSlot.startCol})`);
    console.log(`📐 Initial patterns: across="${acrossSlot.pattern}", down="${downSlot.pattern}"`);
    
    // Step 3: Get word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    // Step 4: Try placing specific words that should work
    const testPairs = [
      ['cat', 'car'], // c-a-t across, c-a-r down (share 'c' at position 0)
      ['the', 'tea'], // t-h-e across, t-e-a down (share 't' at position 0)  
      ['and', 'ant'], // a-n-d across, a-n-t down (share 'a' at position 0)
      ['dog', 'day'], // d-o-g across, d-a-y down (share 'd' at position 0)
      ['sun', 'sea']  // s-u-n across, s-e-a down (share 's' at position 0)
    ];
    
    const results = [];
    
    for (const [acrossWord, downWord] of testPairs) {
      console.log(`\n🧪 Testing pair: "${acrossWord}" (across) + "${downWord}" (down)`);
      
      // Reset grid
      const freshGrid = GridAnalyzer.buildGrid(simpleTemplate);
      const freshAcrossSlot = freshGrid.slots.find(s => s.direction === 'across')!;
      const freshDownSlot = freshGrid.slots.find(s => s.direction === 'down')!;
      
      try {
        // Check if words exist in word bank
        const acrossExists = wordBank.findWordsMatching({ length: 3, pattern: acrossWord });
        const downExists = wordBank.findWordsMatching({ length: 3, pattern: downWord });
        
        console.log(`   "${acrossWord}" in word bank: ${acrossExists.length > 0}`);
        console.log(`   "${downWord}" in word bank: ${downExists.length > 0}`);
        
        if (acrossExists.length === 0 || downExists.length === 0) {
          results.push({
            acrossWord,
            downWord,
            success: false,
            reason: 'Word not in word bank'
          });
          continue;
        }
        
        // Step 4a: Place across word first
        console.log(`   Placing "${acrossWord}" in across slot...`);
        GridAnalyzer.placeWord(acrossWord, freshAcrossSlot, freshGrid);
        
        console.log(`   After placing across word:`);
        console.log(`     Across pattern: "${freshAcrossSlot.pattern}"`);
        console.log(`     Down pattern: "${freshDownSlot.pattern}"`);
        
        // Step 4b: Check if down word is valid
        const downWordValid = GridAnalyzer.isValidPlacement(downWord, freshDownSlot, freshGrid);
        console.log(`   "${downWord}" valid for down slot: ${downWordValid}`);
        
        if (downWordValid) {
          // Step 4c: Place down word
          console.log(`   Placing "${downWord}" in down slot...`);
          GridAnalyzer.placeWord(downWord, freshDownSlot, freshGrid);
          
          console.log(`   Final patterns:`);
          console.log(`     Across: "${freshAcrossSlot.pattern}"`);
          console.log(`     Down: "${freshDownSlot.pattern}"`);
          
          // Check grid state
          console.log(`   Final grid:`);
          for (let row = 0; row < 3; row++) {
            const rowStr = freshGrid.cells[row].slice(0, 3).map(cell => cell.letter || '·').join(' ');
            console.log(`     Row ${row}: ${rowStr}`);
          }
          
          console.log(`   ✅ SUCCESS: ${acrossWord} + ${downWord}`);
          results.push({
            acrossWord,
            downWord,
            success: true,
            reason: 'Successfully placed both words'
          });
        } else {
          console.log(`   ❌ FAILED: ${downWord} not valid after placing ${acrossWord}`);
          results.push({
            acrossWord,
            downWord,
            success: false,
            reason: 'Down word not valid after placing across word'
          });
        }
        
      } catch (error) {
        console.log(`   💥 ERROR: ${error}`);
        results.push({
          acrossWord,
          downWord,
          success: false,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 SUMMARY: ${successCount}/${results.length} pairs successful`);
    
    return NextResponse.json({
      success: true,
      testResults: results,
      successCount,
      totalTests: results.length,
      message: 'Check server console for detailed manual placement test'
    });
    
  } catch (error) {
    console.error('💥 Manual placement test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
