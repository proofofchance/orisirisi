import { CoinflipGameActivity, coinSideToString } from '@orisirisi/coinflip';
import { shortenPublicAddress } from './data-utils';

export function GameActivity({
  currentAccountAddress,
  gameActivity,
}: {
  currentAccountAddress: string;
  gameActivity: CoinflipGameActivity;
}) {
  const triggerPublicAddress = shortenPublicAddress(
    gameActivity.trigger_public_address
  );

  const getReport = () => {
    switch (gameActivity.kind) {
      case 'game_created':
        return `This game was created by ${triggerPublicAddress}`;
      case 'game_play_created':
        return `Player with address: ${triggerPublicAddress} predicts ${coinSideToString(
          gameActivity.getPlayCreatedData().coin_side
        )}`;
      case 'game_play_proof_created':
        return getPlayProofReport();
      case 'game_expired':
        return 'Game expired!';
      default:
        throw new Error(`Unknown game activity kind ${gameActivity.kind}`);
    }
  };

  const getPlayProofReport = () => {
    if (currentAccountAddress === gameActivity.trigger_public_address) {
      return 'You uploaded your game play proof';
    }

    return `${triggerPublicAddress} uploaded their game play proof`;
  };

  return <p>{getReport()}</p>;
}
