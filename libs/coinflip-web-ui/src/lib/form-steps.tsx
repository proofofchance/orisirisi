import { ReactElement, useState } from 'react';

class FormStep {
  constructor(public stepCount: number, public reactElement: ReactElement) {}
}

class FormSteps<T> {
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

  size = () => this.value.size;
  getStep = (stepCount: number) => this.value.get(stepCount);
  getField = (stepCount: number) =>
    this.getStep(stepCount)!.reactElement.props['field'] as keyof T;
  renderStep = (stepCount: number) => this.getStep(stepCount)!.reactElement;
}

interface Props {
  initialStepCount?: number;
}

export function useFormSteps(props?: Props) {
  const initialStepCount = props?.initialStepCount ?? 0;
  const formSteps = new FormSteps();
  const [stepCount, setStepCount] = useState(initialStepCount);

  const goToPreviousStep = () =>
    setStepCount((stepCount) => Math.max(stepCount - 1, initialStepCount));

  const goToNextStep = () =>
    setStepCount((stepCount) => Math.min(stepCount + 1, formSteps.size()));

  const isFirstStep = () => stepCount === initialStepCount;

  return {
    stepCount,
    formSteps,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
  };
}
