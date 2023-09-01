import { BackButton } from './back-button';
import { ContinueButton } from './bottom-navigation-buttons';
import { GetWager } from './get-wager';

export function CreateGameSection() {
  return (
    <div>
      <BackButton />

      <ContinueButton />

      <GetWager />
    </div>
  );
}
