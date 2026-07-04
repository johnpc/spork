/** Type for seeded Connections puzzles. DATA. */
export interface ConnectionsFixture {
  groups: { theme: string; words: string[]; level: number }[];
  maxMistakes?: number;
}
