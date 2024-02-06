import { mustBeMutuallyExclusive } from '@orisirisi/orisirisi-data-utils';

export class Result<V, E> {
  constructor(public readonly ok: V | null, public readonly error: E | null) {
    mustBeMutuallyExclusive(ok, error);
  }

  isOk = () => !this.hasError();
  hasError = () => !!this.error;
}
