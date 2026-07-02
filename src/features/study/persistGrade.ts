import { gradeCard } from './studyApi';
import { gradeForChoice } from './answerGrade';
import type { QueuedCard } from './buildStudyQueue';

/**
 * Persist an SM-2 grade for a signed-in player's answer; a no-op for guests
 * (who have no owner-scoped review rows). Pulled out of useStudy so the hook
 * stays simple (lower CRAP) and the persistence branch is unit-testable.
 */
export async function persistGrade(
  signedIn: boolean,
  deckId: string,
  current: QueuedCard,
  choice: string,
  answer: string,
): Promise<void> {
  if (!signedIn) return;
  await gradeCard(deckId, current.card.id, current.review, gradeForChoice(choice, answer));
}
