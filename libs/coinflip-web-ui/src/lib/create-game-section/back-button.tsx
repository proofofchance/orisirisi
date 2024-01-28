import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { ButtonProps } from '@orisirisi/orisirisi-web-ui';

export function BackButton({ ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="mt-6 px-2 py-1 border-white border-2 rounded-lg text-white hover:bg-white hover:text-black focus:outline-none"
    >
      <ChevronLeftIcon className="h-6" />
    </button>
  );
}
