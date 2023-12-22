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
import { UploadMainButton } from './main-control-buttons/upload-main-button';

export function MainControlButtons({
  currentWeb3Account,
  game,
  className,
}: {
  currentWeb3Account: Web3Account;
  game: CoinflipGame;
} & PropsWithClassName) {
  const { push } = useRouter();

  const renderMainButton = () => {
    if (game.is_awaiting_my_play_proof) {
      return (
        <UploadMainButton game={game} currentWeb3Account={currentWeb3Account} />
      );
    }
    if (game.isOngoing() && game.iHaveNotPlayed()) {
      return (
        <MainButton
          onClick={() => push(`/games/${game.id}/play`)}
          icon={<PlayIcon className="h-8" />}
          label="Play"
        />
      );
    }

    return (
      <MainButton
        onClick={() => push(`/games/${game.id}/prove`)}
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
