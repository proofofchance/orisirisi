import { PublicProofOfChance } from '@orisirisi/proof-of-chance';
import { DocumentIcon } from '@heroicons/react/24/solid';
import { atom, useAtom } from 'jotai';
import { Modal } from '../modals';

export function GameProofOfChance({
  gameId,
  proofOfChances,
}: {
  gameId: number;
  proofOfChances: PublicProofOfChance[];
}) {
  const { openModal } = useGameProofModal();

  return (
    <div className="flex flex-col items-center cursor-pointer">
      <DocumentIcon
        onClick={() => openModal(gameId, proofOfChances)}
        style={{
          color: PublicProofOfChance.combinedColor,
        }}
        className="h-20 hover:h-24 transition duration-150 ease-in-out"
      />
      <span className="text-xs">Game's proof</span>
    </div>
  );
}

const gameProofModal = atom<
  [gameId: number, proofs: PublicProofOfChance[]] | null
>(null);
function useGameProofModal() {
  const [modalProps, setModalProps] = useAtom(gameProofModal);
  const openModal = (gameId: number, proofs: PublicProofOfChance[]) =>
    setModalProps([gameId, proofs]);
  const closeModal = () => setModalProps(null);
  return {
    showModal: !!modalProps,
    modalProps,
    openModal,
    closeModal,
  };
}
export function GameProofModal() {
  const { showModal, modalProps, closeModal } = useGameProofModal();

  if (!modalProps) return null;

  const [gameId, proofs] = modalProps;

  return (
    <Modal
      className="top-[90px] w-[400px] left-[calc(50vw-200px)]"
      title={`Game ${gameId}'s Proof Of Chance`}
      show={showModal}
      close={closeModal}
    >
      <div className="flex flex-col mt-4">
        <p>Table here</p>
      </div>
    </Modal>
  );
}
