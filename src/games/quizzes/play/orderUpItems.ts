/**
 * Pure helpers for the ORDER_UP renderer. The player is shown the items in a
 * STABLE, order-hiding arrangement (never the answer's orderIndex) and clicks
 * them in the sequence they believe is correct. SEQUENCE scoring (usePlay) only
 * counts an id whose orderIndex equals the number already found, so these
 * helpers just derive display order + progress, keeping the component render-only.
 */
import type { AnswerRecord } from '../../../lib/dataClient';

/** A shufflable item projected from an answer for the button grid. */
export interface OrderItem {
  id: string;
  display: string;
  orderIndex: number;
}

/** Deterministic key so the shown order hides orderIndex but never depends on
 * bare randomness (a tested-logic rule). Sorts by a hash of the answer id. */
function shuffleKey(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

/** Project answers into display items, ordered so the correct sequence is not
 * given away (stable, id-hash sorted — deterministic across renders/tests). */
export function orderItems(answers: AnswerRecord[]): OrderItem[] {
  return answers
    .map((a) => ({ id: a.id, display: a.display, orderIndex: a.orderIndex ?? -1 }))
    .sort((x, y) => shuffleKey(x.id) - shuffleKey(y.id));
}

/** Progress label — how many items have been placed in correct sequence. */
export function placedLabel(placed: number, total: number): string {
  return `${placed} of ${total} placed`;
}
