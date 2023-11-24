import { PropsWithChildren, useState } from 'react';
import { CoinflipGame, formatUSD } from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import {
  PropsWithClassName,
  cn,
  useIsClient,
} from '@orisirisi/orisirisi-web-ui';
import {
  ChainLogo,
  GameExpiryCountdown,
  GamesEmptyIcon,
  GamesPageFilter,
  GamesPageForFilter,
  RubikCubeIcon,
  StopWatchIcon,
  useCoinflipGames,
  useGameExpiryCountdown,
} from '@orisirisi/coinflip-web-ui';
import Link from 'next/link';

export function GamesPage() {
  const { query } = useRouter();

  const forFilter = (query.for ?? 'all') as GamesPageForFilter;

  const { games, isLoading } = useCoinflipGames({ forFilter });

  return (
    <div>
      <GamesFilterButtons forFilter={forFilter} />
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

function GamesView({
  games,
  isLoading,
}: {
  games: CoinflipGame[];
  isLoading: boolean;
}) {
  const { push } = useRouter();

  const goToGamePage = (id: number) => push(`/games/${id}`);

  const [expiredGameCardsCount, setExpiredGameCardsCount] = useState(0);

  if (
    !isLoading &&
    (games.length == 0 || games.length == expiredGameCardsCount)
  )
    return <GamesEmptyView />;

  return (
    <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {games.map((game) => (
        <GameCard
          goToGamePage={goToGamePage}
          game={game}
          key={game.id + game.chain_id}
          incrementExpiredGameCardsCount={() =>
            setExpiredGameCardsCount((c) => c + 1)
          }
        />
      ))}
    </div>
  );
}

function GameCard({
  game,
  goToGamePage,
  incrementExpiredGameCardsCount,
}: {
  game: CoinflipGame;
  goToGamePage: (id: number) => void;
  incrementExpiredGameCardsCount: () => void;
}) {
  const gameExpiryCountdown = useGameExpiryCountdown(game.expiry_timestamp);

  if (game.is_ongoing && gameExpiryCountdown.isFinished()) {
    incrementExpiredGameCardsCount();

    return null;
  }

  return (
    <Link
      href={`/games/${game.id}`}
      className="rounded-lg bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.5)] cursor-pointer p-4 hover:p-5 transition-all"
    >
      <div className="flex justify-between">
        <div className="text-sm">#{game.id}</div>

        <div className="w-4">
          <ChainLogo chain={game.getChain()} />
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
              <GameExpiryCountdown countdown={gameExpiryCountdown} />
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
