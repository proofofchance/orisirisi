import { DocumentIcon } from '@heroicons/react/24/solid';
import { PlayProof } from '@orisirisi/proof-of-chance';
import { shortenPublicAddress } from '../../data-utils';

export function GamePlayProofs({
  gameId,
  playProofs,
}: {
  gameId: number;
  playProofs: PlayProof[] | null;
}) {
  if (!playProofs)
    return (
      <p className="text-center mt-6 self-center">
        All the play proofs will be listed here after all uploads is complete.
      </p>
    );
  return (
    <div className="flex gap-4 mt-4">
      {playProofs.map((playProof, i) => (
        <GamePlayProof key={i} gameId={gameId} playProof={playProof} />
      ))}
    </div>
  );
}
export function GamePlayProof({
  gameId,
  playProof,
}: {
  gameId: number;
  playProof: PlayProof;
}) {
  return (
    <div className="flex flex-col cursor-pointer">
      <DocumentIcon
        style={{
          color: playProof.getColor(gameId),
        }}
        className="h-20 hover:h-24 transition duration-150 ease-in-out"
      />
      <span className="text-xs">
        {shortenPublicAddress(playProof.player_address)}'s proof
      </span>
    </div>
  );
}
