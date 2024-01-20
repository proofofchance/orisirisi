import {
  PlayGameSection,
  useAuthentication,
  useCoinflipGame,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import {
  useCurrentWeb3Account,
  useCurrentWeb3Provider,
} from '@orisirisi/orisirisi-web3-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import toast from 'react-hot-toast';

export function PlayGame() {
  const isClient = useIsClient();
  const { replace, query } = useRouter();
  const dispatchErrorToastRequest = useDispatchErrorToastRequest();

  const id = parseInteger(query.id as string);
  const chainShortName = query.chain as string | null;
  const chain = Chain.fromShortName(chainShortName);

  if (isClient && id && !chain.ok) {
    dispatchErrorToastRequest('ChainID needs to specified!');

    replace('/games');
  }

  const chainId = chain.ok ? chain.ok.id : null;

  const currentWeb3Provider = useCurrentWeb3Provider();
  const { currentWeb3Account } = useCurrentWeb3Account();

  const fetchGameParams = useMemo(
    () =>
      id && chainId
        ? { id, chain_id: chainId, player_address: currentWeb3Account?.address }
        : null,
    [id, chainId, currentWeb3Account]
  );
  const { game } = useCoinflipGame(fetchGameParams);

  const gamePath =
    game && `/games/${game.id}?chain=${game.getChain().getShortName()}`;

  game &&
    currentWeb3Provider &&
    currentWeb3Account?.getBalance(currentWeb3Provider).then((myBalance) => {
      if (myBalance && myBalance < game.wager) {
        dispatchErrorToastRequest('ChainID needs to specified!');
        replace(gamePath!);
      }
    });

  useAuthentication(gamePath);

  if (game?.iHavePlayed()) {
    toast.error("Oops! Looks like you've already played this game.", {
      position: 'bottom-right',
    });
    replace(gamePath!);
  }

  return <>{isClient && <PlayGameSection game={game} />}</>;
}

export default PlayGame;
