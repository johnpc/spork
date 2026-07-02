/**
 * Pure builder: parsed answers (+ resolved image keys for picture modes) →
 * DynamoDB Answer item records ready for batchPut. Keeps the worker handler thin
 * and makes the row shape unit-testable. `imageKeys[i]` is the S3 key for answer
 * i when the mode is picture-based (else the map is empty).
 */
import type { ParsedAnswer } from '../shared/parseAnswers';

export function buildAnswerItems(
  quizId: string,
  answers: ParsedAnswer[],
  now: string,
  imageKeys: Map<number, string> = new Map(),
): Record<string, unknown>[] {
  return answers.map((a, i) => {
    // Picture modes: the drawn image's S3 key IS the answer's promptValue.
    const promptValue = a.promptKind === 'IMAGE' ? imageKeys.get(i) : a.promptValue;
    return {
      id: `${quizId}#${i}`,
      __typename: 'Answer',
      createdAt: now,
      updatedAt: now,
      quizId,
      ord: i,
      promptKind: a.promptKind,
      promptValue,
      display: a.display,
      accepted: JSON.stringify(a.accepted),
      options: a.options ? JSON.stringify(a.options) : undefined,
      orderIndex: a.orderIndex,
      bucket: a.bucket,
    };
  });
}
