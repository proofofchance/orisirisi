import { ButtonHTMLAttributes } from 'react';
import { cn } from '@orisirisi/orisirisi-web-ui';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  className,
  ...remainingProps
}: ButtonProps) {
  return (
    <button
      className={cn(
        'bg-[#393B5E] text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200',
        className
      )}
      {...remainingProps}
    >
      {children}
    </button>
  );
}

export default Button;
