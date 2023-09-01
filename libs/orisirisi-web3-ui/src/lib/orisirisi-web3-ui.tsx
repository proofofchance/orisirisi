import styled from 'styled-components';

/* eslint-disable-next-line */
export interface OrisirisiWeb3UiProps {}

const StyledOrisirisiWeb3Ui = styled.div`
  color: pink;
`;

export function OrisirisiWeb3Ui(props: OrisirisiWeb3UiProps) {
  return (
    <StyledOrisirisiWeb3Ui>
      <h1>Welcome to OrisirisiWeb3Ui!</h1>
    </StyledOrisirisiWeb3Ui>
  );
}

export default OrisirisiWeb3Ui;
