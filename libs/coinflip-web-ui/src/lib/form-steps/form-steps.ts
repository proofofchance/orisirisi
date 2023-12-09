import { ReactElement } from 'react';

export type StepCount = number;

class FormStep<Field> {
  constructor(
    public readonly stepCount: StepCount,
    public readonly fields: Field[],
    public readonly reactElement: ReactElement | null
  ) {}
}

export class FormSteps<Form> {
  private lastStepCount = 0;
  private value: Map<number, FormStep<keyof Form>> = new Map();

  addStep(fields: (keyof Form)[], reactElement: ReactElement | null) {
    this.value.set(
      this.lastStepCount,
      new FormStep(this.lastStepCount, fields, reactElement)
    );
    this.lastStepCount++;
    return this;
  }

  size = () => this.value.size;
  lastStep = () => this.size() - 1;
  getStep = (stepCount: number) => this.value.get(stepCount);
  getFields = (stepCount: number) => this.getStep(stepCount)!.fields;
  renderStep = (stepCount: number) => this.getStep(stepCount)!.reactElement;
}
