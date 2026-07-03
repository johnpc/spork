/**
 * Pure derivation of a study session's view state from the loaded data, the
 * current position, and whether we're in a "Review all" round. Extracted from
 * useStudy so the hook stays a thin orchestrator (and under the complexity gate):
 * all the branching about what's due / done / offerable lives here, testable
 * without React.
 */
import { buildStudyQueue, type QueuedCard } from './buildStudyQueue';
import type { CardRecord, UserCardReviewRecord } from '../../lib/dataClient';

export interface StudyData {
  cards: CardRecord[];
  reviews: UserCardReviewRecord[];
}

export interface SessionView {
  queue: QueuedCard[];
  current: QueuedCard | null;
  done: boolean;
  canReviewAll: boolean;
}

export function sessionView(
  data: StudyData | undefined,
  index: number,
  includeAll: boolean,
  isLoading: boolean,
  now: Date,
): SessionView {
  const queue = data ? buildStudyQueue(data.cards, data.reviews, now, includeAll) : [];
  return {
    queue,
    current: queue[index] ?? null,
    done: !isLoading && queue.length > 0 && index >= queue.length,
    // Cards exist but none are due → offer a "Review all" round (never a dead-end).
    canReviewAll: !isLoading && !includeAll && queue.length === 0 && (data?.cards.length ?? 0) > 0,
  };
}
