import { PropsWithChildren } from 'react';
import { Provider as JotaiProvider } from 'jotai';

export function Provider({ children }: PropsWithChildren) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
