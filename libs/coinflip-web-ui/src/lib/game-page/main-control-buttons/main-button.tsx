import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';
import { ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

export function MainButton({
  onClick,
  disabled = false,
  disabledReason,
  icon,
  label,
}: ButtonProps & {
  disabled?: boolean;
  disabledReason?: string;
  icon: ReactNode;
  label: string;
}) {
  const tooltipId = `${label}-main-button-disabled-tooltip`;

  return (
    <>
      {disabled && <Tooltip id={tooltipId} />}
      <button
        onClick={(e) => !disabled && onClick?.(e)}
        className={cn(
          'bg-transparent text-white hover:bg-white hover:text-black fill-current focus:outline-none border-[1px] border-white w-24 h-24 flex justify-center items-center rounded-full shadow-md',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        data-tooltip-id={tooltipId}
        data-tooltip-content={disabledReason}
      >
        <span className="flex flex-col gap-1 justify-center items-center">
          {icon}
          <span className="text-[10px]">{label}</span>
        </span>
      </button>
    </>
  );
}
