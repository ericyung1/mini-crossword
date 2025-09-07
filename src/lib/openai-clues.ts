import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate NYT-style crossword clues using OpenAI
 * 
 * NYT clue characteristics:
 * - Concise and clever
 * - Often use wordplay, puns, or cultural references
 * - Difficulty appropriate for mini crossword (easier than full NYT)
 * - Length typically 2-8 words
 * - No abbreviations in clues unless the answer is an abbreviation
 */

export interface ClueRequest {
  word: string;
  direction: 'across' | 'down';
  length: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export async function generateClue(request: ClueRequest): Promise<string> {
  const { word, direction, length, difficulty = 'easy' } = request;
  
  try {
    const prompt = createCluePrompt(word, direction, difficulty);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model for clue generation
      messages: [
        {
          role: 'system',
          content: `You are an expert crossword puzzle constructor for the New York Times Mini Crossword. 
          Generate clever, concise clues that are appropriate for a daily mini crossword puzzle.
          
          Guidelines:
          - Keep clues short and snappy (2-8 words typically)
          - Use wordplay, puns, or clever misdirection when appropriate
          - Make clues accessible but engaging
          - No abbreviations in clues unless the answer is an abbreviation
          - Consider cultural references that are widely known
          - For mini crosswords, lean slightly easier than full NYT puzzles
          - Respond with ONLY the clue text, no quotes or extra formatting`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0.8, // Allow for creative variation
      top_p: 0.9,
    });

    const clue = completion.choices[0]?.message?.content?.trim();
    
    if (!clue) {
      throw new Error('No clue generated');
    }
    
    return clue;
  } catch (error) {
    console.error(`Error generating clue for ${word}:`, error);
    
    // Fallback to simple definition-style clue
    return generateFallbackClue(word);
  }
}

/**
 * Generate multiple clues for a set of words efficiently
 */
export async function generateCluesForPuzzle(
  words: Array<{ word: string; direction: 'across' | 'down' }>
): Promise<Map<string, string>> {
  const clueMap = new Map<string, string>();
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    
    const cluePromises = batch.map(async ({ word, direction }) => {
      try {
        const clue = await generateClue({
          word,
          direction,
          length: word.length,
          difficulty: 'easy'
        });
        return { word, clue };
      } catch (error) {
        console.error(`Failed to generate clue for ${word}:`, error);
        return { word, clue: generateFallbackClue(word) };
      }
    });
    
    const batchResults = await Promise.all(cluePromises);
    batchResults.forEach(({ word, clue }) => {
      clueMap.set(word, clue);
    });
    
    // Small delay between batches to be respectful of rate limits
    if (i + batchSize < words.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return clueMap;
}

/**
 * Create a prompt for generating a clue for a specific word
 */
function createCluePrompt(word: string, direction: 'across' | 'down', difficulty: string): string {
  const wordUpper = word.toUpperCase();
  const difficultyNote = difficulty === 'easy' 
    ? 'Make this clue accessible and straightforward.'
    : difficulty === 'medium'
    ? 'Make this clue moderately challenging with some wordplay.'
    : 'Make this clue challenging with clever misdirection or advanced wordplay.';
  
  return `Generate a crossword clue for the word "${wordUpper}" (${word.length} letters, ${direction}).
  
${difficultyNote}

Examples of good NYT Mini clues:
- For "APPLE": "Tech giant or fruit"
- For "OCEAN": "Atlantic or Pacific"  
- For "DANCE": "Tango or waltz"
- For "HEART": "Valentine symbol"
- For "BREAD": "Sandwich staple"

Generate a clue for "${wordUpper}":`;
}

/**
 * Generate a simple fallback clue when OpenAI fails
 */
function generateFallbackClue(word: string): string {
  const definitions: Record<string, string> = {
    // Common 3-letter words
    'cat': 'Feline pet',
    'dog': 'Canine companion',
    'sun': 'Solar body',
    'car': 'Motor vehicle',
    'run': 'Sprint or jog',
    'eat': 'Consume food',
    'sea': 'Large body of water',
    'sky': 'Heavens above',
    'red': 'Color of roses',
    'big': 'Large in size',
    
    // Common 4-letter words
    'love': 'Deep affection',
    'home': 'Where the heart is',
    'book': 'Reading material',
    'tree': 'Oak or maple',
    'fire': 'Burning flame',
    'moon': 'Lunar body',
    'bird': 'Feathered flyer',
    'fish': 'Aquatic animal',
    'hand': 'Body part with fingers',
    'word': 'Unit of language',
    
    // Common 5-letter words
    'house': 'Dwelling place',
    'water': 'H2O',
    'music': 'Melodic sounds',
    'heart': 'Organ that pumps blood',
    'light': 'Illumination',
    'world': 'Planet Earth',
    'money': 'Currency',
    'happy': 'Joyful feeling',
    'dance': 'Rhythmic movement',
    'smile': 'Happy expression',
  };
  
  return definitions[word.toLowerCase()] || `${word.length}-letter word`;
}
