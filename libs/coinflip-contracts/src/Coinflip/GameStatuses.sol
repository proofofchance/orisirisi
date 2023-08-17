// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameStatuses {
  mapping(Game.ID => Game.Status) statuses;

  modifier mustBeOngoingGame(Game.ID gameID) {
    require(
      statuses[gameID] == Game.Status.Ongoing,
      'Game needs to be Ongoing'
    );

    _;
  }
}

contract UsingGameStatuses is GameStatuses {}
