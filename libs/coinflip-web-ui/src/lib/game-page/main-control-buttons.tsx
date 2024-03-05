import { CoinflipGame } from '@orisirisi/coinflip';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import { UploadProofMainButton } from './main-control-buttons/upload-proof-main-button';
import { PlayMainButton } from './main-control-buttons/play-main-button';

export function MainControlButtons({
  currentWeb3Account,
  game,
  className,
}: {
  currentWeb3Account: Web3Account | null;
  game: CoinflipGame;
} & PropsWithClassName) {
  const getMainButton = () => {
    if (game.isAwaitingPlayers() && game.iHaveNotPlayed()) {
      return (
        <PlayMainButton game={game} currentWeb3Account={currentWeb3Account} />
      );
    }
    if (
      currentWeb3Account &&
      (game.isAwaitingPlayers() || game.isAwaitingRevealedChances())
    ) {
      return (
        <UploadProofMainButton
          game={game}
          currentWeb3Account={currentWeb3Account}
        />
      );
    }

    return null;
  };

  const mainButton = getMainButton();

  if (!mainButton) return null;

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
        {mainButton}
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
