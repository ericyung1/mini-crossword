import { NextResponse } from 'next/server';
import { SimpleGenerator } from '@/lib/simple-generator';

export async function GET() {
  try {
    const generator = new SimpleGenerator();
    const result = await generator.generateSimple();
    
    if (result.success && result.puzzle) {
      return NextResponse.json(result.puzzle);
    } else {
      return NextResponse.json(
        { error: result.error || 'Generation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in simple generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same as GET for now
}
