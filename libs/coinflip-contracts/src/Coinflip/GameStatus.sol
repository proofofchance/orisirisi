// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameStatus {
  mapping(Game.ID => Game.Status) statuses;

  modifier mustBeOngoingGame(Game.ID gameID) {
    require(
      statuses[gameID] == Game.Status.Ongoing,
      'Game needs to be Ongoing'
    );

    _;
  }
}

contract UsingGameStatus is GameStatus {}
