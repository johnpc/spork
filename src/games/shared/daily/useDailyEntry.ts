import { useQuery } from '@tanstack/react-query';
import { pickDaily } from './pickDaily';
import { useDaily } from './useDaily';
import { DAILY_GAMES, type DailyGame } from './dailyGames';

/** Resolve the daily-entry state for a game key: whether today's puzzle was
 * already played (→ recap), or which puzzle id to route into. The game's list is
 * fetched via react-query; the pick is the pure pickDaily over the day stamp. */
export function useDailyEntry(gameKey: string) {
  const game: DailyGame | undefined = DAILY_GAMES[gameKey];
  // Gate on the game's daily key (quiz types share the quizzes:<MODE> key the
  // play screen records under), not the route slug.
  const { date, playedToday, result } = useDaily(game?.dailyKey ?? gameKey);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['daily-list', gameKey],
    queryFn: () => (game ? game.fetchList() : Promise.resolve([])),
    enabled: !!game && !playedToday,
  });

  const todays = data ? pickDaily(data, date) : null;
  return {
    game,
    playedToday,
    result,
    isLoading: !!game && !playedToday && isLoading,
    playPath: game && todays ? game.playPath(todays.id) : null,
    // The list loaded but held no puzzle for this game — a real "nothing today"
    // state, distinct from still-loading. Prevents an infinite spinner when a
    // game type has no published puzzle (e.g. a mode not yet ingested).
    empty: !!game && !playedToday && isSuccess && !todays,
  };
}
