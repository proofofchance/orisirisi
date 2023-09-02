export function mustBeMutuallyExclusive<A, B>(a: A, b: B) {
  if (a && b) {
    throw new Error('Mutually Exclusive Error');
  }
}
