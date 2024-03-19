import { PropsWithChildren, useEffect } from 'react';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { Loader, PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import {
  GamesPageFilter,
  GamesPageForFilter,
  GamesView,
  RubikCubeIcon,
  useAuthErrorToastRequest,
  useCoinflipPaginatedGames,
  useErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { formatUSD } from '@orisirisi/coinflip';

export function GamesPage() {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const { query, replace } = useRouter();

  useAuthErrorToastRequest();
  useErrorToastRequest();

  const forFilter = (query.for ?? 'all') as GamesPageForFilter;

  const {
    hasLoaded,
    paginatedGames,
    isLoading,
    loadNextPage,
    hasMore: paginatedGamesHasMore,
  } = useCoinflipPaginatedGames({
    forFilter,
  });

  useEffect(() => {
    if (forFilter === 'my_games' && !currentWeb3Account) {
      setTimeout(() => {
        toast.error('You need to connect your wallet first.', {
          position: 'bottom-right',
        });
      }, 500);
      replace('/games');
    }
  }, [forFilter, currentWeb3Account, replace]);

  const [lastGameViewElementRef, inView] = useInView();

  useEffect(() => {
    if (inView && paginatedGamesHasMore) {
      loadNextPage();
    }
  }, [inView, paginatedGamesHasMore, loadNextPage]);

  if (!hasLoaded) return <Loader loadingText="Loading Games..." />;

  return (
    <div className="text-white">
      <GamesFiltersAndStats
        filter={{ forFilter }}
        currentWeb3Account={currentWeb3Account}
        totalCompletedCount={paginatedGames!.total_completed_games_count}
        totalPaidOutAmount={paginatedGames!.total_paid_out_amount}
      />
      <GamesView
        ref={lastGameViewElementRef}
        games={paginatedGames!.games}
        isLoading={isLoading}
      />
    </div>
  );
}

function GamesFiltersAndStats({
  filter,
  currentWeb3Account,
  totalCompletedCount,
  totalPaidOutAmount,
}: {
  filter: GamesPageFilter;
  currentWeb3Account: Web3Account | null;
  totalCompletedCount: number;
  totalPaidOutAmount: number;
}) {
  return (
    <div
      className={cn(
        'flex w-100 md:justify-between justify-center flex-col md:flex-row text-white my-4 items-center',
        !currentWeb3Account && 'justify-center'
      )}
    >
      {currentWeb3Account && (
        <div className="flex w-[268px] md:w-60  justify-between">
          <GamesForFilterButton currentFilter={filter} filter="all">
            <RubikCubeIcon />
            <span>All</span>
          </GamesForFilterButton>
          <GamesForFilterButton currentFilter={filter} filter="my_games">
            <CurrencyDollarIcon className="h-5" />
            <span>My Games</span>
          </GamesForFilterButton>
        </div>
      )}

      <div className="text-sm my-4 md:my-0">
        Completed: <b>{totalCompletedCount}</b> | Total Paid Out:{' '}
        <b>{formatUSD(totalPaidOutAmount)}</b>
      </div>
    </div>
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
        'flex justify-center items-center gap-2 w-[128px] md:w-fit h-[32px] p-0 md:p-1 md:pl-4 md:px-4 rounded-lg text-center',
        filter === currentFilter.forFilter ? activeClass : inactiveClass,
        className
      )}
    >
      {children}
    </button>
  );
}

export default GamesPage;
