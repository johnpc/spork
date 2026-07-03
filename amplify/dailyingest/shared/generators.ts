/**
 * One generator per game type for the daily ingester. Each composes the game's
 * existing pure prompt-builder + parser + validator (the very same ones its
 * build-time fixture script uses) behind retryGen, with the injected Bedrock
 * `invoke`. Returns the validated payload the row builders persist. No AWS specifics.
 */
import { retryGen, type Invoke } from './retryGen';
import { buildAnswersRequest, type GenMode } from '../../quizgen/shared/answersPrompt';
import { parseAnswers, type ParsedAnswer } from '../../quizgen/shared/parseAnswers';
import { buildLadderRequest } from '../../laddergen/shared/ladderPrompt';
import { parseLadderGen } from '../../laddergen/shared/parseLadderGen';
import { validateLadder } from '../../laddergen/shared/validateLadder';
import { buildAcrosticRequest } from '../../acrosticgen/shared/acrosticPrompt';
import { parseAcrosticGen } from '../../acrosticgen/shared/parseAcrosticGen';
import { validateAcrostic } from '../../acrosticgen/shared/validateAcrostic';
import { buildQuizzleRequest } from '../../quizzlegen/shared/quizzlePrompt';
import { parseQuizzleGen } from '../../quizzlegen/shared/parseQuizzleGen';
import { validateQuizzle } from '../../quizzlegen/shared/validateQuizzle';
import { buildChessRequest } from '../../chessgen/shared/chessPrompt';
import { parseChessGen } from '../../chessgen/shared/parseChessGen';
import { validateChess } from '../../chessgen/shared/validateChess';

type Body = { content?: unknown };
const ATTEMPTS = 4;

/** Generative quiz answers for a mode+topic (CLASSIC, MULTIPLE_CHOICE, …). */
export function genQuizAnswers(
  invoke: Invoke,
  mode: GenMode,
  topic: string,
  answerCount = 8,
): Promise<ParsedAnswer[]> {
  return retryGen(`quiz:${mode}`, ATTEMPTS, async () => {
    const body = (await invoke(buildAnswersRequest({ mode, topic, answerCount }))) as Body;
    const answers = parseAnswers(mode, body as Parameters<typeof parseAnswers>[1]);
    return { ok: answers.length > 0, value: answers, reason: 'empty' };
  });
}

export function genLadder(invoke: Invoke, length: number, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  return retryGen('steps', ATTEMPTS, async () => {
    const body = (await invoke(buildLadderRequest({ length, difficulty }))) as Body;
    const v = validateLadder(parseLadderGen(body as Parameters<typeof parseLadderGen>[0]));
    return { ok: v.ok, reason: v.reason, value: v.ladder };
  });
}

export function genAcrostic(invoke: Invoke, word: string) {
  return retryGen('acrostic', ATTEMPTS, async () => {
    const body = (await invoke(buildAcrosticRequest({ word }))) as Body;
    const cand = parseAcrosticGen(body as Parameters<typeof parseAcrosticGen>[0], word);
    const v = validateAcrostic(cand);
    return { ok: v.ok, reason: v.reason, value: v.acrostic };
  });
}

export function genQuizzle(invoke: Invoke, topic: string) {
  return retryGen('quizzle', ATTEMPTS, async () => {
    const body = (await invoke(buildQuizzleRequest({ topic }))) as Body;
    const v = validateQuizzle(parseQuizzleGen(body as Parameters<typeof parseQuizzleGen>[0]));
    return { ok: v.ok, reason: v.reason, value: v.quizzle };
  });
}

export function genChess(invoke: Invoke, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  return retryGen('chess', ATTEMPTS, async () => {
    const body = (await invoke(buildChessRequest({ difficulty }))) as Body;
    const v = validateChess(parseChessGen(body as Parameters<typeof parseChessGen>[0]));
    return { ok: v.ok, reason: v.reason, value: v.puzzle };
  });
}
