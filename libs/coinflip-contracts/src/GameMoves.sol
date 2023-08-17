// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import './Coin.sol';

library GameMoves {
  type Player is address;

  struct GameMove {
    Player player;
    Coin.Side coinSide;
    bytes32 proofOfChance;
    bytes32 moveHash;
  }

  function newMove(
    Coin.Side coinSide,
    bytes32 moveHash
  ) internal view returns (GameMove memory) {
    return
      GameMove({
        player: Player.wrap(msg.sender),
        coinSide: coinSide,
        proofOfChance: '',
        moveHash: moveHash
      });
  }

  function isRevealed(GameMove memory gameMove) internal pure returns (bool) {
    return gameMove.proofOfChance.length != 0;
  }
}
