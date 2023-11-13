import {
  ChangeEvent,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
  useState,
} from 'react';
import { isEmptyString, isValidInteger } from '@orisirisi/orisirisi-data-utils';
import { TextInput, TextInputProps } from './text-input';

const isValidInputAttempt = (input: string, max = 10 ** 200) =>
  isEmptyString(input) || (isValidInteger(input) && parseInt(input, 10) <= max);

export const isValidIntegerInput = (input: string) =>
  isValidInteger(input) && !isEmptyString(input);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    TextInputProps {
  max?: number;
}

export const IntegerInput = forwardRef<HTMLInputElement | null, InputProps>(
  IntegerInputWithRef
);

function IntegerInputWithRef(
  { onChange, max, ...remainingProps }: InputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  const [cachedAttemptedInput, cacheAttemptedInput] = useState('');

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const attemptedInput = event.target.value;
    const input = isValidInputAttempt(attemptedInput, max)
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
