import { mustBeMutuallyExclusive } from '@orisirisi/orisirisi-data-utils';

export class Result<V, E> {
  constructor(public readonly ok: V | null, public readonly error: E | null) {
    mustBeMutuallyExclusive(ok, error);
  }

  isWithoutError = () => !this.hasError();
  hasError = () => !!this.error;
  isEmpty = () => this.ok === null;
}
