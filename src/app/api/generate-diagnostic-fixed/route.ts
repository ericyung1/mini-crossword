import { NextResponse } from 'next/server';
import { DiagnosticGeneratorFixed } from '@/lib/diagnostic-generator-fixed';

export async function GET() {
  try {
    console.log('🔬 Starting FIXED diagnostic generation...');
    const generator = new DiagnosticGeneratorFixed();
    const result = await generator.generateDiagnostic();
    
    if (result.success && result.puzzle) {
      console.log('✅ Fixed diagnostic generation succeeded!');
      return NextResponse.json({
        ...result.puzzle,
        meta: {
          ...result.puzzle.meta,
          attempts: result.attempts,
          duration: result.duration
        }
      });
    } else {
      console.log('❌ Fixed diagnostic generation failed:', result.error);
      return NextResponse.json(
        { 
          error: result.error || 'Fixed diagnostic generation failed',
          attempts: result.attempts,
          duration: result.duration
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 Error in fixed diagnostic generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same as GET
}
