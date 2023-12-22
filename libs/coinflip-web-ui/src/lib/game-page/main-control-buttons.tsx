import { COINFLIP_INDEX_GRACE_PERIOD, CoinflipGame } from '@orisirisi/coinflip';
import { CoinflipContract } from '@orisirisi/coinflip-contracts';
import {
  ButtonProps,
  PropsWithClassName,
  cn,
} from '@orisirisi/orisirisi-web-ui';
import {
  Web3Account,
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { useRouter } from 'next/router';
import { ChangeEvent, ReactNode, useRef } from 'react';
import { ArrowUpTrayIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export function MainControlButtons({
  currentWeb3Account,
  game,
  className,
}: {
  currentWeb3Account: Web3Account;
  game: CoinflipGame;
} & PropsWithClassName) {
  const { push } = useRouter();
  const currentChain = useCurrentChain();

  const uploadProofButtonRef = useRef<HTMLInputElement>(null);
  const uploadProofOfChance = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const proofOfChancefile = files[0];
      const proofOfChance = ProofOfChance.fromFileContent(
        await readFileAsync(proofOfChancefile)
      );

      const { ok: signer, error } = await currentWeb3Account!.getSigner();

      // TODO: Do something with error here
      const coinflipContract = CoinflipContract.fromSignerAndChain(
        signer!,
        currentChain!.id
      );

      try {
        await coinflipContract.uploadGamePlayProof(
          game!.id,
          game.my_game_play_id!,
          proofOfChance.getProof()
        );

        toast.loading('Uploading your Game Play Proof', {
          position: 'bottom-right',
          duration: COINFLIP_INDEX_GRACE_PERIOD,
        });

        setTimeout(() => {
          toast.success('Game play proof successfully uploaded!', {
            position: 'bottom-right',
          });
          push('/games?for=my_games');
        }, COINFLIP_INDEX_GRACE_PERIOD);
      } catch (e) {
        console.log({ e });
        switch (Web3ProviderError.from(e).code) {
          case Web3ProviderErrorCode.UserRejected:
            toast.error("Oops! Looks like you've rejected the transaction.", {
              position: 'bottom-right',
            });
            break;
        }
      }
    }
  };

  const renderMainButton = () => {
    if (game.is_awaiting_my_play_proof) {
      return (
        <>
          <input
            style={{ display: 'none' }}
            type="file"
            accept={ProofOfChance.FILE_EXTENSION}
            multiple={false}
            onChange={uploadProofOfChance}
            ref={uploadProofButtonRef}
          />
          <MainButton
            onClick={() => uploadProofButtonRef.current!.click()}
            icon={<ArrowUpTrayIcon className="h-8" />}
            label="Upload Proof"
          />
        </>
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
function MainButton({
  onClick,
  icon,
  label,
}: ButtonProps & { icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent text-white hover:bg-white hover:text-black fill-current focus:outline-none border-[1px] border-white w-24 h-24 flex justify-center items-center rounded-full shadow-md"
    >
      <span className="flex flex-col gap-1 justify-center items-center">
        {icon}
        <span className="text-[10px]">{label}</span>
      </span>
    </button>
  );
}

const readFileAsync = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading the file.'));
    };

    // Read the content of the file as text
    reader.readAsText(file);
  });
};
