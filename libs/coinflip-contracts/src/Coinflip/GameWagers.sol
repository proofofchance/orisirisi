// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameWagers {
  mapping(Game.ID gameID => Game.Wager wager) wagers;

  modifier mustBeValidWager() {
    require(msg.value > 0, 'Wager must be greater than 0');

    _;
  }

  function createGameWager(Game.ID gameID, uint wager) public {
    wagers[gameID] = Game.Wager.wrap(wager);
  }

  function getGameWager(Game.ID gameID) public view returns (uint) {
    return Game.Wager.unwrap(wagers[gameID]);
  }
}

contract UsingGameWagers is GameWagers {}
