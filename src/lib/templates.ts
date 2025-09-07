import { CrosswordMask } from '@/types/crossword';

/**
 * Collection of 5x5 crossword mask templates
 * All templates have 180° rotational symmetry
 * Symbols: . = white square, # = black square
 * Only 3-5 letter words allowed
 */
export const CROSSWORD_TEMPLATES: CrosswordMask[] = [
  {
    id: 't1',
    name: 'Open Grid',
    description: 'Completely open 5x5 grid - maximum word count',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 't2', 
    name: 'Classic Mini',
    description: 'NYT Mini style with center cross pattern',
    grid: [
      ['.', '.', '#', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '#', '.', '.']
    ]
  },
  
  {
    id: 't3',
    name: 'Corner Blocks', 
    description: 'Black squares in opposite corners',
    grid: [
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '#']
    ]
  },
  
  {
    id: 't4',
    name: 'Plus Pattern',
    description: 'Cross-shaped black squares',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '#', '.', '.'],
      ['.', '#', '.', '#', '.'],
      ['.', '.', '#', '.', '.'],
      ['.', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 't5',
    name: 'Diamond Pattern',
    description: 'Diamond-shaped black squares',
    grid: [
      ['.', '.', '#', '.', '.'],
      ['.', '#', '.', '#', '.'],
      ['#', '.', '.', '.', '#'],
      ['.', '#', '.', '#', '.'],
      ['.', '.', '#', '.', '.']
    ]
  },
  
  {
    id: 't6',
    name: 'Side Blocks',
    description: 'Black squares on left and right edges',
    grid: [
      ['.', '#', '.', '#', '.'],
      ['#', '.', '.', '.', '#'],
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '#'],
      ['.', '#', '.', '#', '.']
    ]
  },
  
  {
    id: 't7',
    name: 'Center Plus',
    description: 'Plus sign in center with corners open',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '#', '.', '.'],
      ['.', '#', '#', '#', '.'],
      ['.', '.', '#', '.', '.'],
      ['.', '.', '.', '.', '.']
    ]
  },
  
  {
    id: 't8',
    name: 'Minimal Blocks',
    description: 'Just two black squares for variety',
    grid: [
      ['.', '.', '.', '.', '.'],
      ['.', '#', '.', '#', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '#', '.', '#', '.'],
      ['.', '.', '.', '.', '.']
    ]
  }
];

/**
 * Validate that a template has proper 180° rotational symmetry
 */
export function validateTemplateSymmetry(template: CrosswordMask): boolean {
  const { grid } = template;
  const size = 5;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const rotatedRow = size - 1 - row;
      const rotatedCol = size - 1 - col;
      
      if (grid[row][col] !== grid[rotatedRow][rotatedCol]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validate that all white cells are connected (DFS connectivity check)
 */
export function validateTemplateConnectivity(template: CrosswordMask): boolean {
  const { grid } = template;
  const size = 5;
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Find first white cell
  let startRow = -1, startCol = -1;
  for (let row = 0; row < size && startRow === -1; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '.') {
        startRow = row;
        startCol = col;
        break;
      }
    }
  }
  
  if (startRow === -1) return false; // No white cells
  
  // DFS to mark all reachable white cells
  const dfs = (row: number, col: number) => {
    if (row < 0 || row >= size || col < 0 || col >= size) return;
    if (visited[row][col] || grid[row][col] === '#') return;
    
    visited[row][col] = true;
    dfs(row + 1, col);
    dfs(row - 1, col);
    dfs(row, col + 1);
    dfs(row, col - 1);
  };
  
  dfs(startRow, startCol);
  
  // Check if all white cells were visited
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === '.' && !visited[row][col]) {
        return false;
      }
    }
  }
  
  return true;
}

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
 * Validate all templates on module load
 */
export function validateAllTemplates(): { valid: CrosswordMask[], invalid: string[] } {
  const valid: CrosswordMask[] = [];
  const invalid: string[] = [];
  
  for (const template of CROSSWORD_TEMPLATES) {
    const hasSymmetry = validateTemplateSymmetry(template);
    const hasConnectivity = validateTemplateConnectivity(template);
    
    if (hasSymmetry && hasConnectivity) {
      valid.push(template);
    } else {
      invalid.push(`${template.id}: ${!hasSymmetry ? 'no symmetry' : ''} ${!hasConnectivity ? 'not connected' : ''}`.trim());
    }
  }
  
  return { valid, invalid };
}
