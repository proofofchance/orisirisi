import { PropsWithChildren, ReactElement } from 'react';

interface Props extends PropsWithChildren {
  title: string;
  tip?: ReactElement | string;
}

export function FormSectionShell({ title, tip, children }: Props) {
  return (
    <section className="text-center text-white">
      <h2 className="mt-8 font-bold text-[28px] tracking-wide">{title}</h2>
      {tip && (
        <p className="mt-2 tracking-tight text-sm max-w-[600px] m-auto">
          {tip}
        </p>
      )}
      <div className="flex justify-center">
        <div>{children}</div>
      </div>
    </section>
  );
}
