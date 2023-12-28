// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Game} from './Game.sol';

contract GameStatuses {
    mapping(uint => Game.Status) statuses;
    mapping(uint => uint) expiryTimestamps;

    error InvalidGameStatus(uint, Game.Status expected, Game.Status actual);
    error GameMustbeConcludedError(uint);
    error InvalidExpiryTimestamp();

    modifier mustBeOngoingGame(uint gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus != Game.Status.Ongoing) {
            revert InvalidGameStatus(gameID, Game.Status.Ongoing, gameStatus);
        }

        _;
    }

    modifier mustBeExpiredGame(uint gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus != Game.Status.Expired) {
            revert InvalidGameStatus(gameID, Game.Status.Expired, gameStatus);
        }

        _;
    }

    function setGameStatusAsOngoing(
        uint gameID,
        uint expiryTimestamp
    ) internal {
        if (expiryTimestamp <= block.timestamp) {
            revert InvalidExpiryTimestamp();
        }

        assert(statuses[gameID] == Game.Status.Ongoing);

        expiryTimestamps[gameID] = expiryTimestamp;
    }

    function setGameStatusAsConcluded(uint gameID) internal {
        statuses[gameID] = Game.Status.Concluded;
    }

    function getGameStatus(uint gameID) internal view returns (Game.Status) {
        if (expiryTimestamps[gameID] < block.timestamp) {
            return Game.Status.Expired;
        }
        return statuses[gameID];
    }
}

contract UsingGameStatuses is GameStatuses {}
