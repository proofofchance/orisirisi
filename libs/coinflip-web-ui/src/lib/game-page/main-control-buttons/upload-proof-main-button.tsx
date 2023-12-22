import { ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { CoinflipContract } from '@orisirisi/coinflip-contracts';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { MainButton } from './main-button';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import {
  Web3Account,
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import { COINFLIP_INDEX_GRACE_PERIOD, CoinflipGame } from '@orisirisi/coinflip';

export function UploadProofMainButton({
  game,
  currentWeb3Account,
}: {
  game: CoinflipGame;
  currentWeb3Account: Web3Account;
}) {
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
