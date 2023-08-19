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

  modifier mustAvoidGameWithMaxedOutPlays(Game.ID gameID) {
    require(
      Game.PlayID.unwrap(playCounts[gameID]) <=
        Game.PlayID.unwrap(maxPlayCounts[gameID]),
      'Game can no longer take new plays'
    );

    _;
  }

  modifier mustAvoidAllGamePlaysMatching(Game.ID gameID, Coin.Side coinSide) {
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
  ) internal {
    Game.PlayID gamePlayID = playCounts[gameID];
    Game.Player player = Game.Player.wrap(msg.sender);

    plays[gameID][gamePlayID] = Game.Play({
      player: player,
      coinSide: coinSide,
      proofOfChance: '',
      playHash: playHash
    });
    players[gameID][coinSide].push(player);
    playCounts[gameID] = Game.PlayID.wrap(
      Game.PlayID.unwrap(playCounts[gameID]) + 1
    );
  }

  function createGamePlayProof(
    Game.ID gameID,
    Game.PlayID gamePlayID,
    bytes32 playProof
  ) internal {
    playProofs[gameID][gamePlayID] = playProof;
    playProofCounts[gameID] = Game.PlayID.wrap(
      Game.PlayID.unwrap(playProofCounts[gameID]) + 1
    );
  }

  function allProofsAreUploaded(Game.ID gameID) internal view returns (bool) {
    return
      Game.PlayID.unwrap(playProofCounts[gameID]) ==
      Game.PlayID.unwrap(playCounts[gameID]);
  }

  function setMaxGamePlayCount(
    Game.ID gameID,
    uint16 maxGameMovesCount
  ) internal {
    maxPlayCounts[gameID] = Game.PlayID.wrap(maxGameMovesCount);
  }
}

contract UsingGamePlays is GamePlays {}
