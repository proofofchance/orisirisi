import { ButtonProps } from '@orisirisi/orisirisi-web-ui';
import { ReactNode } from 'react';

export function MainButton({
  onClick,
  icon,
  label,
}: ButtonProps & { icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent text-white hover:bg-white hover:text-black fill-current focus:outline-none border-[1px] border-white w-24 h-24 flex justify-center items-center rounded-full shadow-md"
    >
      <span className="flex flex-col gap-1 justify-center items-center">
        {icon}
        <span className="text-[10px]">{label}</span>
      </span>
    </button>
  );
}
