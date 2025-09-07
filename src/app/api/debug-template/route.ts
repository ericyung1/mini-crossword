import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🔬 DEBUG: Testing template and word bank...');
    
    // Test the simple template
    const simpleTemplate = {
      id: 'debug-template',
      name: 'Debug Template',
      description: 'Debug: 1 across + 1 down + 1 intersection',
      grid: [
        ['.', '.', '.', '#', '#'],  // 3-letter across word (row 0, cols 0-2)
        ['.', '#', '#', '#', '#'],  // 1st letter of down word (row 1, col 0)
        ['.', '#', '#', '#', '#'],  // 2nd letter of down word (row 2, col 0)
        ['#', '#', '#', '#', '#'],  // All black
        ['#', '#', '#', '#', '#']   // All black
      ]
    };
    
    console.log('📐 Template grid:');
    simpleTemplate.grid.forEach((row, i) => {
      console.log(`  Row ${i}: ${row.join(' ')}`);
    });
    
    // Build grid
    const grid = GridAnalyzer.buildGrid(simpleTemplate);
    console.log(`🏗️ Grid built with ${grid.slots.length} slots`);
    
    // Log each slot
    grid.slots.forEach(slot => {
      console.log(`  Slot ${slot.id}: ${slot.direction} ${slot.length} letters at (${slot.startRow},${slot.startCol})`);
      console.log(`    Cells: ${slot.cells.map(c => `(${c.row},${c.col})`).join(', ')}`);
      console.log(`    Pattern: "${slot.pattern}"`);
    });
    
    // Test word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    console.log('🔍 Testing word bank queries...');
    
    // Test 3-letter words
    const threeLetterWords = wordBank.findWordsMatching({
      length: 3,
      pattern: '???'
    });
    
    console.log(`  3-letter words found: ${threeLetterWords.length}`);
    if (threeLetterWords.length > 0) {
      console.log(`  First 10: ${threeLetterWords.slice(0, 10).map(e => e.word).join(', ')}`);
    }
    
    // Test specific patterns
    const patternA = wordBank.findWordsMatching({ length: 3, pattern: 'A??' });
    const patternB = wordBank.findWordsMatching({ length: 3, pattern: '?A?' });
    const patternC = wordBank.findWordsMatching({ length: 3, pattern: '??A' });
    
    console.log(`  A?? patterns: ${patternA.length}`);
    console.log(`  ?A? patterns: ${patternB.length}`);
    console.log(`  ??A patterns: ${patternC.length}`);
    
    // Check intersections
    if (grid.slots.length >= 2) {
      const acrossSlot = grid.slots.find(s => s.direction === 'across');
      const downSlot = grid.slots.find(s => s.direction === 'down');
      
      if (acrossSlot && downSlot) {
        console.log('🔗 Testing intersections...');
        const intersections = GridAnalyzer.getIntersectingSlots(acrossSlot, grid.slots);
        console.log(`  Across slot intersections: ${intersections.length}`);
        
        if (intersections.length > 0) {
          const intersection = intersections[0];
          console.log(`    Intersection: across[${intersection.targetIndex}] = down[${intersection.intersectIndex}]`);
          
          // Test if any words work
          const acrossWords = threeLetterWords.slice(0, 5);
          let validPairs = 0;
          
          for (const acrossWord of acrossWords) {
            const requiredLetter = acrossWord.word[intersection.targetIndex];
            const downPattern = '?'.repeat(downSlot.length);
            const newDownPattern = downPattern.substring(0, intersection.intersectIndex) + 
                                 requiredLetter + 
                                 downPattern.substring(intersection.intersectIndex + 1);
            
            const matchingDownWords = wordBank.findWordsMatching({
              length: downSlot.length,
              pattern: newDownPattern
            });
            
            if (matchingDownWords.length > 0) {
              validPairs++;
              console.log(`    Valid pair: ${acrossWord.word} + ${matchingDownWords[0].word} (letter: ${requiredLetter})`);
              if (validPairs >= 3) break; // Show first 3 valid pairs
            }
          }
          
          console.log(`  Total valid pairs found: ${validPairs}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      template: simpleTemplate,
      slotsDetected: grid.slots.length,
      slots: grid.slots.map(s => ({
        id: s.id,
        direction: s.direction,
        length: s.length,
        startRow: s.startRow,
        startCol: s.startCol,
        cells: s.cells
      })),
      wordBankStats: {
        threeLetterWords: threeLetterWords.length,
        sampleWords: threeLetterWords.slice(0, 10).map(e => e.word)
      }
    });
    
  } catch (error) {
    console.error('💥 Debug template error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
