import { ReactElement, useState } from 'react';

class FormStep {
  constructor(public stepCount: number, public reactElement: ReactElement) {}
}

export class FormSteps<T> {
  private lastStepCount = 0;
  private value: Map<number, FormStep> = new Map();

  addStep(reactElement: ReactElement) {
    this.value.set(
      this.lastStepCount,
      new FormStep(this.lastStepCount, reactElement)
    );
    this.lastStepCount++;
    return this;
  }

  getStep = (stepCount: number) => this.value.get(stepCount);
  getField = (stepCount: number) =>
    this.getStep(stepCount)!.reactElement.props['field'] as keyof T;
  renderStep = (stepCount: number) => this.getStep(stepCount)!.reactElement;
}

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
