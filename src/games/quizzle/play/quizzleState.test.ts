import { describe, it, expect } from 'vitest';
import { initSession, placeWager, resolveGuess, nextQuestion } from './quizzleState';

const q = { question: 'Capital of France?', answer: 'Paris' };

describe('initSession', () => {
  it('starts at question 0 in the wager stage', () => {
    const s = initSession(1000);
    expect(s).toMatchObject({ index: 0, bank: 1000, stage: 'wager', wager: 1 });
  });
});

describe('placeWager', () => {
  it('clamps the wager and moves to the answer stage', () => {
    const s = placeWager(initSession(1000), 5000);
    expect(s.wager).toBe(1000);
    expect(s.stage).toBe('answer');
  });
  it('is a no-op outside the wager stage', () => {
    const answering = placeWager(initSession(1000), 500);
    expect(placeWager(answering, 200)).toBe(answering);
  });
});

describe('resolveGuess', () => {
  it('adds the wager on a correct answer', () => {
    const s = resolveGuess(placeWager(initSession(1000), 500), 'paris', q);
    expect(s.bank).toBe(1500);
    expect(s.lastCorrect).toBe(true);
    expect(s.lastAnswer).toBe('Paris');
  });
  it('subtracts the wager on a wrong answer', () => {
    const s = resolveGuess(placeWager(initSession(1000), 500), 'london', q);
    expect(s.bank).toBe(500);
    expect(s.lastCorrect).toBe(false);
  });
  it('is a no-op outside the answer stage', () => {
    const s = initSession(1000);
    expect(resolveGuess(s, 'paris', q)).toBe(s);
  });
});

describe('nextQuestion', () => {
  it('advances to the next wager stage when questions remain', () => {
    const s = nextQuestion(placeWager(initSession(1000), 100), 3);
    expect(s).toMatchObject({ index: 1, stage: 'wager', wager: 1, lastCorrect: null });
  });
  it('finishes when questions run out', () => {
    const s = nextQuestion({ ...initSession(1000), index: 2 }, 3);
    expect(s.stage).toBe('done');
  });
  it('finishes when the bank is empty', () => {
    const s = nextQuestion({ ...initSession(0), index: 0 }, 5);
    expect(s.stage).toBe('done');
  });
});
