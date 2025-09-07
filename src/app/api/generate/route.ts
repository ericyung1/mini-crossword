import { NextRequest, NextResponse } from 'next/server';
import { validateAllTemplates, getTemplateById, getRandomTemplate, CROSSWORD_TEMPLATES } from '@/lib/templates';
import { getCrosswordGenerator } from '@/lib/crossword-generator';

export async function POST(request: NextRequest) {
  try {
    const { templateId, generateClues = true } = await request.json().catch(() => ({}));
    
    // Get template
    const template = templateId 
      ? getTemplateById(templateId) 
      : getRandomTemplate();
    
    if (!template) {
      return NextResponse.json(
        { error: `Template ${templateId || 'random'} not found` },
        { status: 404 }
      );
    }
    
    // Generate crossword puzzle
    const generator = getCrosswordGenerator();
    const puzzle = await generator.generateCrossword(template, generateClues);
    
    return NextResponse.json({
      success: true,
      puzzle,
      message: `Generated crossword using template "${template.name}"`,
      stats: {
        generationTime: puzzle.generationTime,
        totalWords: puzzle.words.length,
        acrossWords: puzzle.acrossSlots.length,
        downWords: puzzle.downSlots.length,
        templateId: template.id
      }
    });
  } catch (error) {
    console.error('Error generating crossword:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate crossword puzzle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { valid, invalid } = validateAllTemplates();
    
    return NextResponse.json({
      message: 'NYT-Style Mini Crossword Generator - Ready!',
      algorithm: {
        name: 'Backtracking with Constraint Satisfaction',
        description: 'Advanced algorithm using Most Constrained Variable heuristic and forward checking',
        features: [
          'Slot detection with flood-fill algorithm',
          'Constraint-based word placement',
          'Intersection validation',
          'Frequency-optimized word selection',
          'OpenAI-generated NYT-style clues'
        ]
      },
      framework: {
        totalTemplates: CROSSWORD_TEMPLATES.length,
        validTemplates: valid.length,
        invalidTemplates: invalid.length,
        templates: CROSSWORD_TEMPLATES.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description
        })),
        status: 'Production Ready - Algorithm Implemented'
      },
      usage: {
        generate: 'POST /api/generate with optional { templateId, generateClues }',
        example: '{ "templateId": "c1", "generateClues": true }'
      }
    });
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get framework status' },
      { status: 500 }
    );
  }
}
