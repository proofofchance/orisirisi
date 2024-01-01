import { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  ChainLogo,
  CopyGameLinkButton,
  ExploreOtherGamesView,
  GamePageTabs,
  MainControlButtons,
  useCoinflipGame,
  useCoinflipGameActivities,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';

export default function GamePage() {
  const isClient = useIsClient();
  const { query, replace } = useRouter();
  const { currentWeb3Account } = useCurrentWeb3Account();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const id = parseInteger(query.id as string);
  const chainId = parseInteger(query.chain_id as string);

  if (isClient && id && !chainId) {
    dispatchErrorToastRequest('ChainID needs to specified!');

    replace('/games');
  }

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
      <div className="text-white mt-4">
        <div className="flex justify-between">
          <h2 className="text-xl">GAME #{id}</h2>
          <div className="w-4">
            <ChainLogo chain={game.getChain()} />
          </div>
        </div>
        <GamePageTabs
          currentWeb3Account={currentWeb3Account}
          game={game}
          gameActivities={gameActivities}
        />
      </div>

      <ExploreOtherGamesView gameId={game.id} className="mt-20" />

      {game.isOngoing() && <CopyGameLinkButton className="fixed bottom-20" />}
      <MainControlButtons
        currentWeb3Account={currentWeb3Account}
        game={game}
        className="fixed bottom-8 right-20"
      />
    </>
  );
}
