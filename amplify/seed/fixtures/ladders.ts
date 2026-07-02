/** Seed word ladders for the Steps game — DATA (gate-exempt). Each dictionary
 * is the set of words REACHABLE/allowed for that puzzle (kept small + curated so
 * the puzzle is solvable and self-contained); parPath is a verified solution.
 * Words are lowercase; the engine + client normalize case. */
export interface LadderFixture {
  start: string;
  target: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  parPath: string[];
  dictionary: string[];
}

export const seedLadders: LadderFixture[] = [
  {
    start: 'cat',
    target: 'dog',
    difficulty: 'EASY',
    parPath: ['cat', 'cot', 'cog', 'dog'],
    dictionary: [
      'cat',
      'cot',
      'cog',
      'dog',
      'dot',
      'dat',
      'cag',
      'bat',
      'bot',
      'bog',
      'log',
      'lot',
    ],
  },
  {
    start: 'cold',
    target: 'warm',
    difficulty: 'MEDIUM',
    parPath: ['cold', 'cord', 'word', 'ward', 'warm'],
    dictionary: [
      'cold',
      'cord',
      'word',
      'ward',
      'warm',
      'wold',
      'wold',
      'card',
      'core',
      'wore',
      'ware',
      'cole',
    ],
  },
  {
    start: 'head',
    target: 'tail',
    difficulty: 'HARD',
    parPath: ['head', 'heal', 'teal', 'tell', 'tall', 'tail'],
    dictionary: [
      'head',
      'heal',
      'teal',
      'tell',
      'tall',
      'tail',
      'held',
      'herd',
      'heat',
      'seal',
      'teel',
      'toll',
      'ball',
      'bail',
    ],
  },
];
