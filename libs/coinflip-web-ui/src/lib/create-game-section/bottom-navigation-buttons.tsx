import { PropsWithChildren } from 'react';
import { cn } from '@orisirisi/orisirisi-web-ui';

interface BottomNavigationBaseButtonProps extends PropsWithChildren {
  disabled?: boolean;
  active?: boolean;
  type?: 'submit' | 'button';
  onClick: () => void;
}

export interface BottomNavigationButtonProps
  extends BottomNavigationBaseButtonProps {
  isFirstStep: boolean;
  isCurrentFormStepDirty: boolean;
}

export function ContinueButton({
  isFirstStep,
  isCurrentFormStepDirty,
  ...remainingProps
}: BottomNavigationButtonProps) {
  if (!isFirstStep) return null;

  return (
    <BottomNavigationButton
      disabled={!isCurrentFormStepDirty}
      active
      {...remainingProps}
    >
      Continue
    </BottomNavigationButton>
  );
}

export function PreviousButton({
  isFirstStep,
  isCurrentFormStepDirty,
  ...remainingProps
}: BottomNavigationButtonProps) {
  if (isFirstStep) return null;
  return (
    <BottomNavigationButton {...remainingProps}>
      Previous
    </BottomNavigationButton>
  );
}

export function NextButton({
  isFirstStep,
  isCurrentFormStepDirty,
  ...remainingProps
}: BottomNavigationButtonProps) {
  if (isFirstStep) return null;

  return (
    <BottomNavigationButton active {...remainingProps}>
      Next
    </BottomNavigationButton>
  );
}

const activeBottomNavigationButtonClassName =
  'bg-white text-black hover:bg-slate-50 focus:outline-none focus:ring focus:ring-blue-200';

const inactiveBottomNavigationButtonClassName =
  'bg-transparent text-white hover:border-white hover:border-2 focus:outline-none focus:ring';

function BottomNavigationButton({
  active = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
}: BottomNavigationBaseButtonProps) {
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
