/**
 * Pure validator for a generated Quizzle wager quiz. An LLM proposes a topic +
 * questions; we NEVER trust it — we independently verify the shape is correct
 * and playable before it becomes a fixture/published quiz. Pure → unit-tested
 * without AWS.
 *
 * Checks: topic non-empty; >=4 questions; each has a non-empty question +
 * non-empty answer; accepted[] is string[] (may be empty). Answers keep their
 * original case for display — we normalize nothing destructively. Reject
 * otherwise.
 *
 * SOLVABILITY: a question is only playable if some target (the answer or an
 * accepted alternate) survives the play engine's guess normalization to a
 * non-empty key — otherwise no typed guess can EVER match it (an answer like
 * "π" or "你好" normalizes to ""). We mirror quizzleEngine.normalizeGuess here
 * (keeping the validator pure/amplify-local, no src/ import) and reject any
 * question whose every target normalizes away.
 */
export interface QuizzleQuestionCandidate {
  question: string;
  answer: string;
  accepted: string[];
}

export interface QuizzleCandidate {
  topic: string;
  questions: QuizzleQuestionCandidate[];
}

export interface ValidatedQuestion {
  question: string;
  answer: string;
  accepted: string[];
}

export interface Validated {
  ok: boolean;
  reason?: string;
  /** Trimmed-but-case-preserving quiz when ok. */
  quizzle?: { topic: string; questions: ValidatedQuestion[] };
}

const MIN_QUESTIONS = 4;

/** Match the play engine's guess normalization EXACTLY (src/games/quizzle/play/
 * quizzleEngine.ts). A target reachable by a real guess has a non-empty key. */
function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Verify + lightly normalize (trim only) a candidate quiz. */
export function validateQuizzle(c: QuizzleCandidate): Validated {
  const topic = (c.topic ?? '').trim();
  if (!topic) return { ok: false, reason: 'topic empty' };

  const src = c.questions ?? [];
  if (src.length < MIN_QUESTIONS) return { ok: false, reason: 'fewer than 4 questions' };

  const questions: ValidatedQuestion[] = [];
  for (let i = 0; i < src.length; i++) {
    const q = src[i];
    const question = (q.question ?? '').trim();
    const answer = (q.answer ?? '').trim();
    if (!question) return { ok: false, reason: `question ${i} empty` };
    if (!answer) return { ok: false, reason: `answer ${i} empty` };
    const accepted = q.accepted ?? [];
    if (!Array.isArray(accepted) || !accepted.every((s) => typeof s === 'string')) {
      return { ok: false, reason: `accepted ${i} not string[]` };
    }
    const trimmedAccepted = accepted.map((s) => s.trim());
    if (![answer, ...trimmedAccepted].some((t) => normalizeKey(t))) {
      return { ok: false, reason: `answer ${i} unsolvable (normalizes to empty)` };
    }
    questions.push({ question, answer, accepted: trimmedAccepted });
  }
  return { ok: true, quizzle: { topic, questions } };
}
