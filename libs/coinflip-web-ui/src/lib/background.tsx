import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const BackgroundColor = `
  background: rgb(152, 77, 56);
  background: linear-gradient(
    90deg,
    rgba(152, 77, 56, 1) 0%,
    rgba(152, 77, 56, 1) 28%,
    rgba(24, 30, 65, 1) 82%
  );
`;
export const BackgroundWrapperForNav = styled.nav`
  ${BackgroundColor}
`;

export const BackgroundWrapperForDiv = styled.div`
  ${BackgroundColor}
`;

export function Background({ children }: PropsWithChildren) {
  return (
    <BackgroundWrapperForDiv className="bg-[#50d71e] bg-cover bg-center h-screen">
      {children}
    </BackgroundWrapperForDiv>
  );
}
