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

export const isValidInteger = (value: string) =>
  Number.isInteger(parseInt(value, 10));

export function getRandomInteger(max: number) {
  return Math.floor(Math.random() * max);
}

// Strings
export const isEmptyString = (value: string) => value === '';
const whiteSpaceRegex = /(\s+)/;
const isWhiteSpace = (value: string) => whiteSpaceRegex.test(value);
const isNotWhiteSpace = (value: string) => !isWhiteSpace(value);
const extractWordsAsArray = (value: string) =>
  value.split(whiteSpaceRegex).filter(isNotWhiteSpace);
export const countWords = (value?: string) =>
  value ? extractWordsAsArray(value).length : 0;

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

export type Maybe<T> = T | null | undefined;

export const currentTimeInSeconds = () =>
  Math.round(new Date().getTime() / 1000);
export const hoursToSeconds = (hours: number) => hours * 60 * 60;
export const daysToSeconds = (days: number) => days * 24 * 60 * 60;
