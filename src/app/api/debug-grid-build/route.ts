import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';

export async function GET() {
  try {
    console.log('🔍 DEBUG GRID BUILD: Step-by-step grid building...');
    
    // Create the simple template
    const simpleTemplate = {
      id: 'debug-grid-build',
      name: 'Debug Grid Build',
      description: 'Debug grid building process',
      grid: [
        ['.', '.', '.', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['.', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#'],
        ['#', '#', '#', '#', '#']
      ]
    };
    
    console.log('📐 Template grid:');
    simpleTemplate.grid.forEach((row, i) => {
      console.log(`  Row ${i}: ${row.join(' ')}`);
    });
    
    // Step 1: Initialize cells
    console.log('🏗️ Step 1: Initializing cells...');
    const size = 5;
    const cells = [];
    
    for (let row = 0; row < size; row++) {
      cells[row] = [];
      for (let col = 0; col < size; col++) {
        cells[row][col] = {
          type: simpleTemplate.grid[row][col],
          letter: undefined,
          number: undefined
        };
      }
    }
    
    console.log('📋 Cell types:');
    for (let row = 0; row < size; row++) {
      const rowStr = cells[row].map(cell => cell.type).join(' ');
      console.log(`  Row ${row}: ${rowStr}`);
    }
    
    console.log('📋 Cell letters (should all be undefined):');
    for (let row = 0; row < size; row++) {
      const rowStr = cells[row].map(cell => cell.letter || '·').join(' ');
      console.log(`  Row ${row}: ${rowStr}`);
    }
    
    // Step 2: Detect slots manually
    console.log('🔍 Step 2: Detecting slots manually...');
    
    // Check across slots
    console.log('  Checking across slots...');
    for (let row = 0; row < size; row++) {
      let start = -1;
      for (let col = 0; col <= size; col++) {
        const isWhite = col < size && simpleTemplate.grid[row][col] === '.';
        
        if (isWhite && start === -1) {
          start = col;
          console.log(`    Row ${row}: Started potential slot at col ${col}`);
        } else if (!isWhite && start !== -1) {
          const length = col - start;
          console.log(`    Row ${row}: Ended slot at col ${col}, length ${length}`);
          if (length >= 3 && length <= 5) {
            console.log(`      ✅ Valid across slot: Row ${row}, cols ${start}-${col-1}, length ${length}`);
          }
          start = -1;
        }
      }
    }
    
    // Check down slots
    console.log('  Checking down slots...');
    for (let col = 0; col < size; col++) {
      let start = -1;
      for (let row = 0; row <= size; row++) {
        const isWhite = row < size && simpleTemplate.grid[row][col] === '.';
        
        if (isWhite && start === -1) {
          start = row;
          console.log(`    Col ${col}: Started potential slot at row ${row}`);
        } else if (!isWhite && start !== -1) {
          const length = row - start;
          console.log(`    Col ${col}: Ended slot at row ${row}, length ${length}`);
          if (length >= 3 && length <= 5) {
            console.log(`      ✅ Valid down slot: Col ${col}, rows ${start}-${row-1}, length ${length}`);
          }
          start = -1;
        }
      }
    }
    
    // Step 3: Use GridAnalyzer
    console.log('🏗️ Step 3: Using GridAnalyzer.buildGrid...');
    const grid = GridAnalyzer.buildGrid(simpleTemplate);
    
    console.log(`📊 Grid built with ${grid.slots.length} slots`);
    
    for (const slot of grid.slots) {
      console.log(`  Slot ${slot.id}:`);
      console.log(`    Direction: ${slot.direction}`);
      console.log(`    Position: (${slot.startRow}, ${slot.startCol})`);
      console.log(`    Length: ${slot.length}`);
      console.log(`    Cells: ${slot.cells.map(c => `(${c.row},${c.col})`).join(', ')}`);
      console.log(`    Pattern: "${slot.pattern}"`);
      
      // Check what letters are in the cells
      const cellLetters = slot.cells.map(cell => {
        const gridCell = grid.cells[cell.row][cell.col];
        return gridCell.letter || '?';
      }).join('');
      console.log(`    Cell letters: "${cellLetters}"`);
    }
    
    return NextResponse.json({
      success: true,
      slotsDetected: grid.slots.length,
      slots: grid.slots.map(s => ({
        id: s.id,
        direction: s.direction,
        length: s.length,
        pattern: s.pattern,
        cells: s.cells
      })),
      message: 'Check server console for step-by-step analysis'
    });
    
  } catch (error) {
    console.error('💥 Debug grid build error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
