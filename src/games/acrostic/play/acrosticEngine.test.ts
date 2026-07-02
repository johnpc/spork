import { describe, it, expect } from 'vitest';
import {
  normalize,
  matchesAnswer,
  isComplete,
  secretWord,
  wordSlots,
  type Clue,
} from './acrosticEngine';

describe('normalize', () => {
  it('lowercases and strips spaces + punctuation', () => {
    expect(normalize('New York!')).toBe('newyork');
    expect(normalize('  Côte  ')).toBe('cte');
    expect(normalize('Isn’t it')).toBe('isntit');
  });
});

describe('matchesAnswer', () => {
  it('matches case- and space-insensitively', () => {
    expect(matchesAnswer('CAT', 'cat')).toBe(true);
    expect(matchesAnswer(' Cat ', 'cat')).toBe(true);
    expect(matchesAnswer('new york', 'New York')).toBe(true);
  });
  it('rejects a mismatch or empty guess', () => {
    expect(matchesAnswer('dog', 'cat')).toBe(false);
    expect(matchesAnswer('   ', 'cat')).toBe(false);
    expect(matchesAnswer('', 'cat')).toBe(false);
  });
});

describe('isComplete', () => {
  it('true only when all clues solved', () => {
    expect(isComplete(new Set([0, 1, 2]), 3)).toBe(true);
    expect(isComplete(new Set([0, 1]), 3)).toBe(false);
  });
  it('false for a zero-clue puzzle', () => {
    expect(isComplete(new Set(), 0)).toBe(false);
  });
});

const OCEAN: Clue[] = [
  { clue: 'A citrus fruit', answer: 'orange' },
  { clue: 'A baby cow', answer: 'calf' },
  { clue: 'A large grey mammal', answer: 'elephant' },
  { clue: 'Keeps the doctor away', answer: 'apple' },
  { clue: 'Opposite of day', answer: 'night' },
];

describe('secretWord', () => {
  it('spells the word from the answers’ initials', () => {
    expect(secretWord(OCEAN)).toBe('OCEAN');
  });
  it('is empty for no clues', () => {
    expect(secretWord([])).toBe('');
  });
});

describe('wordSlots', () => {
  it('reveals a slot’s letter only once its clue is solved', () => {
    const slots = wordSlots(OCEAN, new Set([0, 2]));
    expect(slots.map((s) => s.letter)).toEqual(['O', 'C', 'E', 'A', 'N']);
    expect(slots.map((s) => s.revealed)).toEqual([true, false, true, false, false]);
  });
});
