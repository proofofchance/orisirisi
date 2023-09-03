import { BackButton } from './create-game-section/back-button';
import { ContinueButton } from './create-game-section/bottom-navigation-buttons';
import { GetWager } from './create-game-section/get-wager';

export function CreateGameSection() {
  return (
    <div>
      <BackButton />

      <ContinueButton />

      <GetWager />
    </div>
  );
}
