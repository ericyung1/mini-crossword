import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🎯 CANDIDATE TEST: Testing candidate finding logic...');
    
    // Create the simple template
    const simpleTemplate = {
      id: 'candidate-test',
      name: 'Candidate Test',
      description: 'Test candidate finding',
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
    
    // Get word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    console.log('🔍 Testing initial candidate finding...');
    
    // Test finding candidates for empty slots (pattern "???")
    console.log(`📐 Across slot: pattern="${acrossSlot.pattern}" length=${acrossSlot.length}`);
    const acrossCandidates = wordBank.findWordsMatching({
      length: acrossSlot.length,
      pattern: acrossSlot.pattern
    });
    console.log(`   Raw across candidates: ${acrossCandidates.length}`);
    
    // Filter by intersection validation
    const validAcrossCandidates = acrossCandidates
      .map(entry => entry.word)
      .filter(word => GridAnalyzer.isValidPlacement(word, acrossSlot, grid));
    
    console.log(`   Valid across candidates: ${validAcrossCandidates.length}`);
    console.log(`   First 10 valid across: ${validAcrossCandidates.slice(0, 10).join(', ')}`);
    
    console.log(`📐 Down slot: pattern="${downSlot.pattern}" length=${downSlot.length}`);
    const downCandidates = wordBank.findWordsMatching({
      length: downSlot.length,
      pattern: downSlot.pattern
    });
    console.log(`   Raw down candidates: ${downCandidates.length}`);
    
    // Filter by intersection validation
    const validDownCandidates = downCandidates
      .map(entry => entry.word)
      .filter(word => GridAnalyzer.isValidPlacement(word, downSlot, grid));
      
    console.log(`   Valid down candidates: ${validDownCandidates.length}`);
    console.log(`   First 10 valid down: ${validDownCandidates.slice(0, 10).join(', ')}`);
    
    // Test MRV selection
    console.log('🎯 Testing MRV selection...');
    
    // Simulate what the algorithm does
    acrossSlot.candidates = validAcrossCandidates;
    downSlot.candidates = validDownCandidates;
    
    // Find slot with minimum remaining values
    let bestSlot = null;
    let minCandidates = Infinity;
    
    for (const slot of grid.slots) {
      if (slot.pattern.indexOf('?') !== -1) { // Unfilled
        const candidateCount = slot.candidates?.length || 0;
        console.log(`   Slot ${slot.id}: ${candidateCount} candidates`);
        
        if (candidateCount < minCandidates) {
          bestSlot = slot;
          minCandidates = candidateCount;
        }
      }
    }
    
    console.log(`   Selected slot: ${bestSlot?.id} with ${minCandidates} candidates`);
    
    // Test placing first word and updating patterns
    if (bestSlot && bestSlot.candidates && bestSlot.candidates.length > 0) {
      const firstWord = bestSlot.candidates[0];
      console.log(`🧪 Testing placement of "${firstWord}" in ${bestSlot.id}...`);
      
      // Save original patterns
      const originalAcrossPattern = acrossSlot.pattern;
      const originalDownPattern = downSlot.pattern;
      
      // Place the word
      GridAnalyzer.placeWord(firstWord, bestSlot, grid);
      
      console.log(`   After placing "${firstWord}":`);
      console.log(`     Across pattern: "${originalAcrossPattern}" → "${acrossSlot.pattern}"`);
      console.log(`     Down pattern: "${originalDownPattern}" → "${downSlot.pattern}"`);
      
      // Find candidates for the other slot
      const otherSlot = bestSlot.id === acrossSlot.id ? downSlot : acrossSlot;
      const otherCandidates = wordBank.findWordsMatching({
        length: otherSlot.length,
        pattern: otherSlot.pattern
      });
      
      console.log(`   Candidates for other slot (${otherSlot.id}): ${otherCandidates.length}`);
      if (otherCandidates.length > 0) {
        console.log(`   First 5: ${otherCandidates.slice(0, 5).map(e => e.word).join(', ')}`);
        
        // Test if first candidate is valid
        const firstOtherCandidate = otherCandidates[0].word;
        const isValid = GridAnalyzer.isValidPlacement(firstOtherCandidate, otherSlot, grid);
        console.log(`   "${firstOtherCandidate}" valid: ${isValid ? '✅' : '❌'}`);
        
        if (isValid) {
          console.log(`✅ SOLUTION FOUND: ${bestSlot.direction === 'across' ? firstWord : firstOtherCandidate} (across) + ${bestSlot.direction === 'down' ? firstWord : firstOtherCandidate} (down)`);
        }
      } else {
        console.log(`❌ No candidates for other slot after placing "${firstWord}"`);
      }
    }
    
    return NextResponse.json({
      success: true,
      acrossSlot: {
        pattern: acrossSlot.pattern,
        rawCandidates: acrossCandidates.length,
        validCandidates: validAcrossCandidates.length
      },
      downSlot: {
        pattern: downSlot.pattern,
        rawCandidates: downCandidates.length,
        validCandidates: validDownCandidates.length
      },
      selectedSlot: bestSlot?.id,
      message: 'Check server console for detailed analysis'
    });
    
  } catch (error) {
    console.error('💥 Candidate test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
