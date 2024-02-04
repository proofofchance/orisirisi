// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Game} from './Game.sol';

contract UsingGameWagers {
    mapping(uint gameID => uint wager) wagers;

    function createGameWager(uint gameID, uint wager) internal {
        wagers[gameID] = wager;
    }

    function getGameWager(uint gameID) internal view returns (uint) {
        return wagers[gameID];
    }
}
