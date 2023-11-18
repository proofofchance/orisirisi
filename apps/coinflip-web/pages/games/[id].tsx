import { useCoinflipGame } from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useRouter } from 'next/router';

export default function GamePage() {
  const { query, push } = useRouter();
  const id = parseInteger(query.id as string);
  const { game, hasLoaded } = useCoinflipGame(id);

  if (!hasLoaded) return null;

  return (
    <div className="text-center">
      {game!.is_ongoing && (
        <button
          onClick={() => push(`/games/${id}/play`)}
          className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
        >
          Play
        </button>
      )}
    </div>
  );
}
