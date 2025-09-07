import { NextRequest, NextResponse } from 'next/server';
import { getCrosswordGenerator } from '@/lib/crossword-generator';
import { validateAllTemplates } from '@/lib/templates';

export async function POST(request: NextRequest) {
  try {
    const { seed, templateId, maxAttempts, timeoutMs } = await request.json().catch(() => ({}));
    
    // Validate templates on first use
    const { valid, invalid } = validateAllTemplates();
    if (invalid.length > 0) {
      console.warn('Invalid templates detected:', invalid);
    }
    
    const generator = getCrosswordGenerator();
    const startTime = performance.now();
    
    const result = await generator.generate({
      seed: typeof seed === 'number' ? seed : undefined,
      templateId: typeof templateId === 'string' ? templateId : undefined,
      maxAttempts: typeof maxAttempts === 'number' ? maxAttempts : 50,
      timeoutMs: typeof timeoutMs === 'number' ? timeoutMs : 10000
    });
    
    const duration = performance.now() - startTime;
    
    if (result.success && result.puzzle) {
      return NextResponse.json({
        ...result.puzzle,
        meta: {
          ...result.puzzle.meta,
          generationTime: Math.round(duration * 100) / 100,
          attempts: result.attempts,
          validTemplates: valid.length,
          invalidTemplates: invalid.length
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Generation failed',
          attempts: result.attempts,
          duration: Math.round(result.duration * 100) / 100
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating crossword:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // GET request generates a random puzzle
    const generator = getCrosswordGenerator();
    const result = await generator.generate();
    
    if (result.success && result.puzzle) {
      return NextResponse.json(result.puzzle);
    } else {
      return NextResponse.json(
        { error: result.error || 'Generation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating crossword:', error);
    return NextResponse.json(
      { error: 'Failed to generate crossword' },
      { status: 500 }
    );
  }
}
