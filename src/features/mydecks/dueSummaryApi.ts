/**
 * Cross-deck "Due today" read. For each saved deck, reuse the study read
 * (cards + the user's reviews) and the pure queue builder to count how many
 * cards are new/due right now, then compose the summary. Per-deck reads run in
 * parallel; the math is the same buildStudyQueue the study session uses, so the
 * counts always match what a session would present.
 */
import { fetchStudyData } from '../study/studyApi';
import { buildStudyQueue } from '../study/buildStudyQueue';
import { fetchMyDecks } from './myDecksApi';
import { composeDueSummary, type DueSummary } from './composeDueSummary';

export type { DueSummary } from './composeDueSummary';

export async function fetchDueSummary(now: Date = new Date()): Promise<DueSummary> {
  const decks = await fetchMyDecks();
  const counts = await Promise.all(
    decks.map(async (deck) => {
      const { cards, reviews } = await fetchStudyData(deck.deckId);
      return {
        deckId: deck.deckId,
        topic: deck.topic,
        dueCount: buildStudyQueue(cards, reviews, now).length,
      };
    }),
  );
  return composeDueSummary(counts);
}
