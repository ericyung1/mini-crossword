import { NextResponse } from 'next/server';
import { getWordHistory } from '@/lib/word-history';

export async function GET() {
  try {
    const wordHistory = getWordHistory();
    const stats = wordHistory.getStats();
    const recentWords = Array.from(wordHistory.getRecentWords(10));
    
    return NextResponse.json({
      stats,
      recentWords: recentWords.slice(0, 20), // Show first 20 recent words
      message: `Tracking ${stats.uniqueWords} unique words across ${stats.uniquePuzzles} puzzles`
    });
  } catch (error) {
    console.error('Error getting word history:', error);
    return NextResponse.json(
      { error: 'Failed to load word history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const wordHistory = getWordHistory();
    wordHistory.clear();
    
    return NextResponse.json({
      message: 'Word history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing word history:', error);
    return NextResponse.json(
      { error: 'Failed to clear word history' },
      { status: 500 }
    );
  }
}
