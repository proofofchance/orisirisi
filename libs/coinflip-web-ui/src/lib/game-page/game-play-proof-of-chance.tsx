import { PublicProofOfChance } from '@orisirisi/proof-of-chance';
import { shortenPublicAddress } from '../data-utils';
import { DocumentIcon } from '@heroicons/react/24/solid';
import { atom, useAtom } from 'jotai';
import { Modal } from '../modals';

export function UnrevealedGamePlayProofOfChance({
  playerAddress,
  ...rest
}: {
  playerAddress: string;
} & {
  [key: `data-${string}`]: unknown;
}) {
  return (
    <div
      className="flex flex-col items-center cursor-not-allowed opacity-70"
      {...rest}
    >
      <DocumentIcon className="text-gray-400 h-20 hover:h-24 transition duration-150 ease-in-out" />
      <span className="text-xs">
        {shortenPublicAddress(playerAddress)}'s proof
      </span>
    </div>
  );
}

export function GamePlayProofOfChance({
  gameId,
  proofOfChance,
}: {
  gameId: number;
  proofOfChance: PublicProofOfChance;
}) {
  const { openModal } = useGamePlayProofModal();

  return (
    <div className="flex flex-col items-center cursor-pointer">
      <DocumentIcon
        onClick={() => openModal(proofOfChance)}
        style={{
          color: proofOfChance.getColor(gameId),
        }}
        className="h-20 hover:h-24 transition duration-150 ease-in-out"
      />
      <span className="text-xs">
        {shortenPublicAddress(proofOfChance.player_address)}'s proof
      </span>
    </div>
  );
}

const gamePlayProofModal = atom<PublicProofOfChance | null>(null);
function useGamePlayProofModal() {
  const [proof, setProof] = useAtom(gamePlayProofModal);
  const openModal = (proof: PublicProofOfChance) => setProof(proof);
  const closeModal = () => setProof(null);
  return {
    showModal: !!proof,
    proof,
    openModal,
    closeModal,
  };
}
export function GamePlayProofModal() {
  const { showModal, proof, closeModal } = useGamePlayProofModal();

  if (!proof) return null;

  return (
    <Modal
      className="top-[90px] w-[400px] left-[calc(50vw-200px)]"
      title={`${shortenPublicAddress(proof.player_address)}'s Proof Of Chance`}
      show={showModal}
      close={closeModal}
    >
      <div className="flex flex-col mt-4">
        <p>Player's chance used in computing coinflip result: {proof.chance}</p>
        <p>
          <i>Proof with random salt from players computer: {proof.salt}</i>
        </p>
      </div>
    </Modal>
  );
}