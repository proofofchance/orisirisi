import { FormProvider, useForm } from 'react-hook-form';
import { CreateGameParams, CreateGameParamsField } from '@orisirisi/coinflip';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButton } from './create-game-section/bottom-navigation-buttons';
import { GetWager } from './create-game-section/get-wager';

export function CreateGameSection() {
  const formMethods = useForm<CreateGameParams>();
  const { formState, trigger } = formMethods;

  const wagerField: CreateGameParamsField = 'wager';
  const firstField = wagerField;
  const isFirstFormDirty = formState.dirtyFields[wagerField];

  const maybeGoToNext = (field: CreateGameParamsField) => {
    trigger(field);

    // TODO: Go to next
  };

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
          <GetWager wagerField={wagerField} maybeGoToNext={maybeGoToNext} />
        </FormProvider>
      </form>

      <div className="mt-12 w-100 text-center">
        <BottomNavigationButton
          onClick={() => trigger(firstField)}
          active
          disabled={!isFirstFormDirty}
        >
          Continue
        </BottomNavigationButton>
      </div>
    </div>
  );
}
