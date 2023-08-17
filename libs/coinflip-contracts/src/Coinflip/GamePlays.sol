// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract GamePlays {
  mapping(Game.ID gameID => mapping(Game.PlayID playID => Game.Play play)) plays;
  mapping(Game.ID gameID => mapping(Coin.Side coinSide => Game.Player[] player)) players;

  mapping(Game.ID gameID => Game.PlayID playCount) playCounts;
  mapping(Game.ID gameID => Game.PlayID maxPlayCount) maxPlayCounts;

  mapping(Game.ID gameID => mapping(Game.PlayID playID => bytes32 proofOfChance)) playProofs;
  mapping(Game.ID gameID => Game.PlayID playProofCount) playProofCounts;

  modifier mustAvoidAllGamePlayMatching(Game.ID gameID, Coin.Side coinSide) {
    uint16 playsLeft = Game.PlayID.unwrap(maxPlayCounts[gameID]) -
      Game.PlayID.unwrap(playCounts[gameID]);

    if (playsLeft == 1) {
      require(
        players[gameID][Coin.Side.Head].length > 0 &&
          players[gameID][Coin.Side.Head].length > 0,
        'At least one move must contain the opposite coin side'
      );
    }

    _;
  }

  function createGamePlay(
    Game.ID gameID,
    Coin.Side coinSide,
    bytes32 playHash
  ) public {
    Game.PlayID gamePlayID = playCounts[gameID];
    plays[gameID][gamePlayID] = Game.Play({
      player: Game.Player.wrap(msg.sender),
      coinSide: coinSide,
      proofOfChance: '',
      playHash: playHash
    });
    players[gameID][coinSide].push(Game.Player.wrap(msg.sender));
    playCounts[gameID] = Game.PlayID.wrap(
      Game.PlayID.unwrap(playCounts[gameID]) + 1
    );
  }

  function setMaxGamePlayCount(
    Game.ID gameID,
    uint16 maxGameMovesCount
  ) public {
    maxPlayCounts[gameID] = Game.PlayID.wrap(maxGameMovesCount);
  }
}

contract UsingGamePlays is GamePlays {}
