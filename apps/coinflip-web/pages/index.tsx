import styled from 'styled-components';
import {
  Address,
  Chain,
  CoinSide,
  CoinFlip,
  Player,
} from '@orisirisi/coinflip';
import { useEffect } from 'react';
import { Background } from '@orisirisi/coinflip-web-ui';

const StyledPage = styled.div`
  .page {
  }
`;

export function Index() {
  useEffect(() => {
    const game = new CoinFlip(2, Chain.Ethereum);

    // player 1
    const player1 = new Player(
      new Address('0xCc0Ef91f1a30119B84bb0b948B89C94D304EcFD1', Chain.Ethereum)
    );
    const player1Move = game.play(player1, CoinSide.Head);

    // player 2
    const player2 = new Player(
      new Address('0x48741b30F519E75E1e51146c38f3E9a5E7F08ea1', Chain.Ethereum)
    );
    const player2Move = game.play(player2, CoinSide.Tail);

    // Proof period
    const gameWithResult = game
      .revealMove(player1Move)
      .revealMove(player2Move)
      .withResult();

    console.log({ gameWithResult });

    console.log('Winners: ', gameWithResult.getWinners());
    console.log('Losers: ', gameWithResult.getLosers());
  }, []);

  return (
    <StyledPage>
      <Background />
    </StyledPage>
  );
}

export default Index;
