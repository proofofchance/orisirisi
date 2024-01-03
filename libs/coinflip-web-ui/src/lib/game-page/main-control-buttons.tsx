import { CoinflipGame } from '@orisirisi/coinflip';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { useRouter } from 'next/router';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import { MainButton } from './main-control-buttons/main-button';
import { UploadProofMainButton } from './main-control-buttons/upload-proof-main-button';
import { useCurrentWeb3Provider } from '@orisirisi/orisirisi-web3-ui';
import toast from 'react-hot-toast';
import { Chain } from '@orisirisi/orisirisi-web3-chains';

export function MainControlButtons({
  currentWeb3Account,
  game,
  className,
}: {
  currentWeb3Account: Web3Account | null;
  game: CoinflipGame;
} & PropsWithClassName) {
  const { push } = useRouter();

  const currentWeb3Provider = useCurrentWeb3Provider();

  const renderMainButton = () => {
    if (currentWeb3Account && game.is_awaiting_my_play_proof) {
      return (
        <UploadProofMainButton
          game={game}
          currentWeb3Account={currentWeb3Account}
        />
      );
    }
    if (game.isOngoing() && game.iHaveNotPlayed()) {
      return (
        <MainButton
          disabled={!currentWeb3Account}
          disabledReason="Connect wallet first ↑"
          onClick={async () => {
            const myBalance = await currentWeb3Account!.getBalance(
              currentWeb3Provider!
            );

            if (myBalance < game.wager) {
              return toast.error(
                `Insufficient balance. You need ${
                  game.wager
                } ${Chain.fromChainID(game.chain_id).getCurrency()} to play`,
                {
                  position: 'bottom-left',
                }
              );
            }

            return push(`/games/${game.id}/play?chain_id=${game.chain_id}`);
          }}
          icon={<PlayIcon className="h-8" />}
          label="Play"
        />
      );
    }

    return (
      <MainButton
        onClick={() =>
          push(`/games/${game.id}/prove?chain_id=${game.chain_id}`)
        }
        icon={<ShieldCheckIcon className="h-8" />}
        label={`${game.iHavePlayed() ? 'Prove so far' : 'Prove'}`}
      />
    );
  };

  return (
    <div
      className={cn('text-white flex flex-col items-center gap-2', className)}
    >
      <button>
        <ChevronUpIcon className="h-8" />
      </button>
      <div className="flex gap-2">
        <button>
          <ChevronLeftIcon className="h-8" />
        </button>
        {renderMainButton()}
        <button>
          <ChevronRightIcon className="h-8" />
        </button>
      </div>
      <button>
        <ChevronDownIcon className="h-8" />
      </button>
    </div>
  );
}
