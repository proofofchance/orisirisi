import { ButtonHTMLAttributes } from 'react';

export interface WithClassName {
  className?: string;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
