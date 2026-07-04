/** Shape of a seeded Spelling Bee puzzle — DATA (gate-exempt). Shared by the
 * generated fixture (spellingBee.ts) and the seed runner. */
export interface BeeFixture {
  letters: string;
  centerLetter: string;
  answers: string[];
  pangrams: string[];
}
