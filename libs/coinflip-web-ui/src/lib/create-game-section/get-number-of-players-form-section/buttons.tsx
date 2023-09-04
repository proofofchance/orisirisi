import { ButtonProps } from '@orisirisi/orisirisi-web-ui';
import { DownArrowIcon, UpArrowIcon } from './icons';

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
  <button {...props}>
    <div className="w-[12.5px] h-[9px]">{children}</div>
  </button>
);
