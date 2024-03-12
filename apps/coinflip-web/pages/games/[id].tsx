import { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  ChainLogo,
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
import { useIsClient, useWindowTitle } from '@orisirisi/orisirisi-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';

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

  if (!(maybeGame.hasLoaded && maybeGameActivities.hasLoaded)) return null;

  const game = maybeGame.game!;
  const gameActivities = maybeGameActivities.gameActivities!;

  return (
    <>
      <GameProofModal />
      <GamePlayProofModal />
      <div className="px-1 md:px-20 lg:px-60 text-white mb-48">
        <div className="mt-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl">GAME #{id}</h2>
            <div className="w-4">
              <ChainLogo chain={game.getChain()} />
            </div>
          </div>
          <GameDetails game={game} />
        </div>

        <GameActivitiesView
          gameActivities={gameActivities}
          game={game}
          currentWeb3Account={currentWeb3Account}
        />

        <ExploreOtherGamesView gameId={game.id} className="mt-28" />
      </div>

      {game.isAwaitingPlayers() && (
        <CopyGameLinkButton className="fixed bottom-20" />
      )}
      <MainControlButtons
        currentWeb3Account={currentWeb3Account}
        game={game}
        className="fixed bottom-8 right-20"
      />
    </>
  );
}
