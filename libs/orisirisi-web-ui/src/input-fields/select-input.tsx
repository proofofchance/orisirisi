import { ForwardedRef, SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  display: string;
  value: string;
}
interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export const SelectInput = forwardRef<
  HTMLSelectElement | null,
  SelectInputProps
>(SelectInputWithRef);

export function SelectInputWithRef(
  { options, ...remainingProps }: SelectInputProps,
  ref: ForwardedRef<HTMLSelectElement | null>
) {
  return (
    <select {...remainingProps} ref={ref}>
      {options.map(({ display, value }, i) => (
        <option key={i} value={value}>
          {display}
        </option>
      ))}
    </select>
  );
}
