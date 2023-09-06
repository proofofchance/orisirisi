import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import {
  WagerForm,
  WagerFormSection,
} from './create-game-section/wager-form-section';
import {
  NumberOfPlayersForm,
  NumberOfPlayersFormSection,
} from './create-game-section/number-of-players-form-section';
import {
  ExpiryForm,
  ExpiryFormSection,
} from './create-game-section/expiry-form-section';
import {
  CoinSideForm,
  CoinSideFormSection,
} from './create-game-section/coin-side-form-section';

type CreateGameForm = WagerForm &
  NumberOfPlayersForm &
  ExpiryForm &
  CoinSideForm;

export function CreateGameSection() {
  const formMethods = useForm<CreateGameForm>();
  const { formState, trigger: triggerValidation } = formMethods;

  const { stepCount, formSteps, goToNextStep, goToPreviousStep } =
    useFormSteps<CreateGameForm>();

  formSteps
    .addStep(['wager'], <WagerFormSection goToNextStep={goToNextStep} />)
    .addStep(['numberOfPlayers'], <NumberOfPlayersFormSection />)
    .addStep(['expiry', 'expiryUnit'], <ExpiryFormSection />)
    .addStep(['coinSide'], <CoinSideFormSection />);

  const currentFields = formSteps.getFields(stepCount);
  const isFirstStep = stepCount === 0;
  const isCurrentFormStepDirty = currentFields.every(
    (field) => !!formState.dirtyFields[field]
  );
  const isCurrentFormStepValid = async () => {
    await Promise.all(
      currentFields.map(async (field) => await triggerValidation(field))
    );

    return currentFields.every((field) => !formState.errors[field]);
  };

  return (
    <div>
      <BackButton onClick={goToPreviousStep} />

      <form
        onSubmit={formMethods.handleSubmit((createGameParams) =>
          console.log({ createGameParams })
        )}
      >
        <FormProvider {...formMethods}>
          {formSteps.renderStep(stepCount)}
        </FormProvider>
      </form>

      <div className="mt-16 w-100 text-center">
        <BottomNavigationButtons
          isFirstStep={isFirstStep}
          isCurrentFormStepDirty={isCurrentFormStepDirty}
          isCurrentFormStepValid={isCurrentFormStepValid}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
        />
      </div>
    </div>
  );
}
