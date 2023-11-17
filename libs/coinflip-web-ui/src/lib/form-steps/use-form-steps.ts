import { useState } from 'react';
import { FormSteps } from './form-steps';
import { useSubmitFormStepHandler } from './submit-form-step-handlers';

interface Props {
  initialStepCount?: number;
}

export function useFormSteps<T>(props?: Props) {
  const formSteps = new FormSteps<T>();
  const initialStepCount = props?.initialStepCount ?? 0;
  const [stepCount, setStepCount] = useState(initialStepCount);

  const { submitFormStepHandler } = useSubmitFormStepHandler(stepCount);

  const goToPreviousStep = () =>
    setStepCount((stepCount) => Math.max(stepCount - 1, initialStepCount));

  const goToNextStep = () => {
    if (submitFormStepHandler) {
      (async () => await submitFormStepHandler())();
    } else {
      setStepCount((stepCount) => Math.min(stepCount + 1, formSteps.size()));
    }
  };

  const isFirstStep = stepCount === initialStepCount;

  return {
    stepCount,
    formSteps,
    isFirstStep,
    goToStep: setStepCount,
    goToNextStep,
    goToPreviousStep,
  };
}
