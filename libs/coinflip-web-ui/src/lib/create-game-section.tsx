import { BackButton } from './create-game-section/back-button';
import { ContinueButton } from './create-game-section/bottom-navigation-buttons';
import { GetWager } from './create-game-section/get-wager';

export function CreateGameSection() {
  return (
    <div>
      <BackButton />

      <GetWager />

      <div className="mt-8 w-100 text-center">
        <ContinueButton />
      </div>
      {/* TODO: Show USD estimation here */}
    </div>
  );
}
