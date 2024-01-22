import {
  CoinflipConcludedGameStatus,
  CoinflipGameStatus,
} from '@orisirisi/coinflip';

const badgeColors: Record<CoinflipConcludedGameStatus, string> = {
  expired: 'red',
  completed: 'green',
};

export function GameStatusBadge({
  gameStatus,
}: {
  gameStatus: CoinflipGameStatus;
}) {
  switch (gameStatus) {
    case 'completed':
    case 'expired':
      return (
        <div
          className="text-xs rounded-xl px-2 py-1"
          style={{ background: badgeColors[gameStatus] }}
        >
          {gameStatus}
        </div>
      );
    default:
      throw new Error('Invalid game status for badge display');
  }
}
