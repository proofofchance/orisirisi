import { PropsWithChildren } from 'react';
import { CoinflipGame, CoinflipGameStatus } from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { WithClassName, cn, useIsClient } from '@orisirisi/orisirisi-web-ui';
import {
  GamesEmptyIcon,
  GamesPageFilter,
  GamesPageForFilter,
  RubikCubeIcon,
  useCoinflipGames,
} from '@orisirisi/coinflip-web-ui';

export function GamesPage() {
  const { query } = useRouter();

  const forFilter = (query.for ?? 'all') as GamesPageForFilter;
  const statusFilter = (query.status ?? 'ongoing') as CoinflipGameStatus;

  const { games, isLoading } = useCoinflipGames({ forFilter, statusFilter });

  const { currentWeb3Account } = useCurrentWeb3Account();

  return (
    <div>
      {currentWeb3Account && (
        <GamesFilterButtons forFilter={forFilter} statusFilter={statusFilter} />
      )}
      <GamesView games={games} isLoading={isLoading} />
    </div>
  );
}

function GamesFilterButtons(filter: GamesPageFilter) {
  const isClient = useIsClient();

  return (
    <>
      {isClient && (
        <div className="flex w-100 justify-between text-white my-4">
          <div className="flex w-60 justify-between">
            <GamesForFilterButton
              className="px-4 rounded-lg"
              currentFilter={filter}
              filter="all"
            >
              <RubikCubeIcon />
              <span>All</span>
            </GamesForFilterButton>
            <GamesForFilterButton
              className="px-4 rounded-lg"
              currentFilter={filter}
              filter="my_games"
            >
              <CurrencyDollarIcon className="h-5" />
              <span>My Games</span>
            </GamesForFilterButton>
          </div>

          <div className="flex">
            <GamesStatusFilterButton
              className="rounded-l-2xl px-4"
              currentFilter={filter}
              filter="ongoing"
            >
              <ClockIcon className="h-5" />
              <span>Ongoing</span>
            </GamesStatusFilterButton>
            <GamesStatusFilterButton
              className="rounded-r-2xl px-4"
              currentFilter={filter}
              filter="completed"
            >
              <CheckIcon className="h-5" />
              <span>Completed</span>
            </GamesStatusFilterButton>
          </div>
        </div>
      )}
    </>
  );
}
function GamesForFilterButton({
  filter,
  currentFilter,
  children,
  className,
}: {
  filter: GamesPageForFilter;
  currentFilter: GamesPageFilter;
} & PropsWithChildren &
  WithClassName) {
  const activeClass = 'bg-[#2969FF]';
  const inactiveClass = 'border-solid border-[0.5px] border-gray-400';

  const { push } = useRouter();

  return (
    <button
      onClick={() =>
        push({
          pathname: 'games',
          query: { for: filter, status: currentFilter.statusFilter },
        })
      }
      className={cn(
        'flex items-center gap-2 p-1 pl-4',
        filter === currentFilter.forFilter ? activeClass : inactiveClass,
        className
      )}
    >
      {children}
    </button>
  );
}
function GamesStatusFilterButton({
  filter,
  currentFilter,
  children,
  className,
}: {
  filter: CoinflipGameStatus;
  currentFilter: GamesPageFilter;
} & PropsWithChildren &
  WithClassName) {
  const activeClass = 'bg-[#2969FF]';
  const inactiveClass = 'border-solid border-[0.5px] border-gray-400';

  const { push } = useRouter();

  return (
    <button
      onClick={() =>
        push({
          pathname: 'games',
          query: { status: filter, for: currentFilter.forFilter },
        })
      }
      className={cn(
        'flex items-center gap-2 p-1 pl-4',
        filter === currentFilter.statusFilter ? activeClass : inactiveClass,
        className
      )}
    >
      {children}
    </button>
  );
}

function GamesView({
  games,
  isLoading,
}: {
  games: CoinflipGame[];
  isLoading: boolean;
}) {
  if (!isLoading && games.length == 0) return <GamesEmptyView />;

  return (
    <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {games.map((game, i) => (
        <GameCard game={game} key={i} />
      ))}
    </div>
  );
}

function GameCard({ game }: { game: CoinflipGame }) {
  return (
    <div className="rounded-lg h-64 bg-[rgba(0,0,0,0.25)] p-4">
      <div>#{game.id}</div>
      <div>
        <h4>Win SomeAmountHere</h4>
      </div>
      <div>
        <div></div>
        <div>Expires in </div>
      </div>
    </div>
  );
}

function GamesEmptyView() {
  return (
    <div className="flex flex-col justify-center items-center text-white mt-28 text-center">
      <GamesEmptyIcon />
      <h4 className="mt-5 w-80 text-lg">Oops! No games found currently</h4>
      <p className="text-[#BDBDBD] w-56">
        Please try again later or use a different filter
      </p>
    </div>
  );
}

export default GamesPage;
