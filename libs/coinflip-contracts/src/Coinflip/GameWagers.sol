// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameWagers {
  mapping(Game.ID gameID => Game.Wager wager) wagers;
  mapping(Game.ID gameID => Game.Wager totalWager) totalWagers;

  modifier mustPayGameWager(Game.ID gameID) {
    require(
      Game.Wager.unwrap(wagers[gameID]) <= msg.value,
      'Must pay Game wager'
    );

    _;
  }

  function createGameWager(Game.ID gameID, uint wager) public {
    wagers[gameID] = Game.Wager.wrap(wager);
  }

  function updateTotalWagers(Game.ID gameID, uint wager) public {
    totalWagers[gameID] = Game.Wager.wrap(wager);
  }

  function getTotalWagerAmount(Game.ID gameID) public view returns (uint) {
    return Game.Wager.unwrap(totalWagers[gameID]);
  }
}

contract UsingGameWagers is GameWagers {}
