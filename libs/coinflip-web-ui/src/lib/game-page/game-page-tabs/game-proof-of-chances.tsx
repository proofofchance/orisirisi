import { DocumentIcon } from '@heroicons/react/24/solid';
import { PublicProofOfChance } from '@orisirisi/proof-of-chance';
import { shortenPublicAddress } from '../../data-utils';
import { Modal } from '../../modals';
import { atom, useAtom } from 'jotai';

export function GameProofOfChances({
  gameId,
  proofOfChances,
}: {
  gameId: number;
  proofOfChances: PublicProofOfChance[] | null;
}) {
  if (!proofOfChances)
    return (
      <p className="text-center mt-6 self-center">
        All the play proofs will be listed here after all uploads is complete.
      </p>
    );
  return (
    <>
      <GamePlayProofModal />
      <div className="flex gap-4 mt-4">
        {proofOfChances.map((proofOfChance, i) => (
          <GameProofOfChance
            key={i}
            gameId={gameId}
            proofOfChance={proofOfChance}
          />
        ))}
      </div>
    </>
  );
}
export function GameProofOfChance({
  gameId,
  proofOfChance,
}: {
  gameId: number;
  proofOfChance: PublicProofOfChance;
}) {
  const { openModal } = useGamePlayProofModal();
  return (
    <div className="flex flex-col cursor-pointer">
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
function GamePlayProofModal() {
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
