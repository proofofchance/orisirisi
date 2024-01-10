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

export const integerRegex = /^-?\d+$/;
export const isValidInteger = (value: string) => integerRegex.test(value);
export const parseInteger = (value: string | number) =>
  value ? parseInt(`${value}`, 10) : null;

export function getRandomInteger(max: number, minimum = 0) {
  return minimum + Math.floor(Math.random() * max);
}

export function getDivisionAndRemainder(
  value: number,
  divisor: number
): [number, number] {
  const division = Math.floor(value / divisor);
  const remainder = value % divisor;

  return [division, remainder];
}

// Strings
export const isEmptyString = (value: string) => value === '';
const whiteSpaceRegex = /(\s+)/;
const isWhiteSpace = (value: string) => whiteSpaceRegex.test(value);
const isNotWhiteSpace = (value: string) => !isWhiteSpace(value);
const asciiStringRegex = /^[ -~]+$/;
export const isAsciiString = (value: string) => asciiStringRegex.test(value);

const extractWordsAsArray = (value: string) =>
  value.split(whiteSpaceRegex).filter(isNotWhiteSpace);
export const countWords = (value?: string) =>
  value ? extractWordsAsArray(value).length : 0;
export const countCharacters = (value?: string) => (value ? value.length : 0);

export const getLastFromArray = <T>(array: T[]) => array[array.length - 1];

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

export const aMinute = 60;
export const anHour = 60 * aMinute;
export const aDay = 24 * anHour;

export const currentTimeInSeconds = () =>
  Math.round(new Date().getTime() / 1000);
export const hoursToSeconds = (hours: number) => hours * 60 * 60;
export const daysToSeconds = (days: number) => days * 24 * 60 * 60;

export class Countdown {
  constructor(
    public daysLeft: number,
    public hoursLeft: number,
    public minutesLeft: number,
    public secondsLeft: number
  ) {}

  static getNext(untilTimestampMs: number): Countdown {
    const now = new Date().getTime();
    const timeLeftInSecs = Math.floor(
      Math.max(untilTimestampMs - now, 0) / 1000
    );

    const [daysLeft, hoursAndMinutesAndSecondsLeft] = getDivisionAndRemainder(
      timeLeftInSecs,
      aDay
    );
    const [hoursLeft, minutesAndSecondsLeft] = getDivisionAndRemainder(
      hoursAndMinutesAndSecondsLeft,
      anHour
    );
    const [minutesLeft, secondsLeft] = getDivisionAndRemainder(
      minutesAndSecondsLeft,
      aMinute
    );

    return new Countdown(daysLeft, hoursLeft, minutesLeft, secondsLeft);
  }

  isFinished = () =>
    this.daysLeft === 0 &&
    this.hoursLeft === 0 &&
    this.minutesLeft === 0 &&
    this.secondsLeft === 0;
}

export const getRandomHexColor = (): `#${string}` => {
  // Generate a random number between 0 and 16777215 (FFFFFF in hexadecimal)
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  // Pad the color with zeros to ensure it has six digits
  return `#${randomColor.padStart(6, '0')}`;
};

export const pickRandom = <T>(values: T[]) => {
  const randomIndex = getRandomInteger(values.length - 1);
  return values[randomIndex];
};
