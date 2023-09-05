import { FormProvider, useForm } from 'react-hook-form';
import { FormSteps, useFormSteps } from './form-steps';
import {
  CreateGameParams,
  wagerParamKey,
  numberOfPlayersFieldParamKey,
} from '@orisirisi/coinflip';
import { BackButton } from './create-game-section/back-button';
import { BottomNavigationButtons } from './create-game-section/bottom-navigation-buttons';
import { GetWagerFormSection } from './create-game-section/get-wager-form-section';
import { GetNumberOfPlayersFormSection } from './create-game-section/get-number-of-players-form-section';

export function CreateGameSection() {
  const formMethods = useForm<CreateGameParams>();
  const { formState, trigger: triggerValidation } = formMethods;

  const { stepCount, goToNextStep, goToPreviousStep } = useFormSteps({
    maxStepCount: 2,
  });

  const formSteps = new FormSteps<CreateGameParams>()
    .addStep(
      <GetWagerFormSection field={wagerParamKey} goToNextStep={goToNextStep} />
    )
    .addStep(
      <GetNumberOfPlayersFormSection field={numberOfPlayersFieldParamKey} />
    );
  const currentField = formSteps.getField(stepCount);
  const isFirstStep = stepCount === 0;
  const isCurrentFormStepDirty = !!formState.dirtyFields[currentField];
  const isCurrentFormStepValid = async () =>
    (await triggerValidation(currentField)) && !formState.errors[currentField];

  return (
    <div>
      <BackButton onClick={goToPreviousStep} />

      <form
        onSubmit={formMethods.handleSubmit(
          (createGameParams: CreateGameParams) =>
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
