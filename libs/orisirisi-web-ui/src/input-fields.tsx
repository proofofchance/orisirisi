import {
  countAllOccurrences,
  isEmptyString,
  isValidDecimal,
} from '@orisirisi/orisirisi-data-utils';
import { ChangeEvent, InputHTMLAttributes, useRef, useState } from 'react';

const ALLOWED_NUMBER_OF_DECIMALS = 50;

export function DecimalInput({
  onChange,
  ...remainingProps
}: InputHTMLAttributes<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
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
