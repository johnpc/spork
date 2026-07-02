import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startMapQuiz, type MapQuizWriters } from './startMapQuiz';
import { WORLD_COUNTRIES } from '../fixtures/worldCountries';

const tables = { quizTable: 'quizzes', answerTable: 'answers', runTable: 'runs' };
const input = {
  runId: 'run-1',
  quizId: 'quiz-1',
  template: 'world-countries',
  categorySlug: 'geography',
  timeLimitSeconds: 600,
  now: '2026-07-01T00:00:00.000Z',
};

describe('startMapQuiz', () => {
  let writers: MapQuizWriters;
  beforeEach(() => {
    writers = {
      putItem: vi.fn().mockResolvedValue(undefined),
      batchPut: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('publishes a MAP quiz with the fixture answer count + render config', async () => {
    await startMapQuiz(input, tables, writers);
    const quiz = (writers.putItem as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === 'quizzes',
    )?.[1];
    expect(quiz).toMatchObject({
      __typename: 'Quiz',
      mode: 'MAP',
      status: 'PUBLISHED',
      topic: 'World Countries',
      answerCount: WORLD_COUNTRIES.length,
    });
    expect(JSON.parse(quiz.renderConfig)).toEqual({
      topology: 'countries-110m',
      projection: 'geoEqualEarth',
    });
  });

  it('batch-writes every answer with a stable id and JSON accepted list', async () => {
    await startMapQuiz(input, tables, writers);
    const [table, items] = (writers.batchPut as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(table).toBe('answers');
    expect(items).toHaveLength(WORLD_COUNTRIES.length);
    expect(items[0]).toMatchObject({ __typename: 'Answer', quizId: 'quiz-1' });
    expect(items[0].id).toBe(`quiz-1#${WORLD_COUNTRIES[0].promptValue}`);
    expect(items[0].promptKind).toBe('REGION');
    expect(JSON.parse(items[0].accepted)).toEqual(WORLD_COUNTRIES[0].accepted);
  });

  it('records a DRAFT_READY quiz generation run', async () => {
    await startMapQuiz(input, tables, writers);
    const run = (writers.putItem as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === 'runs',
    )?.[1];
    expect(run).toMatchObject({
      __typename: 'GenerationRun',
      game: 'QUIZZES',
      mode: 'MAP',
      status: 'DRAFT_READY',
      quizId: 'quiz-1',
      generatedCount: WORLD_COUNTRIES.length,
    });
  });

  it('throws on an unknown template', async () => {
    await expect(startMapQuiz({ ...input, template: 'nope' }, tables, writers)).rejects.toThrow(
      /unknown map template/,
    );
  });
});
