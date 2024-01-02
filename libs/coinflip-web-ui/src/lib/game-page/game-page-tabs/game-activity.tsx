import { CoinflipGameActivity, coinSideToString } from '@orisirisi/coinflip';
import { shortenPublicAddress } from '../../data-utils';

export function GameActivity({
  currentAccountAddress,
  gameActivity,
}: {
  currentAccountAddress: string | null;
  gameActivity: CoinflipGameActivity;
}) {
  const triggerPublicAddress = shortenPublicAddress(
    gameActivity.trigger_public_address
  );
  const triggerIsMe =
    currentAccountAddress === gameActivity.trigger_public_address;

  const getReport = () => {
    switch (gameActivity.kind) {
      case 'game_created':
        return getGameCreatedReport();
      case 'game_play_created':
        return getGamePlayCreatedReport();
      case 'game_play_proof_created':
        return getPlayProofReport();
      case 'game_expired':
        return 'Game expired!';
      default:
        throw new Error(`Unknown game activity kind ${gameActivity.kind}`);
    }
  };

  const getGameCreatedReport = () => {
    if (triggerIsMe) {
      return 'You created this game';
    }
    return `This game was created by ${triggerPublicAddress}`;
  };

  const getGamePlayCreatedReport = () => {
    const coinSide = coinSideToString(
      gameActivity.getPlayCreatedData().coin_side
    );

    if (triggerIsMe) {
      return `You predict ${coinSide}`;
    }
    return `Player with address: ${triggerPublicAddress} predicts ${coinSide}`;
  };

  const getPlayProofReport = () => {
    if (triggerIsMe) {
      return 'You uploaded your game play proof';
    }
    return `${triggerPublicAddress} uploaded their game play proof`;
  };

  return <p>{getReport()}</p>;
}
