import { ChangeEvent, useRef } from 'react';
import toast from 'react-hot-toast';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { MainButton } from './main-button';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { CoinflipGame, CoinflipHTTPService } from '@orisirisi/coinflip';
import { useRouter } from 'next/router';

export function UploadProofMainButton({
  game,
  currentWeb3Account,
}: {
  game: CoinflipGame;
  currentWeb3Account: Web3Account;
}) {
  const { reload } = useRouter();
  const uploadProofButtonRef = useRef<HTMLInputElement>(null);
  const uploadProofOfChance = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const proofOfChancefile = files[0];
      const proofOfChance = ProofOfChance.fromFileContent(
        await readFileAsync(proofOfChancefile)
      );

      const loadingToastId = toast.loading('Uploading your Game Play Proof', {
        position: 'bottom-right',
      });

      const response = await CoinflipHTTPService.updateMyGamePlay({
        game_id: game!.id,
        chain_id: game.chain_id,
        public_address: currentWeb3Account.address,
        game_play_proof: proofOfChance.getProof(),
      });

      toast.dismiss(loadingToastId);

      if (response.ok) {
        toast.success('Uploaded game play proof successfully', {
          position: 'bottom-right',
          duration: 1000,
        });

        setTimeout(reload, 1000);

        return;
      }

      if (response.error!.isUnprocessableEntityError())
        return toast.error('Invalid proof of chance!', {
          position: 'bottom-right',
        });
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
