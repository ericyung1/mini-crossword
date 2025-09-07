import { NextResponse } from 'next/server';
import { runMinimalTest } from '@/lib/minimal-test';

export async function GET() {
  try {
    console.log('🧪 Running minimal test...');
    const result = await runMinimalTest();
    
    if (result.success) {
      console.log('✅ Minimal test passed!');
      return NextResponse.json({
        success: true,
        message: 'Minimal test passed',
        details: result.details
      });
    } else {
      console.log('❌ Minimal test failed:', result.error);
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Minimal test failed'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 Error in minimal test:', error);
    return NextResponse.json(
      { error: 'Failed to run minimal test' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Same as GET
}
