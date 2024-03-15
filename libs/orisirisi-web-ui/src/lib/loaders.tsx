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
