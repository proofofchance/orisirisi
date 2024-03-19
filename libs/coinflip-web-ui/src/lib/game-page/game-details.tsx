import { ReactNode } from 'react';
import { CoinflipGame, formatCurrency } from '@orisirisi/coinflip';
import { GameExpiryCountdown, useGameExpiryCountdown } from '../hooks';
import { GameStatusBadge } from '../game-status-badge';
import { PropsWithClassName, useIsMobile } from '@orisirisi/orisirisi-web-ui';

export function GameDetails({
  game,
  className,
}: { game: CoinflipGame } & PropsWithClassName) {
  const gameChainCurrency = game.getChain().getCurrency();
  const gameExpiryCountdown = useGameExpiryCountdown(
    game.getExpiryTimestampMs()
  );
  const isMobile = useIsMobile();

  return (
    <div className={className}>
      <GameDetailRow
        label="Wager"
        detail={`${formatCurrency(game.wager, {
          isCryptoCurrency: true,
        })} ${gameChainCurrency}`}
      />
      {game.isNotCompleteYet() && gameExpiryCountdown.isNotFinished() && (
        <GameDetailRow
          label={isMobile ? 'Time Left' : 'Time Left to Participate'}
          detail={<GameExpiryCountdown countdown={gameExpiryCountdown} />}
        />
      )}
      <GameDetailRow
        label={isMobile ? 'Players' : 'Number of Players'}
        detail={`${game.total_players_required}`}
      />
      {game.isExpired() || game.isCompleted() ? (
        <GameDetailRow
          label={isMobile ? 'Status' : 'Current Status'}
          detail={<GameStatusBadge gameStatus={game.status} />}
        />
      ) : null}
      {game.players_left > 0 && game.isAwaitingPlayers() && (
        <GameDetailRow label="Players left" detail={`${game.players_left}`} />
      )}
    </div>
  );
}
function GameDetailRow({
  label,
  detail,
}: {
  label: string;
  detail: ReactNode;
}) {
  return (
    <div className="flex justify-between mt-1">
      <div>{label}</div>
      <div>{detail}</div>
    </div>
  );
}
