import { useQuery } from '@tanstack/react-query';
import { pickDaily } from './pickDaily';
import { useDaily } from './useDaily';
import { DAILY_GAMES, type DailyGame } from './dailyGames';

/** Resolve the daily-entry state for a game key: whether today's puzzle was
 * already played (→ recap), or which puzzle id to route into. The game's list is
 * fetched via react-query; the pick is the pure pickDaily over the day stamp. */
export function useDailyEntry(gameKey: string) {
  const game: DailyGame | undefined = DAILY_GAMES[gameKey];
  const { date, playedToday, result } = useDaily(gameKey);

  const { data, isLoading } = useQuery({
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
  };
}
