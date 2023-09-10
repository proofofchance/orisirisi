import { useState } from 'react';
import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';

interface BottomNavigationBaseButtonProps extends ButtonProps {
  disabled?: boolean;
  active?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export interface BottomNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isCurrentFormStepDirty: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isCurrentFormStepValid: () => Promise<boolean>;
}

export function BottomNavigationButtons({
  isCurrentFormStepValid,
  goToNextStep,
  goToPreviousStep,
  isFirstStep,
  isLastStep,
  isCurrentFormStepDirty,
  ...remainingProps
}: BottomNavigationButtonsProps) {
  const [lastHovered, setLastHovered] = useState<'previous' | 'next'>('next');

  const isLastHoveredPreviousButton = lastHovered === 'previous';
  const isLastHoveredNextButton = lastHovered === 'next';

  const showPrevAndNext = !isFirstStep && !isLastStep;

  return (
    <>
      {isFirstStep && (
        <BottomNavigationButton
          disabled={!isCurrentFormStepDirty}
          onClick={async () =>
            (await isCurrentFormStepValid()) && goToNextStep()
          }
          active
          {...remainingProps}
        >
          Continue
        </BottomNavigationButton>
      )}

      {showPrevAndNext && (
        <BottomNavigationButton
          active={isLastHoveredPreviousButton}
          onMouseEnter={() =>
            isLastHoveredNextButton && setLastHovered('previous')
          }
          onClick={goToPreviousStep}
          {...remainingProps}
        >
          Previous
        </BottomNavigationButton>
      )}

      {showPrevAndNext && (
        <BottomNavigationButton
          active={isLastHoveredNextButton}
          onMouseEnter={() =>
            isLastHoveredPreviousButton && setLastHovered('next')
          }
          onClick={async () =>
            (await isCurrentFormStepValid()) && goToNextStep()
          }
          {...remainingProps}
        >
          Next
        </BottomNavigationButton>
      )}

      {isLastStep && (
        <BottomNavigationButton type="submit" {...remainingProps} active>
          Submit
        </BottomNavigationButton>
      )}
    </>
  );
}

const activeBottomNavigationButtonClassName =
  'bg-white hover:bg-slate-100 text-black focus:outline-none focus:ring focus:ring-blue-200';

const inactiveBottomNavigationButtonClassName =
  'bg-transparent text-white focus:outline-none';

function BottomNavigationButton({
  active = false,
  disabled = false,
  type = 'button',
  children,
  ...remainingProps
}: BottomNavigationBaseButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-full px-12 py-4',
        'transition duration-75 ease-in-out',
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
