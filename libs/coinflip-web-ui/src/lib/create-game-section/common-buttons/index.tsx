import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';
import { DownArrowIcon, UpArrowIcon } from './icons';
import { ReactElement } from 'react';

export const UpArrowButton = ({ ...props }: ButtonProps) => {
  return (
    <ArrowButtonShell {...props}>
      <UpArrowIcon />
    </ArrowButtonShell>
  );
};

export const DownArrowButton = ({ ...props }: ButtonProps) => {
  return (
    <ArrowButtonShell {...props}>
      <DownArrowIcon />
    </ArrowButtonShell>
  );
};

export const ArrowButtonShell = ({ children, ...props }: ButtonProps) => (
  <button type="button" {...props}>
    <div className="w-[12.5px] h-[9px]">{children}</div>
  </button>
);

interface InsideFormShellButtonProps extends ButtonProps {
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactElement;
  label: string;
}

export function InsideFormShellButton({
  selected,
  disabled,
  icon,
  label,
  className,
  ...remainingProps
}: InsideFormShellButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full px-12 py-4 text-lg border-white border-2',
        selected && 'bg-white text-black',
        disabled && 'opacity-25',
        'hover:bg-white hover:text-black focus:outline-none focus:ring focus:ring-blue-200',
        className
      )}
      {...remainingProps}
    >
      <div className="flex justify-center items-center gap-2">
        <div>{icon}</div>
        <div>{label}</div>
      </div>
    </button>
  );
}
