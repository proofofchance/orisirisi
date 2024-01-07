import { DocumentIcon } from '@heroicons/react/24/solid';
import { PlayProof } from '@orisirisi/proof-of-chance';
import { shortenPublicAddress } from '../../data-utils';

export function GamePlayProof({
  gameId,
  proof,
}: {
  gameId: number;
  proof: PlayProof;
}) {
  return (
    <div className="flex flex-col cursor-pointer">
      <DocumentIcon
        style={{
          color: proof.getColor(gameId),
        }}
        className="h-20 hover:h-24 transition duration-150 ease-in-out"
      />
      <span className="text-xs">
        {shortenPublicAddress(proof.player_address)}'s proof
      </span>
    </div>
  );
}
