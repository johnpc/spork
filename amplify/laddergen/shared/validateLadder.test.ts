import { describe, it, expect } from 'vitest';
import { validateLadder } from './validateLadder';

const good = {
  start: 'cat',
  target: 'dog',
  path: ['cat', 'cot', 'cog', 'dog'],
  dictionary: ['cat', 'cot', 'cog', 'dog', 'bat'],
};

describe('validateLadder', () => {
  it('accepts a valid ladder and normalizes lowercase + dedupes dictionary', () => {
    const r = validateLadder({ ...good, start: 'CAT', path: ['CAT', 'cot', 'cog', 'dog'] });
    expect(r.ok).toBe(true);
    expect(r.ladder?.start).toBe('cat');
    expect(r.ladder?.parPath).toEqual(['cat', 'cot', 'cog', 'dog']);
    expect(r.ladder?.dictionary).toContain('bat');
  });

  it('rejects a two-letter step', () => {
    const r = validateLadder({ ...good, path: ['cat', 'dog'], target: 'dog' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/one letter/);
  });

  it('rejects a path word missing from the dictionary', () => {
    const r = validateLadder({ ...good, dictionary: ['cat', 'cot', 'dog'] });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not in dictionary/);
  });

  it('rejects when path does not start at start / end at target', () => {
    expect(validateLadder({ ...good, start: 'bat' }).ok).toBe(false);
    expect(validateLadder({ ...good, target: 'bog' }).ok).toBe(false);
  });

  it('rejects a repeated word', () => {
    const r = validateLadder({
      start: 'cat',
      target: 'cot',
      path: ['cat', 'cot', 'cat', 'cot'],
      dictionary: ['cat', 'cot'],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/repeated/);
  });

  it('rejects a too-short path', () => {
    expect(validateLadder({ ...good, path: ['cat'] }).ok).toBe(false);
  });
});
