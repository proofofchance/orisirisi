import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  title: string;
}

export function FormSectionShell({ title, children }: Props) {
  return (
    <section className="text-center text-white">
      <h2 className="mt-8 font-bold text-[28px] tracking-wide">{title}</h2>
      <div className="flex justify-center">
        <div>{children}</div>
      </div>
    </section>
  );
}
