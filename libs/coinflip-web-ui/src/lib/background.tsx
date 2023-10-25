import { WithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';

export const BackgroundWrapper = styled.div`
  background: rgb(152, 77, 56);
  background: linear-gradient(
    90deg,
    rgba(152, 77, 56, 1) 0%,
    rgba(152, 77, 56, 1) 28%,
    rgba(24, 30, 65, 1) 82%
  );
`;

export function Background({
  children,
  className,
}: PropsWithChildren & WithClassName) {
  return (
    <BackgroundWrapper
      className={cn(
        'bg-[#50d71e] bg-cover bg-center min-h-screen overflow-auto',
        className
      )}
    >
      {children}
    </BackgroundWrapper>
  );
}
