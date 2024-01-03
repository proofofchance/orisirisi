import {
  useAuthentication,
  useCoinflipGame,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function ProveGame() {
  const isClient = useIsClient();
  const { query, replace } = useRouter();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const id = parseInteger(query.id as string);
  const chainId = parseInteger(query.chain_id as string);

  if (isClient && id && !chainId) {
    dispatchErrorToastRequest('ChainID needs to specified!');

    replace('/games');
  }

  const fetchGameParams = useMemo(
    () => (id && chainId ? { id, chain_id: chainId } : null),
    [id, chainId]
  );
  const { game } = useCoinflipGame(fetchGameParams);
  const gamePath = game && `/games/${game.id}?chain_id=${game.chain_id}`;
  useAuthentication(gamePath);

  console.log({ game });

  return (
    <>{isClient && "This will present the proof for the game's outcome"}</>
  );
}

export default ProveGame;
