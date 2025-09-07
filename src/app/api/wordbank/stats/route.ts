import { NextResponse } from 'next/server';
import { getWordBank } from '@/lib/wordbank';

export async function GET() {
  try {
    const wordBank = getWordBank();
    await wordBank.initialize();
    
    const stats = wordBank.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting word bank stats:', error);
    return NextResponse.json(
      { error: 'Failed to load word bank statistics' },
      { status: 500 }
    );
  }
}
