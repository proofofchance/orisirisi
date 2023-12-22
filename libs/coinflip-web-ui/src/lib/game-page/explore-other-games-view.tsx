import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { useCoinflipGames } from '../hooks';
import { GamesView } from '../games-view';

export function ExploreOtherGamesView({
  gameId,
  className,
}: { gameId: number } & PropsWithClassName) {
  const { hasLoaded, isLoading, games } = useCoinflipGames({
    idToIgnore: gameId,
    pageSize: 10,
    statusFilter: 'ongoing',
  });

  if (!hasLoaded) return null;

  if (games!.length === 0) return null;

  return (
    <div className={cn('text-white mb-72', className)}>
      <h3 className="text-2xl">Explore Other Ongoing Games</h3>
      <GamesView className="mt-4" games={games!} isLoading={isLoading} />
    </div>
  );
}