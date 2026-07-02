/**
 * generateQuiz resolver. Thin: mint ids/now, read env, FORK on mode. MAP is
 * template-backed and completes synchronously here (no Bedrock/worker) via
 * startMapQuiz. All other (generative) modes create a DRAFT quiz + RUNNING run
 * and async-invoke the worker via startGenerativeQuiz. Returns { runId, quizId }.
 */
import { randomUUID } from 'node:crypto';
import { putItem } from '../../deckgen/shared/ddb';
import { batchPut } from '../shared/batchWrite';
import { startMapQuiz } from './startMapQuiz';
import { startGenerativeQuiz } from './startGenerativeQuiz';
import { invokeWorker } from './invokeWorker';
import type { GenMode } from '../shared/answersPrompt';
import type { Schema } from '../../data/resource';

type Args = Schema['generateQuiz']['args'];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not set`);
  return value;
}

export const handler: Schema['generateQuiz']['functionHandler'] = async (event) => {
  const { mode, topicOrTemplate, categorySlug, timeLimitSeconds, answerCount } =
    event.arguments as Args;
  const runId = randomUUID();
  const quizId = randomUUID();
  const now = new Date().toISOString();

  if (mode === 'MAP') {
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
  }

  await startGenerativeQuiz(
    {
      runId,
      quizId,
      mode: mode as GenMode,
      topic: topicOrTemplate,
      categorySlug,
      timeLimitSeconds,
      answerCount: answerCount ?? 12,
      now,
    },
    {
      quizTable: required('QUIZ_TABLE'),
      runTable: required('GENERATION_RUN_TABLE'),
      workerFn: required('WORKER_FUNCTION_NAME'),
      putItem,
      invokeWorker,
    },
  );
  return { runId, quizId };
};
