import { ReactNode } from 'react';
import { CoinflipGame, formatCurrency } from '@orisirisi/coinflip';
import { GameExpiryCountdown, useGameExpiryCountdown } from '../hooks';

export function GameDetails({ game }: { game: CoinflipGame }) {
  const gameChainCurrency = game.getChain().getCurrency();
  const gameExpiryCountdown = useGameExpiryCountdown(
    game.getExpiryTimestampMs()
  );

  return (
    <div id="game-details-container">
      <GameDetailRow
        label="Wager"
        detail={`${formatCurrency(game.wager, {
          isCryptoCurrency: true,
        })} ${gameChainCurrency}`}
      />
      {game.isNotCompleteYet() && gameExpiryCountdown.isNotFinished() && (
        <GameDetailRow
          label="Time left to participate"
          detail={<GameExpiryCountdown countdown={gameExpiryCountdown} />}
        />
      )}
      <GameDetailRow
        label="Number of players"
        detail={`${game.total_players_required}`}
      />
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
    <div className="flex justify-between">
      <div>{label}</div>
      <div>{detail}</div>
    </div>
  );
}
