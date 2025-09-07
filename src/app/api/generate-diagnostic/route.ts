import { NextResponse } from 'next/server';
import { DiagnosticGenerator } from '@/lib/diagnostic-generator';

export async function GET() {
  try {
    console.log('🔬 Starting diagnostic generation...');
    const generator = new DiagnosticGenerator();
    const result = await generator.generateDiagnostic();
    
    if (result.success && result.puzzle) {
      console.log('✅ Diagnostic generation succeeded!');
      return NextResponse.json({
        ...result.puzzle,
        meta: {
          ...result.puzzle.meta,
          attempts: result.attempts,
          duration: result.duration
        }
      });
    } else {
      console.log('❌ Diagnostic generation failed:', result.error);
      return NextResponse.json(
        { 
          error: result.error || 'Diagnostic generation failed',
          attempts: result.attempts,
          duration: result.duration
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 Error in diagnostic generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same as GET
}
