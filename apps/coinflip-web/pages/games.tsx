import { PropsWithChildren } from 'react';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import {
  PropsWithClassName,
  cn,
  useIsClient,
} from '@orisirisi/orisirisi-web-ui';
import {
  GamesPageFilter,
  GamesPageForFilter,
  GamesView,
  RubikCubeIcon,
  useAuthErrorToastRequest,
  useCoinflipGames,
} from '@orisirisi/coinflip-web-ui';

export function GamesPage() {
  const { query } = useRouter();

  useAuthErrorToastRequest();

  const forFilter = (query.for ?? 'all') as GamesPageForFilter;

  const { hasLoaded, games, isLoading } = useCoinflipGames({ forFilter });

  if (!hasLoaded) return null;

  return (
    <div>
      <GamesFilterButtons forFilter={forFilter} />
      <GamesView games={games!} isLoading={isLoading} />
    </div>
  );
}

function GamesFilterButtons(filter: GamesPageFilter) {
  const isClient = useIsClient();
  const { currentWeb3Account } = useCurrentWeb3Account();

  return (
    <>
      {isClient && (
        <div
          className={cn(
            'flex w-100 justify-between text-white my-4',
            !currentWeb3Account && 'justify-center'
          )}
        >
          {currentWeb3Account && (
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
          )}
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
  PropsWithClassName) {
  const activeClass = 'bg-[#2969FF]';
  const inactiveClass = 'border-solid border-[0.5px] border-gray-400';

  const { push } = useRouter();

  return (
    <button
      onClick={() =>
        push({
          pathname: 'games',
          query: { for: filter },
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

export default GamesPage;
