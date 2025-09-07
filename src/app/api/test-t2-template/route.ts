import { NextResponse } from 'next/server';
import { GridAnalyzer } from '@/lib/grid-analyzer';
import { getTemplateById } from '@/lib/templates';

export async function GET() {
  try {
    console.log('🔍 T2 TEMPLATE TEST: Analyzing t2 template complexity...');
    
    // Get t2 template
    const template = getTemplateById('t2');
    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template t2 not found'
      });
    }
    
    console.log('📐 Template t2 (Classic Mini):');
    template.grid.forEach((row, i) => {
      console.log(`  Row ${i}: ${row.join(' ')}`);
    });
    
    // Build grid
    const grid = GridAnalyzer.buildGrid(template);
    console.log(`🏗️ Grid built with ${grid.slots.length} total slots`);
    console.log(`   Across slots: ${grid.acrossSlots.length}`);
    console.log(`   Down slots: ${grid.downSlots.length}`);
    
    // Analyze each slot
    const slotAnalysis = [];
    let totalIntersections = 0;
    
    for (const slot of grid.slots) {
      const intersections = GridAnalyzer.getIntersectingSlots(slot, grid.slots);
      totalIntersections += intersections.length;
      
      console.log(`📊 Slot ${slot.id}:`);
      console.log(`   Direction: ${slot.direction}`);
      console.log(`   Position: (${slot.startRow}, ${slot.startCol})`);
      console.log(`   Length: ${slot.length}`);
      console.log(`   Intersections: ${intersections.length}`);
      
      slotAnalysis.push({
        id: slot.id,
        direction: slot.direction,
        length: slot.length,
        position: [slot.startRow, slot.startCol],
        intersections: intersections.length,
        intersectsWith: intersections.map(i => i.slot.id)
      });
    }
    
    console.log(`📊 COMPLEXITY ANALYSIS:`);
    console.log(`   Total slots: ${grid.slots.length}`);
    console.log(`   Total intersections: ${totalIntersections}`);
    console.log(`   Average intersections per slot: ${(totalIntersections / grid.slots.length).toFixed(1)}`);
    
    // Compare to our successful 2-slot template
    console.log(`📊 COMPARISON TO 2-SLOT DIAGNOSTIC:`);
    console.log(`   2-slot: 2 slots, 1 intersection, 0.5 avg intersections`);
    console.log(`   t2: ${grid.slots.length} slots, ${totalIntersections} intersections, ${(totalIntersections / grid.slots.length).toFixed(1)} avg intersections`);
    console.log(`   Complexity ratio: ${(grid.slots.length / 2).toFixed(1)}x slots, ${totalIntersections}x intersections`);
    
    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        grid: template.grid
      },
      analysis: {
        totalSlots: grid.slots.length,
        acrossSlots: grid.acrossSlots.length,
        downSlots: grid.downSlots.length,
        totalIntersections,
        averageIntersections: totalIntersections / grid.slots.length,
        complexityVs2Slot: {
          slotsRatio: grid.slots.length / 2,
          intersectionsRatio: totalIntersections / 1
        }
      },
      slots: slotAnalysis,
      message: 'Check server console for detailed template analysis'
    });
    
  } catch (error) {
    console.error('💥 T2 template test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
