/** Shape of a seeded word ladder — DATA (gate-exempt). Shared by the generated
 * fixture (ladders.ts) and the seed runner. */
export interface LadderFixture {
  start: string;
  target: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  parPath: string[];
  dictionary: string[];
}
