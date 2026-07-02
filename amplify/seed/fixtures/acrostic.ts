/** Hand-authored, valid Acrostic puzzles — DATA (gate-exempt). Each puzzle has a
 * short quote revealed progressively as its clues are solved. Clues are simple
 * general-knowledge one-word answers. Shared by the seed runner. */
export interface AcrosticFixture {
  title: string;
  quote: string;
  author: string;
  clues: { clue: string; answer: string }[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const seedAcrostics: AcrosticFixture[] = [
  {
    title: 'On Trying',
    quote: 'Do or do not, there is no try.',
    author: 'Yoda',
    difficulty: 'EASY',
    clues: [
      { clue: 'A small domesticated feline', answer: 'cat' },
      { clue: 'Frozen water', answer: 'ice' },
      { clue: 'Our home planet', answer: 'earth' },
    ],
  },
  {
    title: 'On Curiosity',
    quote: 'The important thing is not to stop questioning.',
    author: 'Albert Einstein',
    difficulty: 'MEDIUM',
    clues: [
      { clue: 'The star at the center of our solar system', answer: 'sun' },
      { clue: 'A large body of salt water', answer: 'ocean' },
      { clue: 'The season after winter', answer: 'spring' },
      { clue: 'A three-sided polygon', answer: 'triangle' },
    ],
  },
  {
    title: 'On Perseverance',
    quote: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
    difficulty: 'HARD',
    clues: [
      { clue: 'The opposite of night', answer: 'day' },
      { clue: 'A tall plant with a trunk', answer: 'tree' },
      { clue: 'The gas we breathe to live', answer: 'oxygen' },
      { clue: 'A journey to explore space', answer: 'mission' },
      { clue: 'The color of a clear sky', answer: 'blue' },
    ],
  },
];
