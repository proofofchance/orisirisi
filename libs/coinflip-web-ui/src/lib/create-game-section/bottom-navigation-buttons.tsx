import { PropsWithChildren } from 'react';
import { cn } from '@orisirisi/orisirisi-web-ui';

export function ContinueButton() {
  return <BottomNavigationButton active>Continue</BottomNavigationButton>;
}

interface BottomNavigationButtonProps extends PropsWithChildren {
  active?: boolean;
}

const activeBottomNavigationButtonClassName =
  'bg-white text-black hover:bg-slate-50 focus:outline-none focus:ring focus:ring-blue-200';

const inactiveBottomNavigationButtonClassName =
  'bg-transparent text-white hover:border-white hover:border-2 focus:outline-none focus:ring';

function BottomNavigationButton({
  active = false,
  children,
}: BottomNavigationButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full px-12 py-4',
        active
          ? activeBottomNavigationButtonClassName
          : inactiveBottomNavigationButtonClassName
      )}
    >
      {children}
    </button>
  );
}
