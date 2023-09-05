import { SelectHTMLAttributes } from 'react';

interface SelectInput extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export function SelectInput({ options, ...remainingProps }: SelectInput) {
  return (
    <select {...remainingProps}>
      {options.map((option, i) => (
        <option key={i}>{option}</option>
      ))}
    </select>
  );
}
