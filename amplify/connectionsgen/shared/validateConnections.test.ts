import { describe, it, expect } from 'vitest';
import { validateConnections, type ConnectionsCandidate } from './validateConnections';

describe('validateConnections', () => {
  const validCandidate: ConnectionsCandidate = {
    groups: [
      { theme: 'Fruits', words: ['apple', 'banana', 'cherry', 'date'], level: 0 },
      { theme: 'Colors', words: ['red', 'blue', 'green', 'yellow'], level: 1 },
      { theme: 'Metals', words: ['iron', 'copper', 'gold', 'silver'], level: 2 },
      { theme: 'Planets', words: ['mars', 'venus', 'jupiter', 'saturn'], level: 3 },
    ],
  };

  it('accepts a valid 4×4 puzzle with distinct words + all levels', () => {
    const v = validateConnections(validCandidate);
    expect(v.ok).toBe(true);
    expect(v.connections?.groups).toHaveLength(4);
    expect(v.connections?.groups[0].words).toEqual(['apple', 'banana', 'cherry', 'date']);
  });

  it('rejects if not exactly 4 groups', () => {
    const v = validateConnections({ groups: [validCandidate.groups[0]] });
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/exactly 4 groups/);
  });

  it('rejects if a group does not have exactly 4 words', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[0] = { ...bad.groups[0], words: ['a', 'b'] }; // only 2
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/does not have exactly 4 words/);
  });

  it('rejects if words are not all distinct (case-insensitive)', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[1] = { ...bad.groups[1], words: ['apple', 'x', 'y', 'z'] }; // dupe "apple"
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/not all distinct/);
  });

  it('rejects if a group has an empty theme', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[0] = { ...bad.groups[0], theme: '' };
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/missing theme/);
  });

  it('rejects if levels do not cover 0–3', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[3] = { ...bad.groups[3], level: 0 }; // now two level-0, no level-3
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/levels must cover 0–3/);
  });

  it('rejects if a level is out of range', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[0] = { ...bad.groups[0], level: 5 };
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/invalid level/);
  });

  it('rejects if a group has an empty or invalid word', () => {
    const bad = { ...validCandidate, groups: [...validCandidate.groups] };
    bad.groups[0] = { ...bad.groups[0], words: ['', 'banana', 'cherry', 'date'] };
    const v = validateConnections(bad);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/empty\/invalid word/);
  });
});
