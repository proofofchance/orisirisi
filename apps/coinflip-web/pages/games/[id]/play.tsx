import {
  PlayGameSection,
  useAuthentication,
  useCoinflipGame,
  useDispatchErrorToastRequest,
} from '@orisirisi/coinflip-web-ui';
import {
  capitalizeFirstLetter,
  parseInteger,
} from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import {
  useCurrentChain,
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
  const chainName = query.chain as string | null;
  const chain = Chain.fromName(chainName);

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
    game && `/games/${game.id}?chain=${game.getChain().getName()}`;

  game &&
    currentWeb3Provider &&
    currentWeb3Account?.getBalance(currentWeb3Provider).then((myBalance) => {
      if (myBalance && myBalance < game.wager) {
        replace(gamePath!);
        dispatchErrorToastRequest(
          `Insufficient balance. You need ${game.wager} ${Chain.fromChainID(
            game.chain_id
          ).getCurrency()} to play`
        );
      }
    });

  useAuthentication(gamePath);

  if (game?.iHavePlayed()) {
    toast.error("Oops! Looks like you've already played this game.", {
      position: 'bottom-right',
    });
    replace(gamePath!);
  }

  const currentChain = useCurrentChain();

  if (game && currentChain && !game.getChain().equals(currentChain)) {
    toast.error(
      `Invalid Network! Sorry, you have to be on ${capitalizeFirstLetter(
        game.getChain().getName()
      )} network to play this game`,
      {
        position: 'bottom-right',
      }
    );
    replace(gamePath!);
  }

  return <>{isClient && game && <PlayGameSection game={game} />}</>;
}

export default PlayGame;
