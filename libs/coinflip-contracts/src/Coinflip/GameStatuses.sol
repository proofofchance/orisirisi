// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameStatuses {
  mapping(Game.ID => Game.Status) statuses;
  mapping(Game.ID => uint) expiry_timestamps;

  modifier mustBeOngoingGame(Game.ID gameID) {
    require(
      getGameStatus(gameID) == Game.Status.Ongoing,
      'Game must to be Ongoing'
    );

    _;
  }

  modifier mustBeWinnersUnresolvedGame(Game.ID gameID) {
    require(
      getGameStatus(gameID) == Game.Status.WinnersUnresolved,
      'Game must to be WinnersUnresolved'
    );

    _;
  }

  modifier mustBeExpiredGame(Game.ID gameID) {
    require(
      getGameStatus(gameID) == Game.Status.Expired,
      'Game must to be Expired'
    );

    _;
  }

  modifier mustBeWinnersUnresolvedOrExpiredGame(Game.ID gameID) {
    Game.Status gameStatus = getGameStatus(gameID);
    require(
      gameStatus == Game.Status.WinnersUnresolved ||
        gameStatus == Game.Status.Expired,
      'Game must to be WinnersUnresolved or Expired'
    );

    _;
  }

  function setGameStatusAsOngoing(
    Game.ID gameID,
    uint expiry_timestamp
  ) public {
    require(
      expiry_timestamp > block.timestamp,
      'Expiry timestamp must be in the future'
    );

    assert(statuses[gameID] == Game.Status.Ongoing);

    expiry_timestamps[gameID] = expiry_timestamp;
  }

  function setGameStatusAsConcluded(Game.ID gameID) public {
    Game.Status gameStatus = getGameStatus(gameID);
    assert(
      gameStatus == Game.Status.WinnersUnresolved ||
        gameStatus == Game.Status.Expired
    );

    statuses[gameID] = Game.Status.Concluded;
  }

  function setGameStatusAsWinnersUnresolved(Game.ID gameID) public {
    assert(statuses[gameID] == Game.Status.Ongoing);

    statuses[gameID] = Game.Status.WinnersUnresolved;
  }

  function getGameStatus(Game.ID gameID) public view returns (Game.Status) {
    if (expiry_timestamps[gameID] < block.timestamp) {
      return Game.Status.Expired;
    }
    return statuses[gameID];
  }
}

contract UsingGameStatuses is GameStatuses {}
