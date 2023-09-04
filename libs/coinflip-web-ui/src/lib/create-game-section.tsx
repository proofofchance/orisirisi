import { useFormSteps } from './form-steps';
import { FormProvider, useForm } from 'react-hook-form';
import {
  CreateGameParams,
  wagerParamKey,
  numberOfPlayersFieldParamKey,
} from '@orisirisi/coinflip';
import { BackButton } from './create-game-section/back-button';
import {
  ContinueButton,
  NextButton,
  PreviousButton,
} from './create-game-section/bottom-navigation-buttons';
import { GetWagerFormSection } from './create-game-section/get-wager-form-section';
import { GetNumberOfPlayersFormSection } from './create-game-section/get-number-of-players-form-section';

const fieldsInStepsOrder = [wagerParamKey, numberOfPlayersFieldParamKey];
const getCurrentField = (stepCount: number) => fieldsInStepsOrder[stepCount];

export function CreateGameSection() {
  const formMethods = useForm<CreateGameParams>();
  const { formState, trigger } = formMethods;

  const { stepCount, goToNextStep, goToPreviousStep } = useFormSteps({
    maxStepCount: 2,
  });
  const currentField = getCurrentField(stepCount);

  const isFirstStep = stepCount === 0;
  const isCurrentFormStepDirty = !!formState.dirtyFields[currentField];
  const validateAndGoToNextStep = async () => {
    const _triggerValidation = await trigger(currentField);
    const isFieldValueValid = !formState.errors[currentField];

    if (isFieldValueValid) {
      goToNextStep();
    }
  };

  const renderFormStep = () => {
    switch (stepCount) {
      case 0:
        return (
          <GetWagerFormSection
            wagerField={wagerParamKey}
            validateAndGoToNextStep={validateAndGoToNextStep}
          />
        );
      case 1:
        return (
          <GetNumberOfPlayersFormSection
            numberOfPlayersField={'numberOfPlayers'}
          />
        );
    }
  };

  return (
    <div>
      <BackButton onClick={goToPreviousStep} />

      <form
        onSubmit={formMethods.handleSubmit(
          (createGameParams: CreateGameParams) =>
            console.log({ createGameParams })
        )}
      >
        <FormProvider {...formMethods}>{renderFormStep()}</FormProvider>
      </form>

      <div className="mt-12 w-100 text-center">
        <ContinueButton
          onClick={validateAndGoToNextStep}
          isFirstStep={isFirstStep}
          isCurrentFormStepDirty={isCurrentFormStepDirty}
        />

        <PreviousButton
          onClick={validateAndGoToNextStep}
          isFirstStep={isFirstStep}
          isCurrentFormStepDirty={isCurrentFormStepDirty}
        />

        <NextButton
          onClick={validateAndGoToNextStep}
          isFirstStep={isFirstStep}
          isCurrentFormStepDirty={isCurrentFormStepDirty}
        />
      </div>
    </div>
  );
}
