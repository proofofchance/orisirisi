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

interface CreateGameForm
  extends GetWagerForm,
    GetNumberOfPlayersForm,
    GetExpiryForm {}

export function CreateGameSection() {
  const formMethods = useForm<CreateGameForm>();
  const { formState, trigger: triggerValidation } = formMethods;

  const { stepCount, formSteps, goToNextStep, goToPreviousStep } =
    useFormSteps();

  formSteps
    .addStep(<GetWagerFormSection goToNextStep={goToNextStep} />)
    .addStep(<GetNumberOfPlayersFormSection />)
    .addStep(<GetExpiryFormSection />);

  const currentField = formSteps.getField(stepCount);
  const isFirstStep = stepCount === 0;
  const isCurrentFormStepDirty = !!formState.dirtyFields[currentField];
  const isCurrentFormStepValid = async () =>
    (await triggerValidation(currentField)) && !formState.errors[currentField];

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

      <div className="mt-12 w-100 text-center">
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
