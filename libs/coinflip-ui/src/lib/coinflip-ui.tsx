import styled from 'styled-components';

/* eslint-disable-next-line */
export interface CoinflipUiProps {}

const StyledCoinflipUi = styled.div`
  color: pink;
`;

export function CoinflipUi(props: CoinflipUiProps) {
  return (
    <StyledCoinflipUi>
      <h1>Welcome to CoinflipUi!</h1>
    </StyledCoinflipUi>
  );
}

export default CoinflipUi;
