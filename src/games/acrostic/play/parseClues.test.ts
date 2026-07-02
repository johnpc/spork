import { describe, it, expect } from 'vitest';
import { parseClues } from './parseClues';

describe('parseClues', () => {
  it('parses a valid clues array', () => {
    const json = JSON.stringify([
      { clue: 'A feline', answer: 'cat' },
      { clue: 'Frozen water', answer: 'ice' },
    ]);
    expect(parseClues(json)).toEqual([
      { clue: 'A feline', answer: 'cat' },
      { clue: 'Frozen water', answer: 'ice' },
    ]);
  });

  it('drops entries missing a clue or answer', () => {
    const json = JSON.stringify([
      { clue: 'ok', answer: 'yes' },
      { clue: '', answer: 'no' },
      { clue: 'nope' },
      { answer: 'orphan' },
      42,
      null,
    ]);
    expect(parseClues(json)).toEqual([{ clue: 'ok', answer: 'yes' }]);
  });

  it('degrades to empty on malformed or missing JSON', () => {
    expect(parseClues('not json')).toEqual([]);
    expect(parseClues(null)).toEqual([]);
    expect(parseClues(undefined)).toEqual([]);
    expect(parseClues(JSON.stringify({ not: 'an array' }))).toEqual([]);
  });
});
