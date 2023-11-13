import {
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
} from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: ForwardedRef<HTMLInputElement | null>;
  preventSubmit?: boolean;
  onEnter?: (e?: KeyboardEvent<HTMLInputElement>) => void;
  onEnterDoNothing?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement | null, TextInputProps>(
  TextInputWithRef
);

function TextInputWithRef(
  {
    onEnter,
    onEnterDoNothing,
    preventSubmit,
    ...remainingProps
  }: TextInputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) {
  const buildOnKeyDown = () => {
    if (onEnterDoNothing) {
      return (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          e.preventDefault();
        }
      };
    }

    if (onEnter) {
      return (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          onEnter(e);
          e.stopPropagation();
          e.preventDefault();
        }
      };
    }
  };

  return (
    <input
      type="text"
      onKeyDown={buildOnKeyDown()}
      ref={ref}
      {...remainingProps}
    />
  );
}
