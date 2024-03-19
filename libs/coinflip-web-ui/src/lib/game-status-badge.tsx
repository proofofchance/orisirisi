import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import {
  CoinflipConcludedGameStatus,
  CoinflipGameStatus,
} from '@orisirisi/coinflip';
import { ReactNode } from 'react';

const badgeColors: Record<CoinflipConcludedGameStatus, string> = {
  expired: 'red',
  completed: 'green',
};

const badgeIcons: Record<CoinflipConcludedGameStatus, ReactNode> = {
  expired: <ClockIcon className="w-3 relative top-[0.6px]" />,
  completed: <CheckCircleIcon className="w-3 relative top-[0.6px]" />,
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
          className="text-xs rounded-xl px-2 py-1 flex items-center gap-1"
          style={{ background: badgeColors[gameStatus] }}
        >
          {badgeIcons[gameStatus]}
          <span className="inline-block">{gameStatus}</span>
        </div>
      );
    default:
      throw new Error(`Invalid game status for badge display: ${gameStatus}`);
  }
}
