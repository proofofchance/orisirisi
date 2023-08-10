import styled from 'styled-components';
import {
  Address,
  Chain,
  CoinSide,
  CoinToss,
  Player,
} from '@orisirisi/cointoss';

const StyledPage = styled.div`
  .page {
  }
`;

export function Index() {
  const game = new CoinToss(2, Chain.Ethereum);

  // player 1
  const player1 = new Player(
    new Address('0xCc0Ef91f1a30119B84bb0b948B89C94D304EcFD1', Chain.Ethereum)
  );
  const player1Secret = 'some-ssecret';
  const player1Move = game.play(player1, CoinSide.Head, player1Secret);

  // player 2
  const player2 = new Player(
    new Address('0x48741b30F519E75E1e51146c38f3E9a5E7F08ea1', Chain.Ethereum)
  );
  const player2Secret = 'some-other-secret';
  const player2Move = game.play(player2, CoinSide.Tail, player2Secret);

  // Proof period
  const gameWithResult = game
    .proveMove(player1Move, player1Secret)
    .proveMove(player2Move, player2Secret)
    .withResult();

  // console.log({ gameWithResult });

  console.log('Winners: ', gameWithResult.getWinners());
  console.log('Losers: ', gameWithResult.getLosers());

  return <StyledPage></StyledPage>;
}

export default Index;