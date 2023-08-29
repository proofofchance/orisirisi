import { cn } from '@orisirisi/orisirisi-web-ui';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'bg-[#393B5E] text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
