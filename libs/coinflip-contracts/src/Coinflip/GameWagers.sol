// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import {Game} from './Game.sol';

contract UsingGameWagers {
    mapping(uint gameID => uint wager) wagers;

    error InvalidWager();

    modifier mustBeValidWager() {
        if (msg.value <= 0) {
            revert InvalidWager();
        }

        _;
    }

    function createGameWager(uint gameID, uint wager) internal {
        wagers[gameID] = wager;
    }

    function getGameWager(uint gameID) internal view returns (uint) {
        return wagers[gameID];
    }
}
