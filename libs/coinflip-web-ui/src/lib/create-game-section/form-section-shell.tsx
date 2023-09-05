import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  title: string;
}

export function FormSectionShell({ title, children }: Props) {
  return (
    <section className="text-center text-white">
      <h2 className="mt-10 font-bold text-[28px] tracking-wide">{title}</h2>
      <div className="flex justify-center">
        <div className="w-[600px">{children}</div>
      </div>
    </section>
  );
}
