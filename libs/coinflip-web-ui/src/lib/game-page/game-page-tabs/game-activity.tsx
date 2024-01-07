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
      case 'ongoing':
        return 'Awaiting participating players...';
      case 'expired':
        return 'Game expired!';
      case 'awaiting_proofs_upload':
        return 'Awaiting proof uploads from players...';
      case 'completed':
        return 'Game concluded. These are the winners: <List-winners-here>';
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
    return `Player:${triggerPublicAddress} predicts ${coinSide}`;
  };

  const getPlayProofReport = () => {
    if (triggerIsMe) {
      return 'You uploaded your game play proof';
    }
    return `Player:${triggerPublicAddress} uploaded their game play proof`;
  };

  return <p>{getReport()}</p>;
}
