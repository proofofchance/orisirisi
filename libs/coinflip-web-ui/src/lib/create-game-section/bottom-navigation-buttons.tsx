import { useState } from 'react';
import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';

interface BottomNavigationBaseButtonProps extends ButtonProps {
  disabled?: boolean;
  active?: boolean;
  type?: 'submit' | 'button';
  onClick: () => void;
}

interface BottomNavigationButtonProps extends BottomNavigationBaseButtonProps {
  isFirstStep: boolean;
  isCurrentFormStepDirty: boolean;
}

export interface BottomNavigationButtonsProps {
  isFirstStep: boolean;
  isCurrentFormStepDirty: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isCurrentFormStepValid: () => Promise<boolean>;
}

export function BottomNavigationButtons({
  isCurrentFormStepValid,
  goToNextStep,
  goToPreviousStep,
  ...remainingProps
}: BottomNavigationButtonsProps) {
  const [lastHovered, setLastHovered] = useState<'previous' | 'next'>('next');

  const isLastHoveredPreviousButton = lastHovered === 'previous';
  const isLastHoveredNextButton = lastHovered === 'next';

  return (
    <>
      <ContinueButton
        onClick={async () => (await isCurrentFormStepValid()) && goToNextStep()}
        {...remainingProps}
      />

      <PreviousButton
        active={isLastHoveredPreviousButton}
        onMouseEnter={() =>
          isLastHoveredNextButton && setLastHovered('previous')
        }
        onClick={async () =>
          (await isCurrentFormStepValid()) && goToPreviousStep()
        }
        {...remainingProps}
      />

      <NextButton
        active={isLastHoveredNextButton}
        onMouseEnter={() =>
          isLastHoveredPreviousButton && setLastHovered('next')
        }
        onClick={async () => (await isCurrentFormStepValid()) && goToNextStep()}
        {...remainingProps}
      />
    </>
  );
}

function ContinueButton({
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

function PreviousButton({
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

function NextButton({
  isFirstStep,
  isCurrentFormStepDirty,
  ...remainingProps
}: BottomNavigationButtonProps) {
  if (isFirstStep) return null;

  return (
    <BottomNavigationButton {...remainingProps}>Next</BottomNavigationButton>
  );
}

const activeBottomNavigationButtonClassName =
  'bg-white text-black hover:bg-slate-50 focus:outline-none focus:ring focus:ring-blue-200';

const inactiveBottomNavigationButtonClassName =
  'bg-transparent text-white focus:outline-none focus:ring';

function BottomNavigationButton({
  active = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  ...remainingProps
}: BottomNavigationBaseButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        'rounded-full px-12 py-4',
        'transition duration-500 ease-in-out',
        active
          ? activeBottomNavigationButtonClassName
          : inactiveBottomNavigationButtonClassName,
        disabled && 'opacity-25'
      )}
      {...remainingProps}
    >
      {children}
    </button>
  );
}
