import { cva } from 'class-variance-authority';

export const buttonClassName = cva(
  ['font-semibold', 'border', 'rounded-md', 'shadow-md'],
  {
    variants: {
      intent: {
        primary: [
          'bg-[#2969FF]',
          'text-white',
          'hover:bg-blue-600',
          'focus:outline-none',
          'focus:ring',
          'focus:ring-blue-200',
        ],
        secondary: [
          'bg-white',
          'text-gray-800',
          'border-gray-400',
          'hover:bg-gray-100',
        ],
      },
      size: {
        normal: ['text-sm', 'px-4', 'py-1'],
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'normal',
    },
  }
);
