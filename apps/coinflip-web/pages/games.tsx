import { PropsWithChildren, useEffect, useState } from 'react';
import {
  CoinflipGame,
  CoinflipGameStatus,
  formatUSD,
} from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import {
  PropsWithClassName,
  cn,
  useIsClient,
} from '@orisirisi/orisirisi-web-ui';
import {
  ChainLogo,
  GamesEmptyIcon,
  GamesPageFilter,
  GamesPageForFilter,
  RubikCubeIcon,
  StopWatchIcon,
  useCoinflipGames,
} from '@orisirisi/coinflip-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import Link from 'next/link';
import { Countdown } from '@orisirisi/orisirisi-data-utils';

export function GamesPage() {
  const { query } = useRouter();

  const forFilter = (query.for ?? 'all') as GamesPageForFilter;
  const statusFilter = (query.status ?? 'ongoing') as CoinflipGameStatus;

  const { games, isLoading } = useCoinflipGames({ forFilter, statusFilter });

  return (
    <div>
      <GamesFilterButtons forFilter={forFilter} statusFilter={statusFilter} />
      <GamesView games={games} isLoading={isLoading} />
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
  PropsWithClassName) {
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
  PropsWithClassName) {
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
  const { push } = useRouter();

  const goToGamePage = (id: number) => push(`/games/${id}`);

  if (!isLoading && games.length == 0) return <GamesEmptyView />;

  return (
    <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {games.map((game) => (
        <GameCard
          goToGamePage={goToGamePage}
          game={game}
          key={game.id + game.chain_id}
        />
      ))}
    </div>
  );
}

function useGameExpiryCountdown(game: CoinflipGame) {
  const [countDown, setCountDown] = useState(
    Countdown.getNext(game.expiry_timestamp)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountDown((previousCountdown) => ({
        ...previousCountdown,
        ...Countdown.getNext(game.expiry_timestamp),
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [game]);

  return countDown;
}
function GameCard({
  game,
  goToGamePage,
}: {
  game: CoinflipGame;
  goToGamePage: (id: number) => void;
}) {
  const gameExpiryCountdown = useGameExpiryCountdown(game);

  const padDigit = (digit: number) => digit.toString().padStart(2, '0');

  if (game.is_ongoing && gameExpiryCountdown.isFinished()) return null;

  return (
    <Link
      href={`/games/${game.id}`}
      className="rounded-lg bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.5)] cursor-pointer p-4 hover:p-5 transition-all"
    >
      <div className="flex justify-between">
        <div className="text-sm">#{game.id}</div>

        <div className="w-4">
          <ChainLogo chain={Chain.fromChainID(game.chain_id)} />
        </div>
      </div>

      <div className="flex flex-col justify-center h-40">
        <div>
          Potential Win:{' '}
          <h4 className="text-xl">{formatUSD(game.max_possible_win_usd)}</h4>
        </div>
        <div className="mt-2">
          Wager: <h4 className="text-xl">{formatUSD(game.wager_usd)}</h4>
        </div>
        {game.is_ongoing && (
          <div className="text-sm mt-4 flex gap-2 items-center">
            <span className="h-4 w-4">
              <StopWatchIcon />
            </span>
            <span>
              {padDigit(gameExpiryCountdown.daysLeft)}d :{' '}
              {padDigit(gameExpiryCountdown.hoursLeft)}h :{' '}
              {padDigit(gameExpiryCountdown.minutesLeft)}m :{' '}
              {padDigit(gameExpiryCountdown.secondsLeft)}s left
            </span>
          </div>
        )}
      </div>

      {false && (
        <div className={cn('flex gap-4 mt-4', game.is_completed && 'mt-10')}>
          {game.is_ongoing && (
            <button className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200">
              Play
            </button>
          )}
          <button
            onClick={() => goToGamePage(game.id)}
            className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            View
          </button>
        </div>
      )}
    </Link>
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
