import { CrosswordMask } from '@/types/crossword';

/**
 * Collection of 5x5 crossword mask templates
 * Symbols: . = white square, # = black square
 * Only 3-5 letter words allowed
 */
export const CROSSWORD_TEMPLATES: CrosswordMask[] = [
  {
    id: 'c1',
    name: 'Bottom Corner L',
    description: 'L-shaped black pattern in bottom left corner',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 'c2',
    name: 'Asymmetric Corners',
    description: 'Black squares in top corners with bottom left offset',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 'c3',
    name: 'Corner Balance',
    description: 'Balanced black squares in opposite corners',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c4',
    name: 'Diagonal Block',
    description: 'Diagonal black square pattern from top-left',
    grid: [
      ['#', '#', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#'],
      ['.', '.', '.', '#', '#']
    ]
  },
  
  {
    id: 'c5',
    name: 'Three Corner',
    description: 'Black squares in three corners with bottom right offset',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#'],
      ['.', '.', '.', '#', '#']
    ]
  },
  
  {
    id: 'c6',
    name: 'Right Edge',
    description: 'Black squares along the right edge',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c7',
    name: 'Corner Triangle',
    description: 'Triangular black pattern in corners',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 'c8',
    name: 'Opposite Singles',
    description: 'Single black squares in opposite corners',
    grid: [
      ['#', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c9',
    name: 'Top Right Block',
    description: 'Rectangular black pattern in top right corner',
    grid: [
      ['.', '.', '.', '#', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c10',
    name: 'Top Left Block',
    description: 'Rectangular black pattern in top left corner',
    grid: [
      ['#', '#', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 'c11',
    name: 'Bottom Edge',
    description: 'Black squares along the bottom edge',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '#'],
      ['#', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c12',
    name: 'Left Edge',
    description: 'Black squares along the left edge',
    grid: [
      ['#', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c13',
    name: 'Offset Corners',
    description: 'Black squares in offset corner positions',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 'c14',
    name: 'Right Singles',
    description: 'Single black squares on the right side',
    grid: [
      ['.', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 'c15',
    name: 'Partial Corners',
    description: 'Black squares in partial corner configuration',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]
  }
];


/**
 * Get a random template from the collection
 */
export function getRandomTemplate(seed?: number): CrosswordMask {
  if (seed !== undefined) {
    // Simple seeded random selection
    const index = seed % CROSSWORD_TEMPLATES.length;
    return CROSSWORD_TEMPLATES[index];
  }
  
  const index = Math.floor(Math.random() * CROSSWORD_TEMPLATES.length);
  return CROSSWORD_TEMPLATES[index];
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): CrosswordMask | null {
  return CROSSWORD_TEMPLATES.find(template => template.id === id) || null;
}

/**
 * Get all templates (no validation - assumes all templates are correct)
 */
export function validateAllTemplates(): { valid: CrosswordMask[], invalid: string[] } {
  return {
    valid: [...CROSSWORD_TEMPLATES],
    invalid: []
  };
}

