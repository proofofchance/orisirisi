import styled from 'styled-components';

/* eslint-disable-next-line */
export interface OrisirisiUiProps {}

const StyledOrisirisiUi = styled.div`
  color: pink;
`;

export function OrisirisiUi(props: OrisirisiUiProps) {
  return (
    <StyledOrisirisiUi>
      <h1>Welcome to OrisirisiUi!</h1>
    </StyledOrisirisiUi>
  );
}

export default OrisirisiUi;
