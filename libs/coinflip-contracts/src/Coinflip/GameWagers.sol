// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Game} from './Game.sol';

contract GameWagers {
    mapping(Game.ID gameID => uint wager) wagers;

    error InvalidWager();

    modifier mustBeValidWager() {
        if (msg.value <= 0) {
            revert InvalidWager();
        }

        _;
    }

    function createGameWager(Game.ID gameID, uint wager) internal {
        wagers[gameID] = wager;
    }

    function getGameWager(Game.ID gameID) internal view returns (uint) {
        return wagers[gameID];
    }
}

contract UsingGameWagers is GameWagers {}
