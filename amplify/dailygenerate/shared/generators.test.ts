import { describe, it, expect, vi } from 'vitest';
import { genQuizAnswers, genAcrostic } from './generators';

/** A fake Bedrock response wrapping a forced tool_use block. */
const tool = (name: string, input: unknown) => ({ content: [{ type: 'tool_use', name, input }] });

const capitals = (names: string[]) =>
  tool('generate_answers', { answers: names.map((n) => ({ display: n, accepted: [n] })) });

describe('genQuizAnswers', () => {
  it('parses + returns a valid answer set', async () => {
    const invoke = vi.fn().mockResolvedValue(capitals(['Tokyo', 'Paris', 'Rome', 'Cairo']));
    const out = await genQuizAnswers(invoke, 'CLASSIC', 'World Capitals');
    expect(out.map((a) => a.display)).toEqual(['Tokyo', 'Paris', 'Rome', 'Cairo']);
  });

  it('retries past a too-thin set (< 4 answers) then returns a valid one', async () => {
    const invoke = vi
      .fn()
      .mockResolvedValueOnce(capitals(['Tokyo', 'Paris'])) // too few → rejected
      .mockResolvedValueOnce(capitals(['Tokyo', 'Paris', 'Rome', 'Cairo', 'Lima']));
    const out = await genQuizAnswers(invoke, 'CLASSIC', 'World Capitals');
    expect(out).toHaveLength(5);
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});

describe('genAcrostic', () => {
  it('retries past an invalid acrostic (wrong initials) then returns a valid one', async () => {
    const bad = tool('make_acrostic', {
      title: 'x',
      quote: 'A real saying.',
      author: 'Someone',
      clues: [{ clue: 'c', answer: 'zebra' }], // wrong count + wrong initial for CAT
    });
    const good = tool('make_acrostic', {
      title: 'Feline Trio',
      quote: 'Cats rule.',
      author: 'Someone',
      clues: [
        { clue: 'A feline', answer: 'cat' },
        { clue: 'A citrus', answer: 'apple' },
        { clue: 'Frozen water', answer: 'teapot' },
      ],
    });
    const invoke = vi.fn().mockResolvedValueOnce(bad).mockResolvedValueOnce(good);
    const out = await genAcrostic(invoke, 'CAT');
    expect(out.clues.map((c) => c.answer[0])).toEqual(['c', 'a', 't']);
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});
