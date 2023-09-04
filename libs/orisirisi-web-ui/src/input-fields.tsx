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

const ALLOWED_NUMBER_OF_DECIMALS = 50;

type Props = InputHTMLAttributes<HTMLInputElement>;

function DecimalInputWithRefs(
  { onChange, ...remainingProps }: Props,
  inputRef: ForwardedRef<HTMLInputElement | null>
) {
  const [cachedInput, cacheInput] = useState('');

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const attemptedInput = event.target.value;
    const input = isValidInput(attemptedInput) ? attemptedInput : cachedInput;
    cacheInput(input);
    event.target.value = input;
    onChange?.(event);
  };

  const isValidInput = (input: string) =>
    isEmptyString(input) ||
    isIncompleteInput(input) ||
    isValidDecimal(input, ALLOWED_NUMBER_OF_DECIMALS);

  const isIncompleteInput = (input: string) =>
    input.endsWith('.') && countAllOccurrences(input, '.') === 1;

  return (
    <input
      type="text"
      onChange={handleOnChange}
      ref={inputRef}
      {...remainingProps}
    />
  );
}

export const DecimalInput = forwardRef<HTMLInputElement | null, Props>(
  DecimalInputWithRefs
);
