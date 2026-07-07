import { useQuery } from '@tanstack/react-query';
import { useDaily } from './useDaily';
import { useGenerateDay } from './useGenerateDay';
import { dayStamp } from './today';
import { deriveDailyEntry, shouldPoll } from './dailyEntryState';
import { DAILY_GAMES, type DailyGame } from './dailyGames';

/** Resolve the daily-entry state for a game key on a given day (defaults to
 * today). Reports whether that day's puzzle was already played (→ recap), which
 * puzzle id to route into, and — for a PAST day with no puzzle yet — whether it
 * needs generating (kicking useGenerateDay; the polling list refetch surfaces the
 * new puzzle). Thin: the branching lives in deriveDailyEntry (pure). */
export function useDailyEntry(gameKey: string, date?: string) {
  const game: DailyGame | undefined = DAILY_GAMES[gameKey];
  const now = new Date();
  const day = date ?? dayStamp(now);
  const browsing = !!date && day !== dayStamp(now); // a specific past day, not today
  const { playedToday, result } = useDaily(game?.dailyKey ?? gameKey, day);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['daily-list', gameKey, day],
    queryFn: () => (game ? game.fetchList() : Promise.resolve([])),
    enabled: !!game && !playedToday,
    refetchInterval: (q) => (shouldPoll(browsing, !!game, q.state.data, day) ? 3000 : false),
  });

  const { todays, needsGeneration, emptyBase } = deriveDailyEntry({
    hasGame: !!game,
    day,
    browsing,
    playedToday,
    isSuccess,
    data,
    now,
  });
  const gen = useGenerateDay(day, needsGeneration, !!todays);

  return {
    game,
    date: day,
    browsing,
    playedToday,
    result,
    isLoading: !!game && !playedToday && isLoading,
    playPath: game && todays ? game.playPath(todays.id) : null,
    generating: gen.isGenerating,
    genError: gen.isError,
    empty: emptyBase && !gen.isGenerating,
  };
}
