import { PropsWithChildren } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { cn } from '@orisirisi/orisirisi-web-ui';

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
  variant?: 'sm';
  className?: string;
  title?: string;
}

export function Modal(props: ModalProps) {
  const { show = false, close } = props;

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
        data-id="modal"
        className={cn(
          'bg-[#F4F5F7] absolute z-20 rounded-2xl px-8 py-6 text-[#181C25]',
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
