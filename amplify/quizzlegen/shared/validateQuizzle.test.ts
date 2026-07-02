import { describe, it, expect } from 'vitest';
import { validateQuizzle, type QuizzleCandidate } from './validateQuizzle';

const q = (question: string, answer: string, accepted: string[] = []) => ({
  question,
  answer,
  accepted,
});

const good: QuizzleCandidate = {
  topic: 'Science',
  questions: [
    q('Symbol for gold?', 'Au', ['gold']),
    q('Plants absorb which gas?', 'carbon dioxide', ['CO2']),
    q('Planets in the Solar System?', 'eight', ['8']),
    q('Force pulling to Earth?', 'gravity'),
  ],
};

describe('validateQuizzle', () => {
  it('accepts a valid quiz and trims without changing case', () => {
    const r = validateQuizzle({
      ...good,
      topic: '  Science  ',
      questions: [q('  A? ', '  Au ', [' gold ']), ...good.questions.slice(1)],
    });
    expect(r.ok).toBe(true);
    expect(r.quizzle?.topic).toBe('Science');
    expect(r.quizzle?.questions[0]).toEqual({ question: 'A?', answer: 'Au', accepted: ['gold'] });
  });

  it('rejects an empty topic', () => {
    const r = validateQuizzle({ ...good, topic: '   ' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/topic empty/);
  });

  it('rejects fewer than 4 questions', () => {
    const r = validateQuizzle({ ...good, questions: good.questions.slice(0, 3) });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/fewer than 4/);
  });

  it('rejects an empty question', () => {
    const r = validateQuizzle({
      ...good,
      questions: [q('  ', 'A'), ...good.questions.slice(1)],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/question 0 empty/);
  });

  it('rejects an empty answer', () => {
    const r = validateQuizzle({
      ...good,
      questions: [q('Q?', '   '), ...good.questions.slice(1)],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/answer 0 empty/);
  });

  it('rejects a non-string accepted entry', () => {
    const r = validateQuizzle({
      ...good,
      questions: [
        { question: 'Q?', answer: 'A', accepted: [1 as unknown as string] },
        ...good.questions.slice(1),
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/accepted 0 not string/);
  });

  it('rejects when accepted is not an array', () => {
    const r = validateQuizzle({
      ...good,
      questions: [
        { question: 'Q?', answer: 'A', accepted: 'nope' as unknown as string[] },
        ...good.questions.slice(1),
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/accepted 0 not string/);
  });

  it('tolerates missing/nullish fields via defaults', () => {
    const r = validateQuizzle({
      topic: undefined as unknown as string,
      questions: undefined as unknown as QuizzleCandidate['questions'],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/topic empty/);
  });

  it('defaults a nullish questions array to empty (too few)', () => {
    const r = validateQuizzle({
      topic: 'T',
      questions: undefined as unknown as QuizzleCandidate['questions'],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/fewer than 4/);
  });

  it('defaults a nullish question/answer string to empty', () => {
    const missingQ = { answer: 'A', accepted: [] } as unknown as QuizzleCandidate['questions'][0];
    const missingA = {
      question: 'Q?',
      accepted: [],
    } as unknown as QuizzleCandidate['questions'][0];
    expect(
      validateQuizzle({ ...good, questions: [missingQ, ...good.questions.slice(1)] }).reason,
    ).toMatch(/question 0 empty/);
    expect(
      validateQuizzle({ ...good, questions: [missingA, ...good.questions.slice(1)] }).reason,
    ).toMatch(/answer 0 empty/);
  });

  it('rejects an answer that normalizes to empty (unsolvable by the play engine)', () => {
    const r = validateQuizzle({
      ...good,
      questions: [q('Circle ratio symbol?', 'π'), ...good.questions.slice(1)],
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/answer 0 unsolvable/);
  });

  it('accepts a symbol answer when an accepted alternate is typeable', () => {
    const r = validateQuizzle({
      ...good,
      questions: [q('Circle ratio symbol?', 'π', ['pi']), ...good.questions.slice(1)],
    });
    expect(r.ok).toBe(true);
    expect(r.quizzle?.questions[0].answer).toBe('π');
  });

  it('defaults a missing accepted to an empty array', () => {
    const r = validateQuizzle({
      ...good,
      questions: [
        { question: 'Q?', answer: 'A', accepted: undefined as unknown as string[] },
        ...good.questions.slice(1),
      ],
    });
    expect(r.ok).toBe(true);
    expect(r.quizzle?.questions[0].accepted).toEqual([]);
  });
});
