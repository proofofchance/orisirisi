import { ReactNode } from 'react';
import { CoinflipGame, formatUSD } from '@orisirisi/coinflip';
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
        detail={`${game.wager} ${gameChainCurrency} ~ USD ${formatUSD(
          game.wager_usd
        )}`}
      />
      {(game.isOngoing() || !gameExpiryCountdown.isFinished()) && (
        <GameDetailRow
          label="Time left to participate"
          detail={<GameExpiryCountdown countdown={gameExpiryCountdown} />}
        />
      )}
      <GameDetailRow
        label="Number of players"
        detail={`${game.total_players_required}`}
      />
      {game.players_left > 0 && (
        <GameDetailRow
          label="Required Players For Completion"
          detail={`${game.players_left}`}
        />
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
