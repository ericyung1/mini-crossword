import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🔍 INTERSECTION TEST: Testing word placement validation...');
    
    // Create the simple template
    const simpleTemplate = {
      id: 'intersection-test',
      name: 'Intersection Test',
      description: 'Test intersection validation',
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
    
    console.log(`📐 Across slot: ${acrossSlot.id} at (${acrossSlot.startRow},${acrossSlot.startCol}) length ${acrossSlot.length}`);
    console.log(`📐 Down slot: ${downSlot.id} at (${downSlot.startRow},${downSlot.startCol}) length ${downSlot.length}`);
    
    // Get intersections
    const intersections = GridAnalyzer.getIntersectingSlots(acrossSlot, grid.slots);
    console.log(`🔗 Found ${intersections.length} intersections`);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      console.log(`   Intersection: across[${intersection.targetIndex}] = down[${intersection.intersectIndex}] at cell (0,0)`);
    }
    
    // Get word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    // Test simple words
    const testWords = ['THE', 'AND', 'CAT', 'DOG', 'SUN', 'TOP', 'BAT', 'HAT', 'CAR', 'BOX'];
    const results = [];
    
    console.log('🧪 Testing word placements...');
    
    for (const word of testWords) {
      // Test across placement
      const acrossValid = GridAnalyzer.isValidPlacement(word, acrossSlot, grid);
      console.log(`   ${word} in across slot: ${acrossValid ? '✅' : '❌'}`);
      
      // Test down placement  
      const downValid = GridAnalyzer.isValidPlacement(word, downSlot, grid);
      console.log(`   ${word} in down slot: ${downValid ? '✅' : '❌'}`);
      
      results.push({
        word,
        acrossValid,
        downValid
      });
    }
    
    // Test a specific combination
    console.log('🎯 Testing specific word combination...');
    
    // Try placing "THE" across
    if (GridAnalyzer.isValidPlacement('THE', acrossSlot, grid)) {
      console.log('   Placing "THE" in across slot...');
      GridAnalyzer.placeWord('THE', acrossSlot, grid);
      
      console.log(`   Across slot pattern after: "${acrossSlot.pattern}"`);
      console.log(`   Down slot pattern after: "${downSlot.pattern}"`);
      
      // Now try finding words that fit the down slot with 'T' at position 0
      const downCandidates = wordBank.findWordsMatching({
        length: 3,
        pattern: 'T??'
      });
      
      console.log(`   Down candidates with T??: ${downCandidates.length}`);
      if (downCandidates.length > 0) {
        console.log(`   First 5: ${downCandidates.slice(0, 5).map(e => e.word).join(', ')}`);
        
        // Test if first candidate is valid
        const firstCandidate = downCandidates[0].word;
        const isValid = GridAnalyzer.isValidPlacement(firstCandidate, downSlot, grid);
        console.log(`   "${firstCandidate}" valid for down slot: ${isValid ? '✅' : '❌'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      intersections: intersections.length,
      testResults: results,
      message: 'Check server console for detailed logs'
    });
    
  } catch (error) {
    console.error('💥 Intersection test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
