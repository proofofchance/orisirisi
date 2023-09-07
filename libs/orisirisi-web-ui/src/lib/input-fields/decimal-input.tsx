import {
  ChangeEvent,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
  useState,
} from 'react';
import {
  countAllOccurrences,
  isEmptyString,
  isValidDecimal,
} from '@orisirisi/orisirisi-data-utils';
import { TextInput } from './text-input';

const DECIMAL_SIZE = 50;

const isValidInputAttempt = (input: string) =>
  isEmptyString(input) ||
  isIncompleteInput(input) ||
  isValidDecimal(input, DECIMAL_SIZE);

const isIncompleteInput = (input: string) =>
  input.endsWith('.') && countAllOccurrences(input, '.') === 1;

export const isValidDecimalInput = (input: string) =>
  isValidDecimal(input, DECIMAL_SIZE) &&
  !(isEmptyString(input) && isIncompleteInput(input));

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: ForwardedRef<HTMLInputElement | null>;
  preventSubmit?: boolean;
  onEnter?: (e?: KeyboardEvent<HTMLInputElement>) => void;
}

export const DecimalInput = forwardRef<HTMLInputElement | null, InputProps>(
  DecimalInputWithRef
);

function DecimalInputWithRef(
  { onChange, ...remainingProps }: InputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  const [cachedAttemptedInput, cacheAttemptedInput] = useState('');

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const attemptedInput = event.target.value;
    const input = isValidInputAttempt(attemptedInput)
      ? attemptedInput
      : cachedAttemptedInput;
    cacheAttemptedInput(input);
    event.target.value = input;
    onChange?.(event);
  };

  return (
    <TextInput
      onChange={handleOnChange}
      ref={ref}
      autoComplete="off"
      autoCorrect="off"
      {...remainingProps}
    />
  );
}
