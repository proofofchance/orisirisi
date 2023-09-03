export function mustBeMutuallyExclusive<A, B>(a: A, b: B) {
  if (a && b) {
    throw new Error('Mutually Exclusive Error');
  }
}

// Decimals
export const decimalRegex = (decimalSize: number) =>
  new RegExp(`^\\d+(\\.\\d{1,${decimalSize}})?$`);
export const isValidDecimal = (value: string, decimalSize: number) =>
  decimalRegex(decimalSize).test(value);

// Strings
export const isEmptyString = (value: string) => value === '';

export const countAllOccurrences = (
  inputString: string,
  charToCount: string
) => {
  let count = 0;

  for (let i = 0; i < inputString.length; i++) {
    if (inputString[i] === charToCount) {
      count++;
    }
  }

  return count;
};
