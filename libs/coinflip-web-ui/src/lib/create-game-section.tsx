import { FormProvider, useForm } from 'react-hook-form';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButton } from './create-game-section/bottom-navigation-buttons';
import { GetWager } from './create-game-section/get-wager';

interface CreateGameParams {
  wager: number;
}

export function CreateGameSection() {
  const formMethods = useForm<CreateGameParams>();

  return (
    <div>
      <BackButton />

      <form
        onSubmit={formMethods.handleSubmit(
          (createGameParams: CreateGameParams) =>
            console.log({ createGameParams })
        )}
      >
        <FormProvider {...formMethods}>
          <GetWager />
        </FormProvider>
      </form>

      <div className="mt-12 w-100 text-center">
        <BottomNavigationButton active>Continue</BottomNavigationButton>
      </div>
    </div>
  );
}
