import { FormProvider, useForm } from 'react-hook-form';
import { useFormSteps } from './form-steps';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import {
  GetWagerForm,
  GetWagerFormSection,
} from './create-game-section/get-wager-form-section';
import {
  GetNumberOfPlayersForm,
  GetNumberOfPlayersFormSection,
} from './create-game-section/get-number-of-players-form-section';
import {
  GetExpiryForm,
  GetExpiryFormSection,
} from './create-game-section/get-expiry-form-section';
import {
  GetCoinSideForm,
  GetCoinSideFormSection,
} from './create-game-section/get-coin-side-form-section';

type CreateGameForm = GetWagerForm &
  GetNumberOfPlayersForm &
  GetExpiryForm &
  GetCoinSideForm;

export function CreateGameSection() {
  const formMethods = useForm<CreateGameForm>();
  const { formState, trigger: triggerValidation } = formMethods;

  const { stepCount, formSteps, goToNextStep, goToPreviousStep } =
    useFormSteps<CreateGameForm>();

  formSteps
    .addStep(['wager'], <GetWagerFormSection goToNextStep={goToNextStep} />)
    .addStep(['numberOfPlayers'], <GetNumberOfPlayersFormSection />)
    .addStep(['expiry', 'expiryUnit'], <GetExpiryFormSection />)
    .addStep(['coinSide'], <GetCoinSideFormSection />);

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
