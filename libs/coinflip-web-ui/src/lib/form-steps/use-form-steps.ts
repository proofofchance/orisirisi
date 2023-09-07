import { useState } from 'react';
import { FormSteps } from './form-steps';
import { useGoToNextFormStepHandler } from './go-to-next-form-step-handlers';

interface Props {
  initialStepCount?: number;
}

export function useFormSteps<T>(props?: Props) {
  const formSteps = new FormSteps<T>();
  const initialStepCount = props?.initialStepCount ?? 0;
  const [stepCount, setStepCount] = useState(initialStepCount);

  const { goToNextFormStepHandler } = useGoToNextFormStepHandler(stepCount);

  const goToPreviousStep = () =>
    setStepCount((stepCount) => Math.max(stepCount - 1, initialStepCount));

  const goToNextStep = () => {
    if (goToNextFormStepHandler) {
      (async () => await goToNextFormStepHandler())();
    } else {
      setStepCount((stepCount) => Math.min(stepCount + 1, formSteps.size()));
    }
  };

  const isFirstStep = stepCount === initialStepCount;

  return {
    stepCount,
    formSteps,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
  };
}
