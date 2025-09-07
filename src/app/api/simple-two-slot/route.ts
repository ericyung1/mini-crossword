import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🎯 SIMPLE TWO-SLOT: Trying first valid combination...');
    
    // Create template
    const simpleTemplate = {
      id: 'simple-two-slot',
      name: 'Simple Two Slot',
      description: 'Simple two slot test',
      grid: [
        ['.', '.', '.', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#']
      ]
    };
    
    // Build grid
    const grid = GridAnalyzer.buildGrid(simpleTemplate);
    const acrossSlot = grid.slots.find(s => s.direction === 'across')!;
    const downSlot = grid.slots.find(s => s.direction === 'down')!;
    
    console.log(`📐 Slots: ${acrossSlot.id} + ${downSlot.id}`);
    
    // Get word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    // Get candidates for across slot
    const acrossCandidates = wordBank.findWordsMatching({
      length: acrossSlot.length,
      pattern: acrossSlot.pattern.toLowerCase()
    });
    
    console.log(`🔍 Across candidates: ${acrossCandidates.length}`);
    
    // Try first 10 across candidates
    for (let i = 0; i < Math.min(10, acrossCandidates.length); i++) {
      const acrossWord = acrossCandidates[i].word;
      console.log(`\n🧪 Trying across word: "${acrossWord}"`);
      
      // Create fresh grid for this attempt
      const testGrid = GridAnalyzer.buildGrid(simpleTemplate);
      const testAcrossSlot = testGrid.slots.find(s => s.direction === 'across')!;
      const testDownSlot = testGrid.slots.find(s => s.direction === 'down')!;
      
      // Place across word
      GridAnalyzer.placeWord(acrossWord, testAcrossSlot, testGrid);
      console.log(`   After placing "${acrossWord}": down pattern = "${testDownSlot.pattern}"`);
      
      // Get candidates for down slot
      const downCandidates = wordBank.findWordsMatching({
        length: testDownSlot.length,
        pattern: testDownSlot.pattern.toLowerCase()
      });
      
      console.log(`   Down candidates: ${downCandidates.length}`);
      
      if (downCandidates.length > 0) {
        // Try first down candidate
        const downWord = downCandidates[0].word;
        console.log(`   Trying down word: "${downWord}"`);
        
        // Check if valid
        const isValid = GridAnalyzer.isValidPlacement(downWord, testDownSlot, testGrid);
        console.log(`   "${downWord}" valid: ${isValid}`);
        
        if (isValid) {
          // Place it
          GridAnalyzer.placeWord(downWord, testDownSlot, testGrid);
          
          console.log(`✅ SOLUTION FOUND!`);
          console.log(`   Across: "${acrossWord}" at (0,0)`);
          console.log(`   Down: "${downWord}" at (0,0)`);
          
          // Build result
          const letterGrid = [];
          for (let row = 0; row < 5; row++) {
            letterGrid[row] = [];
            for (let col = 0; col < 5; col++) {
              const cell = testGrid.cells[row][col];
              letterGrid[row][col] = cell.type === '#' ? '#' : (cell.letter?.toUpperCase() || '');
            }
          }
          
          return NextResponse.json({
            success: true,
            grid: letterGrid,
            across: [{
              num: 1,
              answer: acrossWord.toUpperCase(),
              row: 0,
              col: 0,
              length: 3,
              pattern: acrossWord
            }],
            down: [{
              num: 1,
              answer: downWord.toUpperCase(),
              row: 0,
              col: 0,
              length: 3,
              pattern: downWord
            }],
            meta: {
              templateId: 'simple-two-slot',
              acrossWord,
              downWord,
              attempts: i + 1
            }
          });
        }
      }
    }
    
    console.log(`❌ No solution found in first 10 attempts`);
    
    return NextResponse.json({
      success: false,
      error: 'No solution found in first 10 attempts',
      acrossCandidates: acrossCandidates.length,
      message: 'Check server console for detailed attempt log'
    });
    
  } catch (error) {
    console.error('💥 Simple two-slot error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
