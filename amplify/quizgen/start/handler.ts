/**
 * generateQuiz resolver. Thin: mint ids/now, read env, FORK on mode. MAP is
 * template-backed and completes synchronously here (no Bedrock/worker) via
 * startMapQuiz. Generative modes (TYPING/GRID/MULTIPLE_CHOICE/ORDERED) will
 * async-invoke a worker — not built this slice, so they throw a clear error.
 */
import { randomUUID } from 'node:crypto';
import { putItem } from '../../deckgen/shared/ddb';
import { batchPut } from '../shared/batchWrite';
import { startMapQuiz } from './startMapQuiz';
import type { Schema } from '../../data/resource';

type Args = Schema['generateQuiz']['args'];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not set`);
  return value;
}

export const handler: Schema['generateQuiz']['functionHandler'] = async (event) => {
  const { mode, topicOrTemplate, categorySlug, timeLimitSeconds } = event.arguments as Args;
  const runId = randomUUID();
  const quizId = randomUUID();
  const now = new Date().toISOString();

  if (mode !== 'MAP') {
    throw new Error(`quiz mode ${mode} not yet supported (generative worker path is deferred)`);
  }

  await startMapQuiz(
    { runId, quizId, template: topicOrTemplate, categorySlug, timeLimitSeconds, now },
    {
      quizTable: required('QUIZ_TABLE'),
      answerTable: required('ANSWER_TABLE'),
      runTable: required('GENERATION_RUN_TABLE'),
    },
    { putItem, batchPut },
  );
  return { runId, quizId };
};
