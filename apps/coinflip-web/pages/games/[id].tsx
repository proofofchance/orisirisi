import { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  BackButtonNoBorder,
  CoinWithChainLogoAnimated,
  CopyGameLinkButton,
  ExploreOtherGamesView,
  GameActivitiesView,
  GameDetails,
  GamePlayProofModal,
  GameProofModal,
  MainControlButtons,
  useAuthErrorToastRequest,
  useCoinflipGame,
  useCoinflipGameActivities,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import {
  capitalizeFirstLetter,
  parseInteger,
} from '@orisirisi/orisirisi-data-utils';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import {
  Loader,
  useIsClient,
  useIsMobile,
  useWindowTitle,
} from '@orisirisi/orisirisi-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { CoinflipGame } from '@orisirisi/coinflip';

export default function GamePage() {
  const isClient = useIsClient();
  const { query, replace } = useRouter();
  const { currentWeb3Account } = useCurrentWeb3Account();

  useAuthErrorToastRequest();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const chainName = query.chain as string | null;
  const chain = Chain.fromName(chainName);

  const id = parseInteger(query.id as string);
  useWindowTitle(
    `Coinflip - Game #${id} on ${capitalizeFirstLetter(chainName)}`
  );

  if (isClient && id && !chain.ok) {
    dispatchErrorToastRequest('Chain needs to specified!');

    replace('/games');
  }

  const chainId = chain.ok ? chain.ok.id : null;

  const fetchGameParams = useMemo(
    () =>
      id && chainId
        ? { id, chain_id: chainId, player_address: currentWeb3Account?.address }
        : null,
    [id, chainId, currentWeb3Account]
  );
  const maybeGame = useCoinflipGame(fetchGameParams);
  const maybeGameActivities = useCoinflipGameActivities(id, chainId);

  if (maybeGame.error?.isNotFoundError()) {
    dispatchErrorToastRequest('Game not found!');

    replace('/games');
  }

  if (!(maybeGame.hasLoaded && maybeGameActivities.hasLoaded))
    return <Loader loadingText="Loading Game Activities..." />;

  const game = maybeGame.game!;
  const gameActivities = maybeGameActivities.gameActivities!;

  return (
    <>
      <GameProofModal />
      <GamePlayProofModal />
      <div className="px-1 md:px-20 lg:px-60 text-white mb-48">
        <div className="mt-4">
          {isClient && <GameHeader game={game} />}

          <GameDetails className="mt-6" game={game} />
        </div>

        <GameActivitiesView
          gameActivities={gameActivities}
          game={game}
          currentWeb3Account={currentWeb3Account}
        />

        <ExploreOtherGamesView gameId={game.id} className="mt-16" />
      </div>

      {game.isAwaitingPlayers() && (
        <CopyGameLinkButton className="fixed bottom-20" />
      )}
      <MainControlButtons
        currentWeb3Account={currentWeb3Account}
        game={game}
        className="fixed bottom-8 right-12"
      />
    </>
  );
}

function GameHeader({ game }: { game: CoinflipGame }) {
  const isMobile = useIsMobile();
  const { push } = useRouter();

  if (isMobile) {
    return (
      <div className="flex justify-between items-center">
        <BackButtonNoBorder
          className="relative right-4"
          onClick={() => push('/games')}
        />
        <div className="flex justify-center items-center gap-2 relative right-4">
          <h2 className="text-2xl tracking-wider font-[Poppins]">
            Game #{game.id}
          </h2>
        </div>
        <CoinWithChainLogoAnimated chain={game.getChain()} size="sm" />
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold tracking-wide font-[Poppins]">
        GAME #{game.id}
      </h2>
      <div className="w-4 mr-6">
        <CoinWithChainLogoAnimated size="lg" chain={game.getChain()} />
      </div>
    </div>
  );
}
