import { useFormSteps } from './form-steps';
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
  const isFirstFormDirty = formState.dirtyFields[firstField];
  const { stepCount, goToNextStep, goToPreviousStep } = useFormSteps({
    maxStepCount: 2,
  });
  const isFirstStep = stepCount === 0;

  const validateAndGoToNextStep = async (field: CreateGameParamsField) => {
    const _triggerValidation = await trigger(field);

    if (formState.isValid) {
      goToNextStep();
    }
  };

  const renderFormStep = () => {
    switch (stepCount) {
      case 0:
        return (
          <GetWager
            wagerField={wagerField}
            validateAndGoToNextStep={validateAndGoToNextStep}
          />
        );
      case 1:
        return <p>TODO: Next step</p>;
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
        {isFirstStep && (
          <BottomNavigationButton
            onClick={() => validateAndGoToNextStep(firstField)}
            active
            disabled={!isFirstFormDirty}
          >
            Continue
          </BottomNavigationButton>
        )}
      </div>
    </div>
  );
}
