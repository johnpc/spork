import { describe, it, expect } from 'vitest';
import { applyAttempt } from './scoringModes';
import type { AnswerRecord } from '../../../lib/dataClient';

const ans = (over: Partial<AnswerRecord>): AnswerRecord => over as AnswerRecord;
const answers = [
  ans({ id: 'a', orderIndex: 0, bucket: 'red' }),
  ans({ id: 'b', orderIndex: 1, bucket: 'blue' }),
  ans({ id: 'c', orderIndex: 2, bucket: 'red' }),
];
const running = { found: new Set<string>(), status: 'running' as const };

describe('applyAttempt — membership', () => {
  it('counts a fresh id and completes when all found', () => {
    const r1 = applyAttempt('MEMBERSHIP', running, { answerId: 'a' }, answers);
    expect(r1.hit).toBe(true);
    expect([...r1.found]).toEqual(['a']);
    const r2 = applyAttempt(
      'MEMBERSHIP',
      { found: new Set(['a', 'b']), status: 'running' },
      { answerId: 'c' },
      answers,
    );
    expect(r2.status).toBe('done');
  });
  it('ignores an unknown or duplicate id (no strike)', () => {
    expect(applyAttempt('MEMBERSHIP', running, { answerId: null }, answers).hit).toBe(false);
    const dup = applyAttempt(
      'MEMBERSHIP',
      { found: new Set(['a']), status: 'running' },
      { answerId: 'a' },
      answers,
    );
    expect(dup.hit).toBe(false);
    expect(dup.status).toBe('running');
  });
});

describe('applyAttempt — elimination (minefield)', () => {
  it('ends the run on a wrong guess', () => {
    const r = applyAttempt('ELIMINATION', running, { answerId: null }, answers);
    expect(r.status).toBe('done');
    expect(r.hit).toBe(false);
  });
  it('counts a correct guess without ending', () => {
    const r = applyAttempt('ELIMINATION', running, { answerId: 'a' }, answers);
    expect(r.status).toBe('running');
    expect(r.hit).toBe(true);
  });
});

describe('applyAttempt — sequence (order up)', () => {
  it('accepts ids only in orderIndex order', () => {
    const first = applyAttempt('SEQUENCE', running, { answerId: 'a' }, answers);
    expect(first.hit).toBe(true);
    const wrong = applyAttempt(
      'SEQUENCE',
      { found: new Set(['a']), status: 'running' },
      { answerId: 'c' },
      answers,
    );
    expect(wrong.hit).toBe(false); // c is index 2, expected next is 1
    const right = applyAttempt(
      'SEQUENCE',
      { found: new Set(['a']), status: 'running' },
      { answerId: 'b' },
      answers,
    );
    expect(right.hit).toBe(true);
  });
});

describe('applyAttempt — bucketing (sortable)', () => {
  it('counts only when the chosen bucket matches', () => {
    expect(applyAttempt('BUCKETING', running, { answerId: 'a', bucket: 'blue' }, answers).hit).toBe(
      false,
    );
    expect(applyAttempt('BUCKETING', running, { answerId: 'a', bucket: 'red' }, answers).hit).toBe(
      true,
    );
  });
});
