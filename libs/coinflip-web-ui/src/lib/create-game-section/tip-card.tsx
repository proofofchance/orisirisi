import { LightBulbIcon } from '@heroicons/react/24/solid';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { ReactNode } from 'react';

export function TipCard({
  tip,
  className,
}: { tip: string | ReactNode } & PropsWithClassName) {
  return (
    <div
      className={cn('flex w-[320px] md:w-[380px] justify-center', className)}
    >
      <div className="p-4 flex gap-4">
        <div>
          <LightBulbIcon className="w-8 h-8" />
        </div>
        <div className="text-left text-sm">
          <p>{tip}</p>
        </div>
      </div>
    </div>
  );
}
