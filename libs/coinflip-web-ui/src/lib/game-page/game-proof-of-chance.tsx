import { RevealedProofOfChance } from '@orisirisi/proof-of-chance';
import { DocumentIcon } from '@heroicons/react/24/solid';
import { atom, useAtom } from 'jotai';
import { Modal } from '../modals';
import { shortenPublicAddress } from '../data-utils';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';

export function GameProofOfChance({
  gameId,
  proofOfChances,
}: {
  gameId: number;
  proofOfChances: RevealedProofOfChance[];
}) {
  const { openModal } = useGameProofModal();

  return (
    <div className="flex flex-col items-center cursor-pointer">
      <DocumentIcon
        onClick={() => openModal(gameId, proofOfChances)}
        style={{
          color: RevealedProofOfChance.combinedColor,
        }}
        className="h-20 hover:h-24 transition duration-150 ease-in-out"
      />
      <span className="text-xs">Game's proof</span>
    </div>
  );
}

const gameProofModal = atom<
  [gameId: number, proofs: RevealedProofOfChance[]] | null
>(null);
function useGameProofModal() {
  const [modalProps, setModalProps] = useAtom(gameProofModal);
  const openModal = (gameId: number, proofs: RevealedProofOfChance[]) =>
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
  const { currentWeb3Account } = useCurrentWeb3Account();
  const { showModal, modalProps, closeModal } = useGameProofModal();

  if (!modalProps) return null;

  const [gameId, proofs] = modalProps;
  const showWhiteSpaceHint = proofs.some((p) => p.chance.includes(' '));

  const headers = ['Players', 'Chance', 'Length'];
  const totalChanceLength = RevealedProofOfChance.countAllChances(proofs);
  const totalChanceLengthIsEven = totalChanceLength % 2 === 0;

  return (
    <Modal
      className="top-[90px] w-[400px] max-h-[80vh] left-[calc(50vw-200px)] pb-10 overflow-y-auto"
      title={`Game #${gameId}'s Proof Of Chance`}
      show={showModal}
      close={closeModal}
    >
      <>
        <h3 className="my-2">How was the outcome determined? </h3>
        <p className="text-sm">
          If total chance length is an <b>EVEN NUMBER</b>, the outcome is{' '}
          <b>HEAD</b>. If it is an <b>ODD NUMBER</b>, the outcome is <b>TAIL</b>
          .
        </p>
        <div className="mt-2 text-sm">
          <div
            id="game-proof-of-modal--header"
            className="grid grid-cols-3 gap-4 p-4 font-semibold text-center"
          >
            {headers.map((header, i) => (
              <div key={i}>{header}</div>
            ))}
          </div>
          <hr />

          {proofs.map(({ player_address, chance }, i) => {
            const isMyAddress =
              currentWeb3Account &&
              player_address === currentWeb3Account.address;

            return (
              <div className="text-center" key={i}>
                <div className="grid grid-cols-3 gap-4 p-4 font-semibold">
                  <div>
                    {shortenPublicAddress(player_address)}{' '}
                    {isMyAddress && <span>(You)</span>}
                  </div>
                  <div className="text-white break-words">
                    <span className="bg-black">
                      {chance.replace(/ /g, '■')}
                    </span>
                  </div>
                  <div>{chance.length}</div>
                </div>
                <hr />
              </div>
            );
          })}

          <div>
            <div
              id="game-proof-of-modal--total"
              className="grid grid-cols-3 gap-4 p-4 font-semibold text-center"
            >
              <div>Total</div>
              <div></div>
              <div>{totalChanceLength}</div>
            </div>
          </div>
          <hr />
          {showWhiteSpaceHint && (
            <p className="mt-4 text-xs">
              <i>N/B: White box depicts white space</i>
            </p>
          )}

          <p id="game-proof-modal--conclusion" className="mt-6">
            Since the total chance length, <b>{totalChanceLength}</b>, is an{' '}
            <b>{totalChanceLengthIsEven ? 'EVEN' : 'ODD'} NUMBER</b>, the
            outcome is proven to be{' '}
            <b>{totalChanceLengthIsEven ? 'HEAD' : 'TAIL'}</b>
          </p>
        </div>
      </>
    </Modal>
  );
}
