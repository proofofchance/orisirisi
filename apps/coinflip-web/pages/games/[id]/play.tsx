import {
  PlayGameSection,
  useCoinflipGame,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import toast from 'react-hot-toast';

export function PlayGame() {
  const isClient = useIsClient();
  const { replace, query } = useRouter();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const id = parseInteger(query.id as string);
  const chainId = parseInteger(query.chain_id as string);

  if (isClient && id && !chainId) {
    dispatchErrorToastRequest('ChainID needs to specified!');

    replace('/games');
  }

  const { currentWeb3Account } = useCurrentWeb3Account();

  const fetchGameParams = useMemo(
    () =>
      id && chainId
        ? { id, chain_id: chainId, player_address: currentWeb3Account?.address }
        : null,
    [id, chainId, currentWeb3Account]
  );
  const { game } = useCoinflipGame(fetchGameParams);

  if (game?.iHavePlayed()) {
    toast.error("Oops! Looks like you've already played this game.", {
      position: 'bottom-right',
    });
    replace(`/games/${game.id}?chain_id=${game.chain_id}`);
  }

  return <>{isClient && <PlayGameSection game={game} />}</>;
}

export default PlayGame;
