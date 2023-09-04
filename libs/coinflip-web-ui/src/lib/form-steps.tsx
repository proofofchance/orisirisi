import { useState } from 'react';

interface Props {
  initialStepCount?: number;
  maxStepCount: number;
}
export function useFormSteps({ initialStepCount = 0, maxStepCount }: Props) {
  const [stepCount, setStepCount] = useState(initialStepCount);

  const goToPreviousStep = () =>
    setStepCount((stepCount) => Math.max(stepCount - 1, initialStepCount));

  const goToNextStep = () =>
    setStepCount((stepCount) => Math.min(stepCount + 1, maxStepCount));

  const isFirstStep = () => stepCount === initialStepCount;

  return {
    stepCount,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
  };
}
