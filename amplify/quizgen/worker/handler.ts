/**
 * Quiz-gen worker (async-invoked by the starter for GENERATIVE modes). Claude
 * writes the answers (tool-forced), PICTURE_BOX also draws one image per answer,
 * then the Answer rows are written and the Quiz + GenerationRun flip to
 * DRAFT_READY. Any failure marks the run FAILED so the dashboard shows it. Thin:
 * logic lives in pure helpers (prompt/parse/buildItems) + isolated edges.
 */
import { invokeText } from '../../deckgen/shared/bedrock';
import { updateItem } from '../../deckgen/shared/ddb';
import { batchPut } from '../shared/batchWrite';
import { buildAnswersRequest, type GenMode } from '../shared/answersPrompt';
import { parseAnswers } from '../shared/parseAnswers';
import { buildAnswerItems } from './buildAnswerItems';
import { produceAnswerImage } from './produceAnswerImage';
import { mapLimit } from '../../deckgen/worker/mapLimit';

const IMAGE_CONCURRENCY = 4;

export interface QuizWorkerEvent {
  runId: string;
  quizId: string;
  mode: GenMode;
  topic: string;
  answerCount: number;
}

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

export async function handler(event: QuizWorkerEvent): Promise<void> {
  const runTable = env('GENERATION_RUN_TABLE');
  const quizTable = env('QUIZ_TABLE');
  try {
    const body = await invokeText(
      buildAnswersRequest({ mode: event.mode, topic: event.topic, answerCount: event.answerCount }),
    );
    const answers = parseAnswers(event.mode, body as Parameters<typeof parseAnswers>[1]);
    const now = new Date().toISOString();

    // Picture modes: draw one image per answer (bounded concurrency) → S3 keys.
    const imageKeys = new Map<number, string>();
    if (event.mode === 'PICTURE_BOX') {
      const ctx = { bucket: env('MEDIA_BUCKET'), quizId: event.quizId };
      const keys = await mapLimit(answers, IMAGE_CONCURRENCY, (a, i) =>
        produceAnswerImage(ctx, `${event.quizId}#${i}`, a.imagePrompt ?? a.display),
      );
      keys.forEach((k, i) => imageKeys.set(i, k));
    }

    await batchPut(env('ANSWER_TABLE'), buildAnswerItems(event.quizId, answers, now, imageKeys));
    await updateItem(quizTable, event.quizId, { answerCount: answers.length, updatedAt: now });
    await updateItem(runTable, event.runId, {
      status: 'DRAFT_READY',
      generatedCount: answers.length,
      updatedAt: now,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'generation failed';
    await updateItem(runTable, event.runId, {
      status: 'FAILED',
      statusReason: reason,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
    throw err;
  }
}
