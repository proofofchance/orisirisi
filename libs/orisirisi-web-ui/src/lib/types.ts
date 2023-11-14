import { ButtonHTMLAttributes } from 'react';

export interface PropsWithClassName {
  className?: string;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
