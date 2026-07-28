import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudyData } from './studyApi';
import { sessionView } from './sessionView';
import { buildChoices } from './buildChoices';

/** Loads the deck's study data and derives the current session view (queue,
 * current card, choices, done/canReviewAll). Pure I/O + derivation, split out of
 * useStudy so that hook holds only session navigation state. */
export function useStudyData(
  deckId: string | undefined,
  signedIn: boolean,
  index: number,
  includeAll: boolean,
  direction: 'front' | 'back',
) {
  const enabled = !!deckId;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['study', deckId, signedIn],
    queryFn: () => fetchStudyData(deckId as string, signedIn),
    enabled,
  });

  const { queue, current, done, canReviewAll } = useMemo(
    () => sessionView(data, index, includeAll, isLoading, new Date()),
    [data, index, includeAll, isLoading],
  );

  // Choices are derived per card+direction; memoized so picking doesn't reshuffle.
  const choices = useMemo(() => (current && data ? buildChoices(current.card, data.cards, direction) : null), [current, data, direction]); // prettier-ignore

  return {
    queue,
    current,
    done,
    canReviewAll,
    choices,
    isLoading: enabled && isLoading,
    isError: enabled && isError,
    retry: () => void refetch(),
  };
}
