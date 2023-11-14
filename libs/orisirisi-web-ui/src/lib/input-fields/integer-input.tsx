import {
  ChangeEvent,
  ForwardedRef,
  InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react';
import { isEmptyString, isValidInteger } from '@orisirisi/orisirisi-data-utils';
import { TextInput, TextInputProps } from './text-input';

export const isValidInputAttempt = (input: string) =>
  isEmptyString(input) || isValidInteger(input);

export const isValidIntegerInput = (input: string) =>
  isValidInteger(input) && !isEmptyString(input);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    TextInputProps {
  defaultValue?: string;
  max?: number;
}

export const IntegerInput = forwardRef<HTMLInputElement | null, InputProps>(
  IntegerInputWithRef
);

function IntegerInputWithRef(
  { onChange, max, defaultValue, ...remainingProps }: InputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  const [cachedAttemptedInput, cacheAttemptedInput] = useState(
    defaultValue ?? ''
  );

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
