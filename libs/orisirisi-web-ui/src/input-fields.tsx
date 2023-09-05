import {
  countAllOccurrences,
  isEmptyString,
  isValidDecimal,
} from '@orisirisi/orisirisi-data-utils';
import {
  ChangeEvent,
  ForwardedRef,
  InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react';

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
  onEnter?: () => void;
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

export const TextInput = forwardRef<HTMLInputElement | null, InputProps>(
  TextInputWithRef
);

function TextInputWithRef(
  { onEnter, ...remainingProps }: InputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  return (
    <input
      type="text"
      onKeyUp={onEnter && ((e) => e.key === 'Enter' && onEnter())}
      ref={ref}
      {...remainingProps}
    />
  );
}
