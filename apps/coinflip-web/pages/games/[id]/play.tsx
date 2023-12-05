import { PlayGameSection, useCoinflipGame } from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import toast from 'react-hot-toast';

export function PlayGame() {
  const isClient = useIsClient();

  const { replace, query } = useRouter();
  const id = parseInteger(query.id as string);

  const { currentWeb3Account } = useCurrentWeb3Account();

  const fetchGameParams = useMemo(
    () => (id ? { id, playerAddress: currentWeb3Account?.address } : null),
    [id, currentWeb3Account]
  );
  const { game } = useCoinflipGame(fetchGameParams);

  if (game?.iHavePlayed()) {
    toast.error("Oops! Looks like you've already played this game.", {
      position: 'bottom-right',
    });
    replace(`/games/${game.id}`);
  }

  return <>{isClient && <PlayGameSection game={game} />}</>;
}

export default PlayGame;
