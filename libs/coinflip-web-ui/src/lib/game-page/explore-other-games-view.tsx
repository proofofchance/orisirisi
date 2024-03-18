import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { useCoinflipPaginatedGames } from '../hooks';
import { GamesView } from '../games-view';

export function ExploreOtherGamesView({
  gameId,
  className,
}: { gameId: number } & PropsWithClassName) {
  const { hasLoaded, isLoading, paginatedGames } = useCoinflipPaginatedGames({
    idToIgnore: gameId,
    pageSize: 10,
    statusFilter: 'awaiting_players',
  });

  if (!hasLoaded) return null;

  const games = paginatedGames!.games;

  if (games.length === 0) return null;

  return (
    <div className={cn('text-white mb-72', className)}>
      <h3 className="text-2xl">Explore Other Ongoing Games</h3>
      <GamesView
        className="mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        games={games}
        isLoading={isLoading}
      />
    </div>
  );
}
