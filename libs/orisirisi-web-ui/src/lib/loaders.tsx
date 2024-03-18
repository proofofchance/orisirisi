import { cn } from './cn';
import { PropsWithClassName } from './types';

export function Loader({
  loadingText = 'Loading...',
}: {
  loadingText?: string;
}) {
  return (
    <div className="text-slate-200 flex flex-col items-center mt-40">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-slate-200"></div>
      <div className="mt-4">{loadingText}</div>
    </div>
  );
}

export function SmallLoadingSpinner({
  className,
  loadingText = 'Loading...',
}: {
  loadingText?: string;
} & PropsWithClassName) {
  return (
    <div className={cn('text-slate-200 flex flex-col items-center', className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-200"></div>
      <div className="mt-2 text-sm">{loadingText}</div>
    </div>
  );
}
