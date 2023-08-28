export class Result<V, E> {
  constructor(public readonly ok: V | null, public readonly error: E | null) {
    if (ok && error) {
      throw new Error('Ok and Error must be mutually exclusive');
    }
  }
}
