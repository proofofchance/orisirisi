import { XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@orisirisi/orisirisi-web-ui';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  message: string;
}

export function ErrorMessageParagraph({
  message,
  className,
  ...remainingProps
}: Props) {
  return (
    <div
      className={cn('flex gap-2 items-center', className)}
      {...remainingProps}
    >
      <div>
        <XCircleIcon className="h-4" color="red" />
      </div>
      <div>{message}</div>
    </div>
  );
}
