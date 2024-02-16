import { Web3Account } from '@orisirisi/orisirisi-web3';
import { MainButton } from './main-button';
import { CoinflipGame } from '@orisirisi/coinflip';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { PlayIcon } from '@heroicons/react/24/solid';

import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import {
  useCurrentChain,
  useCurrentWeb3Provider,
} from '@orisirisi/orisirisi-web3-ui';
import { capitalizeFirstLetter } from '@orisirisi/orisirisi-data-utils';

export function PlayMainButton({
  currentWeb3Account,
  game,
}: {
  currentWeb3Account: Web3Account | null;
  game: CoinflipGame;
}) {
  const { push } = useRouter();

  const currentWeb3Provider = useCurrentWeb3Provider();
  const currentChain = useCurrentChain();

  const useDisabled = (): [boolean, string] => {
    if (!currentWeb3Account) return [true, 'Connect wallet first ↑'];
    if (currentChain && !game.getChain().equals(currentChain))
      return [
        true,
        `You have to be on ${capitalizeFirstLetter(
          game.getChain().getName()
        )} to play this game`,
      ];
    return [false, ''];
  };

  const [disabled, disabledReason] = useDisabled();

  return (
    <MainButton
      disabled={disabled}
      disabledReason={disabledReason}
      onClick={async () => {
        const myBalance = await currentWeb3Account!.getBalance(
          currentWeb3Provider!
        );

        if (myBalance < game.wager) {
          return toast.error(
            `Insufficient balance. You need ${game.wager} ${Chain.fromChainID(
              game.chain_id
            ).getCurrency()} to play`,
            {
              position: 'bottom-left',
            }
          );
        }

        return push(
          `/games/${game.id}/play?chain=${game.getChain().getName()}`
        );
      }}
      icon={<PlayIcon className="h-8" />}
      label="Play"
    />
  );
}
