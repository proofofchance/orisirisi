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

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  onEnter: () => void;
}

function DecimalInputWithRefs(
  { onEnter, onChange, ...remainingProps }: Props,
  inputRef: ForwardedRef<HTMLInputElement | null>
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
    <input
      type="text"
      onKeyUp={(e) => e.key === 'Enter' && onEnter()}
      onChange={handleOnChange}
      ref={inputRef}
      autoComplete="off"
      autoCorrect="off"
      {...remainingProps}
    />
  );
}

export const DecimalInput = forwardRef<HTMLInputElement | null, Props>(
  DecimalInputWithRefs
);
