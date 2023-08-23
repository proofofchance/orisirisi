// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Game} from './Game.sol';

contract GameWagers {
    mapping(Game.ID gameID => Game.Wager wager) wagers;

    error InvalidWager();

    modifier mustBeValidWager() {
        if (msg.value <= 0) {
            revert InvalidWager();
        }

        _;
    }

    function createGameWager(Game.ID gameID, uint wager) internal {
        wagers[gameID] = Game.Wager.wrap(wager);
    }

    function getGameWager(Game.ID gameID) internal view returns (uint) {
        return Game.Wager.unwrap(wagers[gameID]);
    }
}

contract UsingGameWagers is GameWagers {}
