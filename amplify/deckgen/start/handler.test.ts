import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({ putItem: vi.fn(), invokeWorker: vi.fn() }));
vi.mock('../shared/ddb', () => ({ putItem: e.putItem }));
vi.mock('./invokeWorker', () => ({ invokeWorker: e.invokeWorker }));

import { handler } from './handler';

const event = {
  arguments: { topic: 'Spanish', categorySlug: 'languages', cardCount: 10, voiceLanguage: 'es-ES' },
} as Parameters<typeof handler>[0];

describe('generateDeck starter handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DECK_TABLE = 'decks';
    process.env.GENERATION_RUN_TABLE = 'runs';
    process.env.WORKER_FUNCTION_NAME = 'worker-fn';
    e.putItem.mockResolvedValue(undefined);
    e.invokeWorker.mockResolvedValue(undefined);
  });

  it('creates a DRAFT deck + RUNNING run and async-invokes the worker', async () => {
    const out = await handler(event, {} as never, {} as never);
    expect(out).toHaveProperty('runId');
    expect(out).toHaveProperty('deckId');
    const deckItem = e.putItem.mock.calls.find((c) => c[0] === 'decks')?.[1];
    const runItem = e.putItem.mock.calls.find((c) => c[0] === 'runs')?.[1];
    expect(deckItem).toMatchObject({ __typename: 'Deck', status: 'DRAFT', topic: 'Spanish' });
    expect(runItem).toMatchObject({
      __typename: 'GenerationRun',
      status: 'RUNNING',
      requestedCount: 10,
    });
    expect(e.invokeWorker).toHaveBeenCalledWith(
      'worker-fn',
      expect.objectContaining({ runId: out?.runId, deckId: out?.deckId, topic: 'Spanish' }),
    );
  });
});
