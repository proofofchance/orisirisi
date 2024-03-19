import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { ButtonProps, cn } from '@orisirisi/orisirisi-web-ui';

export function BackButton({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'px-2 py-1 border-white border-2 rounded-lg text-white hover:bg-white hover:text-black focus:outline-none',
        className
      )}
    >
      <ChevronLeftIcon className="h-6" />
    </button>
  );
}

export function BackButtonNoBorder({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'rounded-lg text-white flex items-center hover:text-black focus:outline-none',
        className
      )}
    >
      <ChevronLeftIcon className="h-4" />
    </button>
  );
}
