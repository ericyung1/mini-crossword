import { NextResponse } from 'next/server';
import { UnlimitedGenerator } from '@/lib/unlimited-generator';

export async function GET() {
  try {
    console.log('🚀 Starting unlimited generation...');
    const generator = new UnlimitedGenerator();
    const result = await generator.generateUnlimited();
    
    if (result.success && result.puzzle) {
      console.log('✅ Unlimited generation succeeded!');
      return NextResponse.json({
        ...result.puzzle,
        meta: {
          ...result.puzzle.meta,
          attempts: result.attempts,
          duration: result.duration
        }
      });
    } else {
      console.log('❌ Unlimited generation failed:', result.error);
      return NextResponse.json(
        { 
          error: result.error || 'Unlimited generation failed',
          attempts: result.attempts,
          duration: result.duration
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 Error in unlimited generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same as GET
}
