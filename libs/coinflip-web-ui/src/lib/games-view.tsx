import { CoinflipGame, formatCurrency } from '@orisirisi/coinflip';
import { GameExpiryCountdown, useGameExpiryCountdown } from './hooks';
import { MagnifyingGlassInCloudIcon, StopWatchIcon } from './icons';
import { CoinWithChainLogoRarelyAnimated } from './chain-logo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  PropsWithClassName,
  SmallLoadingSpinner,
  cn,
} from '@orisirisi/orisirisi-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { GameStatusBadge } from './game-status-badge';
import { forwardRef } from 'react';

export const GamesView = forwardRef<
  HTMLDivElement | null,
  {
    games: CoinflipGame[];
    isLoading: boolean;
  } & PropsWithClassName
>(({ games, isLoading, className }, lastGameViewElementRef) => {
  const { push } = useRouter();

  const goToGamePage = (id: number, chain_id: number) =>
    push(`/games/${id}?chain=${Chain.nameFromChainId(chain_id)}`);

  if (!isLoading && games.length === 0) return <GamesEmptyView />;

  return (
    <div
      className={cn(
        'text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8',
        className
      )}
    >
      {games.map((game) => (
        <GameCard
          goToGamePage={goToGamePage}
          game={game}
          key={game.id + game.chain_id}
        />
      ))}
      <div ref={lastGameViewElementRef}>
        {isLoading && (
          <SmallLoadingSpinner
            className="mt-8"
            loadingText="Loading more games..."
          />
        )}
      </div>
    </div>
  );
});

function GameCard({
  game,
  goToGamePage,
}: {
  game: CoinflipGame;
  goToGamePage: (id: number, chain_id: number) => void;
}) {
  return (
    <Link
      href={`/games/${game.id}?chain=${game.getChain().getName()}`}
      className="rounded-lg bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.5)] cursor-pointer p-4 hover:p-5 transition-all"
    >
      <div className="flex justify-between">
        <div className="text-sm">#{game.id}</div>

        <div className="w-4">
          <CoinWithChainLogoRarelyAnimated chain={game.getChain()} />
        </div>
      </div>

      <div className="flex flex-col justify-center h-40">
        <div>
          Potential Win:{' '}
          <h4 className="text-xl">
            ~{formatCurrency(game.max_possible_win_usd)}
          </h4>
        </div>
        <div className="mt-4">
          Wager:{' '}
          <h4>
            {formatCurrency(game.wager, { isCryptoCurrency: true })}{' '}
            {game.getChain().getCurrency()}
          </h4>
        </div>
        <GameCardCountdown game={game} />
      </div>

      {false && (
        <div className={cn('flex gap-4 mt-4', game.isCompleted() && 'mt-10')}>
          {game.isAwaitingPlayers() && (
            <button className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200">
              Play
            </button>
          )}
          <button
            onClick={() => goToGamePage(game.id, game.chain_id)}
            className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            View
          </button>
        </div>
      )}
    </Link>
  );
}

function GameCardCountdown({ game }: { game: CoinflipGame }) {
  const gameExpiryCountdown = useGameExpiryCountdown(
    game.getExpiryTimestampMs()
  );

  const showCountdown =
    game.isNotCompleteYet() && gameExpiryCountdown.isNotFinished();

  if (showCountdown) {
    return (
      <div className="text-sm mt-4 flex gap-2 items-center">
        <span className="h-4 w-4">
          <StopWatchIcon />
        </span>
        <span>
          <GameExpiryCountdown countdown={gameExpiryCountdown} />
        </span>
      </div>
    );
  } else if (game.isExpired() || game.isCompleted()) {
    return (
      <div className="flex mt-4">
        <GameStatusBadge gameStatus={game.status} />
      </div>
    );
  } else {
    return null;
  }
}

function GamesEmptyView() {
  return (
    <div className="flex flex-col justify-center items-center text-white mt-28 text-center">
      <MagnifyingGlassInCloudIcon />
      <h4 className="mt-5 w-80 text-lg">Oops! No games found currently</h4>
      <p className="text-[#BDBDBD] w-56">
        Please come back later and try again
      </p>
    </div>
  );
}
