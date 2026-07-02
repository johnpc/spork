import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  invokeText: vi.fn(),
  parseAnswers: vi.fn(),
  batchPut: vi.fn(),
  updateItem: vi.fn(),
  produceAnswerImage: vi.fn(),
}));
vi.mock('../../deckgen/shared/bedrock', () => ({ invokeText: e.invokeText }));
vi.mock('../../deckgen/shared/ddb', () => ({ updateItem: e.updateItem }));
vi.mock('../shared/batchWrite', () => ({ batchPut: e.batchPut }));
vi.mock('../shared/parseAnswers', () => ({ parseAnswers: e.parseAnswers }));
vi.mock('./produceAnswerImage', () => ({ produceAnswerImage: e.produceAnswerImage }));
// buildAnswersRequest + mapLimit are pure — use the real ones.

import { handler, type QuizWorkerEvent } from './handler';

const base: QuizWorkerEvent = {
  runId: 'run1',
  quizId: 'q1',
  mode: 'CLASSIC',
  topic: 'US Presidents',
  answerCount: 5,
};

describe('quizgen worker handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GENERATION_RUN_TABLE = 'runs';
    process.env.QUIZ_TABLE = 'quizzes';
    process.env.ANSWER_TABLE = 'answers';
    process.env.MEDIA_BUCKET = 'bucket';
    e.invokeText.mockResolvedValue({ content: [] });
    e.batchPut.mockResolvedValue(undefined);
    e.updateItem.mockResolvedValue(undefined);
  });

  it('writes answers and flips quiz + run to DRAFT_READY (text mode, no images)', async () => {
    e.parseAnswers.mockReturnValue([
      { promptKind: 'NONE', display: 'Lincoln', accepted: ['Lincoln'] },
    ]);
    await handler(base);
    expect(e.produceAnswerImage).not.toHaveBeenCalled();
    expect(e.batchPut).toHaveBeenCalledWith(
      'answers',
      expect.arrayContaining([expect.objectContaining({ quizId: 'q1', display: 'Lincoln' })]),
    );
    const runUpdate = e.updateItem.mock.calls.find((c) => c[0] === 'runs')?.[2];
    expect(runUpdate).toMatchObject({ status: 'DRAFT_READY', generatedCount: 1 });
  });

  it('PICTURE_BOX draws one image per answer and uses its key', async () => {
    e.parseAnswers.mockReturnValue([
      { promptKind: 'IMAGE', display: 'LeBron', accepted: ['LeBron'], imagePrompt: 'p' },
    ]);
    e.produceAnswerImage.mockResolvedValue('media/quizzes/q1/q1#0.webp');
    await handler({ ...base, mode: 'PICTURE_BOX' });
    expect(e.produceAnswerImage).toHaveBeenCalledTimes(1);
    const rows = e.batchPut.mock.calls[0][1];
    expect(rows[0].promptValue).toBe('media/quizzes/q1/q1#0.webp');
  });

  it('marks the run FAILED and rethrows on error', async () => {
    e.parseAnswers.mockImplementation(() => {
      throw new Error('no valid answers');
    });
    await expect(handler(base)).rejects.toThrow('no valid answers');
    const runUpdate = e.updateItem.mock.calls.find((c) => c[0] === 'runs')?.[2];
    expect(runUpdate).toMatchObject({ status: 'FAILED' });
    expect(runUpdate.statusReason).toContain('no valid answers');
  });
});
