import { PropsWithChildren } from 'react';
import { cn } from '@orisirisi/orisirisi-web-ui';

interface BottomNavigationButtonProps extends PropsWithChildren {
  disabled?: boolean;
  active?: boolean;
  type?: 'submit' | 'button';
  onClick: () => void;
}

const activeBottomNavigationButtonClassName =
  'bg-white text-black hover:bg-slate-50 focus:outline-none focus:ring focus:ring-blue-200';

const inactiveBottomNavigationButtonClassName =
  'bg-transparent text-white hover:border-white hover:border-2 focus:outline-none focus:ring';

export function BottomNavigationButton({
  active = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
}: BottomNavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        'rounded-full px-12 py-4',
        active
          ? activeBottomNavigationButtonClassName
          : inactiveBottomNavigationButtonClassName,
        disabled && 'opacity-25'
      )}
    >
      {children}
    </button>
  );
}
