import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  putItem: vi.fn(),
  batchPut: vi.fn(),
  genQuizAnswers: vi.fn(),
  genLadder: vi.fn(),
  genAcrostic: vi.fn(),
  genQuizzle: vi.fn(),
  genConnections: vi.fn(),
}));
vi.mock('../../deckgen/shared/bedrock', () => ({ invokeText: vi.fn() }));
vi.mock('../../deckgen/shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('../../quizgen/shared/batchWrite', () => ({ batchPut: e.batchPut }));
vi.mock('./generators', () => ({
  genQuizAnswers: e.genQuizAnswers,
  genLadder: e.genLadder,
  genAcrostic: e.genAcrostic,
  genQuizzle: e.genQuizzle,
  genConnections: e.genConnections,
}));

import { generateDayFor, summarize } from './generateDay';

const env = (n: string): string => n.toLowerCase();

beforeEach(() => {
  vi.clearAllMocks();
  e.genQuizAnswers.mockResolvedValue([
    { promptKind: 'NONE', display: 'Tokyo', accepted: ['Tokyo'] },
  ]);
  e.genLadder.mockResolvedValue({ start: 'cat', target: 'dog', parPath: ['cat', 'dog'], dictionary: ['cat', 'dog'] }); // prettier-ignore
  e.genAcrostic.mockResolvedValue({ title: 't', quote: 'q', author: 'a', clues: [{ clue: 'c', answer: 'o' }] }); // prettier-ignore
  e.genQuizzle.mockResolvedValue({ topic: 'Geo', questions: [{ q: 1 }] });
  e.genConnections.mockResolvedValue({
    groups: [
      { theme: 't0', words: ['a', 'b', 'c', 'd'], level: 0 },
      { theme: 't1', words: ['e', 'f', 'g', 'h'], level: 1 },
      { theme: 't2', words: ['i', 'j', 'k', 'l'], level: 2 },
      { theme: 't3', words: ['m', 'n', 'o', 'p'], level: 3 },
    ],
  });
});

describe('generateDayFor', () => {
  it('generates every game for an injected date with deterministic ids', async () => {
    const results = await generateDayFor('2026-03-01', env);
    // 5 quiz types + 6 islands = 11 rows; all stamped with the requested date.
    expect(e.putItem).toHaveBeenCalledTimes(11);
    expect(results.filter(Boolean)).toHaveLength(11);
    for (const [, item] of e.putItem.mock.calls) {
      expect(item.puzzleDate).toBe('2026-03-01');
      expect(String(item.id)).toMatch(/^daily-[a-z_]+-2026-03-01$/); // deterministic, no random suffix
    }
  });

  it('skips a game that already exists for the date (no Bedrock, no write)', async () => {
    // Pretend the wordle + connections rows already exist for this date.
    const exists = vi.fn(async (_t: string, id: string) => id.includes('wordle') || id.includes('connections')); // prettier-ignore
    const results = await generateDayFor('2026-03-01', env, exists);
    // 11 games minus the 2 skipped = 9 writes; connections' generator never runs.
    expect(e.putItem).toHaveBeenCalledTimes(9);
    expect(e.genConnections).not.toHaveBeenCalled();
    const wroteWordle = e.putItem.mock.calls.some(([, i]) => i.__typename === 'WordlePuzzle');
    expect(wroteWordle).toBe(false);
    expect(results).toHaveLength(11); // still recorded (as successful no-ops)
  });
});

describe('summarize', () => {
  it('does not throw when at least one game was generated', () => {
    expect(() => summarize([true, false], '2026-03-01')).not.toThrow();
  });
  it('throws on a total wipeout (0 successes)', () => {
    expect(() => summarize([false, false], '2026-03-01')).toThrow(/produced NOTHING/);
  });
});
