import { XMarkIcon } from '@heroicons/react/24/solid';
import { cn } from '@orisirisi/orisirisi-web-ui';
import { PropsWithChildren } from 'react';

export interface ModalContext {
  show?: boolean;
  close: () => void;
}

export const defaultModalContext = {
  show: false,
  close: () => null,
};

interface ModalProps extends ModalContext, PropsWithChildren {
  overlayClassName?: string;
  variant?: 'sm' | 'lg';
  className?: string;
  title?: string;
}

export function Modal(props: ModalProps) {
  const { show = false, close, variant = 'lg' } = props;

  if (!show) return null;

  return (
    <>
      <div
        onClick={close}
        className={cn(
          'w-[100vw] h-[100vh] absolute top-0 left-0 z-10 bg-slate-900 opacity-40 cursor-pointer',
          props.overlayClassName
        )}
      ></div>
      <div
        className={cn(
          'bg-[#F4F5F7] absolute z-20 top-[10vh]  rounded-2xl px-8 py-6 text-[#181C25]',
          variant === 'lg' && 'lg:w-[44vw] w-[80vw] lg:left-[28vw] left-[10vw]',
          variant === 'sm' && 'lg:w-[44vw] w-[40vw] lg:left-[28vw] left-[30vw]',
          props.className
        )}
      >
        <div className="flex justify-between">
          <h4 className="font-bold letter-spacing">{props.title}</h4>
          <span
            onClick={close}
            className="'p-1 cursor-pointer hover:bg-slate-200 rounded-md'"
          >
            <XMarkIcon className="h-5" />
          </span>
        </div>
        {props.children}
      </div>
    </>
  );
}
