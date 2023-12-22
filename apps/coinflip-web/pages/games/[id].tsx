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
  useDispatchCoinflipRepoErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';

export default function GamePage() {
  const { query, replace } = useRouter();

  const id = parseInteger(query.id as string);

  const { currentWeb3Account } = useCurrentWeb3Account();

  const fetchGameParams = useMemo(
    () => (id ? { id, playerAddress: currentWeb3Account?.address } : null),
    [id, currentWeb3Account]
  );
  const maybeGame = useCoinflipGame(fetchGameParams);

  const maybeGameActivities = useCoinflipGameActivities(id);

  const dispatchErrorToastRequest = useDispatchCoinflipRepoErrorToastRequest();

  if (maybeGame.notFound) {
    dispatchErrorToastRequest(maybeGame.error!, 'Game not found!');

    replace('/games');
  }

  if (
    !(
      currentWeb3Account &&
      maybeGame.hasLoaded &&
      maybeGameActivities.hasLoaded
    )
  )
    return null;

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
