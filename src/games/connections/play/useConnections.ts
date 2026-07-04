import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchConnections } from './connectionsApi';
import { parseGroups, shuffleTiles, hashString, seededRandom } from './parseConnections';
import { checkSelection, isWon, isLost } from './grouping';

/**
 * Connections play hook: load the puzzle, hold selected tiles + solved groups +
 * mistakes, expose toggle/submit/deselectAll. Tiles are shuffled ONCE via a
 * stable seed (the puzzle id hash) so the same puzzle always shows the same
 * shuffle but remains deterministic for tests.
 */
export function useConnections(id: string | undefined) {
  const {
    data: puzzle,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['connections', id],
    queryFn: () => fetchConnections(id as string),
    enabled: !!id,
  });

  const groups = useMemo(() => parseGroups(puzzle?.groups), [puzzle]);
  const maxMistakes = puzzle?.maxMistakes ?? 4;

  // Shuffle once via a stable seed (puzzle id) — no bare Math.random in tested logic.
  const tiles = useMemo(() => {
    if (!id || groups.length === 0) return [];
    const seed = hashString(id);
    const rng = seededRandom(seed);
    return shuffleTiles(groups, rng);
  }, [id, groups]);

  const [selected, setSelected] = useState<string[]>([]);
  const [solvedIndices, setSolvedIndices] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [lastOneAway, setLastOneAway] = useState(false);

  const solvedGroups = useMemo(
    () => groups.filter((_, i) => solvedIndices.has(i)),
    [groups, solvedIndices],
  );
  const won = isWon(solvedGroups.length);
  const lost = isLost(mistakes, maxMistakes);
  const done = won || lost;

  const toggle = useCallback(
    (word: string) => {
      if (done) return;
      setSelected((s) =>
        s.includes(word) ? s.filter((w) => w !== word) : s.length < 4 ? [...s, word] : s,
      );
    },
    [done],
  );

  const submit = useCallback(() => {
    if (done || selected.length !== 4) return;
    const res = checkSelection(selected, groups, solvedIndices);
    if (res.solved) {
      const idx = groups.findIndex((g) => g === res.solved);
      setSolvedIndices((s) => new Set(s).add(idx));
      setSelected([]);
      setLastOneAway(false);
    } else {
      setMistakes((m) => m + 1);
      setLastOneAway(res.oneAway);
    }
  }, [done, selected, groups, solvedIndices]);

  const deselectAll = useCallback(() => setSelected([]), []);

  return {
    puzzle: puzzle ?? null,
    isLoading: !!id && isLoading,
    isError,
    refetch,
    groups,
    tiles,
    selected,
    solvedGroups,
    mistakes,
    maxMistakes,
    lastOneAway,
    won,
    lost,
    done,
    toggle,
    submit,
    deselectAll,
  };
}
