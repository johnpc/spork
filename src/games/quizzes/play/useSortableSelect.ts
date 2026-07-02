import { useCallback, useState } from 'react';

/**
 * Selection + place logic for the SORTABLE renderer. The player picks an item
 * (held as the selected answer id), then clicks a bucket to place it. `place`
 * delegates scoring to the injected `attempt` (BUCKETING only counts a correct
 * bucket): a hit clears the selection (the item moves into its bucket); a miss
 * briefly flags the wrong bucket so the player gets feedback. Render-only view.
 */
export function useSortableSelect(attempt: (id: string | null, bucket?: string) => boolean) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongBucket, setWrongBucket] = useState<string | null>(null);

  const pick = useCallback((id: string) => {
    setWrongBucket(null);
    setSelectedId((cur) => (cur === id ? null : id));
  }, []);

  const place = useCallback(
    (bucket: string): boolean => {
      if (!selectedId) return false;
      const hit = attempt(selectedId, bucket);
      if (hit) {
        setSelectedId(null);
        setWrongBucket(null);
      } else {
        setWrongBucket(bucket); // flash this bucket wrong; keep the selection
      }
      return hit;
    },
    [selectedId, attempt],
  );

  return { selectedId, wrongBucket, pick, place };
}
