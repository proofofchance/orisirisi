import {
  useCoinflipGame,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function PlayGame() {
  const isClient = useIsClient();
  const { query, replace } = useRouter();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const id = parseInteger(query.id as string);
  const chainId = parseInteger(query.chain_id as string);

  console.log({ id, chainId });
  if (isClient && id && !chainId) {
    dispatchErrorToastRequest('ChainID needs to specified!');

    replace('/games');
  }

  const fetchGameParams = useMemo(
    () => (id && chainId ? { id, chain_id: chainId } : null),
    [id, chainId]
  );
  const { game } = useCoinflipGame(fetchGameParams);

  console.log({ game });

  return (
    <>{isClient && "This will present the proof for the game's outcome"}</>
  );
}

export default PlayGame;
