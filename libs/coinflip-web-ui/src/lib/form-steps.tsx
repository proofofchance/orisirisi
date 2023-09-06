import { ReactElement, useState } from 'react';

class FormStep<Field> {
  constructor(
    public stepCount: number,
    public fields: Field[],
    public reactElement: ReactElement
  ) {}
}

class FormSteps<Form> {
  private lastStepCount = 0;
  private value: Map<number, FormStep<keyof Form>> = new Map();

  addStep(fields: (keyof Form)[], reactElement: ReactElement) {
    this.value.set(
      this.lastStepCount,
      new FormStep(this.lastStepCount, fields, reactElement)
    );
    this.lastStepCount++;
    return this;
  }

  size = () => this.value.size;
  getStep = (stepCount: number) => this.value.get(stepCount);
  getFields = (stepCount: number) => this.getStep(stepCount)!.fields;
  renderStep = (stepCount: number) => this.getStep(stepCount)!.reactElement;
}

interface Props {
  initialStepCount?: number;
}

export function useFormSteps<T>(props?: Props) {
  const formSteps = new FormSteps<T>();
  const initialStepCount = props?.initialStepCount ?? 0;
  const [stepCount, setStepCount] = useState(initialStepCount);

  const goToPreviousStep = () =>
    setStepCount((stepCount) => Math.max(stepCount - 1, initialStepCount));

  const goToNextStep = () =>
    setStepCount((stepCount) => Math.min(stepCount + 1, formSteps.size()));

  const isFirstStep = stepCount === initialStepCount;

  return {
    stepCount,
    formSteps,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
  };
}
