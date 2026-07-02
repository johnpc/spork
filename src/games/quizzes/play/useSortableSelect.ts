import { useCallback, useState } from 'react';

/**
 * Selection + place logic for the SORTABLE renderer. The player first picks an
 * item (held here as the selected answer id), then clicks a bucket to place it.
 * `place` delegates the actual scoring to the injected `attempt` (BUCKETING only
 * counts a correct bucket) and clears the selection on a hit so the next item
 * can be sorted. Keeping this in a hook keeps the component render-only.
 */
export function useSortableSelect(attempt: (id: string | null, bucket?: string) => boolean) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pick = useCallback((id: string) => {
    setSelectedId((cur) => (cur === id ? null : id));
  }, []);

  const place = useCallback(
    (bucket: string): boolean => {
      if (!selectedId) return false;
      const hit = attempt(selectedId, bucket);
      if (hit) setSelectedId(null);
      return hit;
    },
    [selectedId, attempt],
  );

  return { selectedId, pick, place };
}
