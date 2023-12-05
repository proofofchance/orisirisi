import { CoinflipGameActivity, coinSideToString } from '@orisirisi/coinflip';
import { shortenPublicAddress } from './data-utils';

export function GameActivity({
  gameActivity,
}: {
  gameActivity: CoinflipGameActivity;
}) {
  const getReport = () => {
    switch (gameActivity.kind) {
      case 'game_created':
        return `This game was created by ${shortenPublicAddress(
          gameActivity.trigger_public_address
        )}`;
      case 'game_play_created':
        return `Player with address: ${shortenPublicAddress(
          gameActivity.trigger_public_address
        )} predicts ${coinSideToString(
          gameActivity.getPlayCreatedData().coin_side
        )}`;
      case 'game_play_proof_created':
        return `Game proof was created`;
    }
  };

  return <p>{getReport()}</p>;
}
