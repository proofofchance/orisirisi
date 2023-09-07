import {
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
} from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: ForwardedRef<HTMLInputElement | null>;
  preventSubmit?: boolean;
  onEnter?: (e?: KeyboardEvent<HTMLInputElement>) => void;
}

export const TextInput = forwardRef<HTMLInputElement | null, TextInputProps>(
  TextInputWithRef
);

function TextInputWithRef(
  { onEnter, preventSubmit, ...remainingProps }: TextInputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  return (
    <input
      type="text"
      onKeyDown={
        onEnter &&
        ((e) => {
          if (e.key === 'Enter') {
            onEnter(e);
            e.stopPropagation();
            e.preventDefault();
          }
        })
      }
      ref={ref}
      {...remainingProps}
    />
  );
}
