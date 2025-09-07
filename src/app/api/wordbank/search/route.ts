import { NextRequest, NextResponse } from 'next/server';
import { getWordBank } from '@/lib/wordbank';

export async function POST(request: NextRequest) {
  try {
    const { pattern } = await request.json();
    
    if (!pattern || typeof pattern !== 'string') {
      return NextResponse.json(
        { error: 'Pattern is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanPattern = pattern.toLowerCase().trim();
    
    // Validate pattern format
    if (!/^[a-z?]{3,5}$/.test(cleanPattern)) {
      return NextResponse.json(
        { error: 'Pattern must be 3-5 characters, containing only letters and ?' },
        { status: 400 }
      );
    }

    const wordBank = getWordBank();
    await wordBank.initialize();
    
    const startTime = performance.now();
    const words = wordBank.findWordsMatching({
      length: cleanPattern.length,
      pattern: cleanPattern,
    });
    const duration = performance.now() - startTime;

    return NextResponse.json({
      words,
      duration: Math.round(duration * 100) / 100,
      pattern: cleanPattern,
      count: words.length,
    });
  } catch (error) {
    console.error('Error searching word bank:', error);
    return NextResponse.json(
      { error: 'Failed to search word bank' },
      { status: 500 }
    );
  }
}
