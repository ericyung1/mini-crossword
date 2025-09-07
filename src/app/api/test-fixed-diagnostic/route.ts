import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    console.log('🔬 FIXED DIAGNOSTIC TEST: Step by step validation...');
    
    // Step 1: Create template
    const simpleTemplate = {
      id: 'fixed-diagnostic-test',
      name: 'Fixed Diagnostic Test',
      description: 'Step by step diagnostic test',
      grid: [
        ['.', '.', '.', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#']
      ]
    };
    
    console.log('📐 Step 1: Template created');
    
    // Step 2: Build grid
    const grid = GridAnalyzer.buildGrid(simpleTemplate);
    console.log(`📐 Step 2: Grid built with ${grid.slots.length} slots`);
    
    // Step 3: Check initial patterns
    for (const slot of grid.slots) {
      console.log(`   Slot ${slot.id}: pattern="${slot.pattern}" (length=${slot.length})`);
    }
    
    // Step 4: Initialize word bank
    const wordBank = getWordBank();
    await wordBank.initialize();
    console.log('📐 Step 4: Word bank initialized');
    
    // Step 5: Test candidate finding for each slot
    const slotResults = [];
    
    for (const slot of grid.slots) {
      console.log(`🔍 Step 5.${slot.id}: Testing candidates for slot ${slot.id}`);
      console.log(`   Pattern: "${slot.pattern}"`);
      console.log(`   Pattern lowercase: "${slot.pattern.toLowerCase()}"`);
      
      // Test with original pattern (should fail if uppercase)
      const originalCandidates = wordBank.findWordsMatching({
        length: slot.length,
        pattern: slot.pattern
      });
      
      // Test with lowercase pattern (should work)
      const lowercaseCandidates = wordBank.findWordsMatching({
        length: slot.length,
        pattern: slot.pattern.toLowerCase()
      });
      
      console.log(`   Original pattern candidates: ${originalCandidates.length}`);
      console.log(`   Lowercase pattern candidates: ${lowercaseCandidates.length}`);
      
      if (lowercaseCandidates.length > 0) {
        console.log(`   First 5 lowercase candidates: ${lowercaseCandidates.slice(0, 5).map(e => e.word).join(', ')}`);
        
        // Test intersection validation
        const validCandidates = lowercaseCandidates
          .map(entry => entry.word)
          .filter(word => GridAnalyzer.isValidPlacement(word, slot, grid));
          
        console.log(`   Valid after intersection check: ${validCandidates.length}`);
        
        slotResults.push({
          slotId: slot.id,
          pattern: slot.pattern,
          originalCandidates: originalCandidates.length,
          lowercaseCandidates: lowercaseCandidates.length,
          validCandidates: validCandidates.length,
          firstValidWords: validCandidates.slice(0, 5)
        });
      } else {
        slotResults.push({
          slotId: slot.id,
          pattern: slot.pattern,
          originalCandidates: originalCandidates.length,
          lowercaseCandidates: lowercaseCandidates.length,
          validCandidates: 0,
          firstValidWords: []
        });
      }
    }
    
    // Step 6: Test if we can place a word
    console.log('🧪 Step 6: Testing word placement...');
    
    if (slotResults.length >= 2) {
      const firstSlot = grid.slots[0];
      const secondSlot = grid.slots[1];
      
      const firstSlotCandidates = wordBank.findWordsMatching({
        length: firstSlot.length,
        pattern: firstSlot.pattern.toLowerCase()
      });
      
      if (firstSlotCandidates.length > 0) {
        const testWord = firstSlotCandidates[0].word;
        console.log(`   Placing "${testWord}" in slot ${firstSlot.id}...`);
        
        // Place the word
        GridAnalyzer.placeWord(testWord, firstSlot, grid);
        
        console.log(`   After placement:`);
        console.log(`     Slot ${firstSlot.id} pattern: "${firstSlot.pattern}"`);
        console.log(`     Slot ${secondSlot.id} pattern: "${secondSlot.pattern}"`);
        
        // Check candidates for second slot
        const secondSlotCandidates = wordBank.findWordsMatching({
          length: secondSlot.length,
          pattern: secondSlot.pattern.toLowerCase()
        });
        
        console.log(`   Candidates for second slot: ${secondSlotCandidates.length}`);
        
        if (secondSlotCandidates.length > 0) {
          console.log(`   First 5: ${secondSlotCandidates.slice(0, 5).map(e => e.word).join(', ')}`);
          
          const validSecondCandidates = secondSlotCandidates
            .map(entry => entry.word)
            .filter(word => GridAnalyzer.isValidPlacement(word, secondSlot, grid));
            
          console.log(`   Valid second slot candidates: ${validSecondCandidates.length}`);
          
          if (validSecondCandidates.length > 0) {
            console.log(`✅ SOLUTION POSSIBLE: ${testWord} + ${validSecondCandidates[0]}`);
          } else {
            console.log(`❌ No valid second slot candidates after intersection check`);
          }
        } else {
          console.log(`❌ No candidates for second slot with pattern "${secondSlot.pattern}"`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      slotsDetected: grid.slots.length,
      slotResults,
      message: 'Check server console for detailed step-by-step analysis'
    });
    
  } catch (error) {
    console.error('💥 Fixed diagnostic test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
