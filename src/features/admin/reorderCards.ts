/**
 * Pure reorder helper. Given ordered cards and a move (swap a card with its
 * neighbor in `direction`), return the minimal set of {id, ord} changes to
 * persist — or [] when the move is a no-op (edge of the list). Keeps the
 * reorder logic unit-testable and out of the hook.
 */
export interface Orderable {
  id: string;
  ord: number;
}

export function reorderCards<T extends Orderable>(
  cards: T[],
  cardId: string,
  direction: 'up' | 'down',
): Array<{ id: string; ord: number }> {
  const sorted = [...cards].sort((a, b) => a.ord - b.ord);
  const index = sorted.findIndex((c) => c.id === cardId);
  if (index === -1) return [];
  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sorted.length) return [];
  const a = sorted[index];
  const b = sorted[swapWith];
  // Swap their ordinals; only these two rows change.
  return [
    { id: a.id, ord: b.ord },
    { id: b.id, ord: a.ord },
  ];
}
