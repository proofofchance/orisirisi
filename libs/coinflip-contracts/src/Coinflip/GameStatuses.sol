// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import {Game} from './Game.sol';

contract UsingGameStatuses {
    mapping(uint gameID => Game.Status) statuses;
    mapping(uint gameID => uint expiryTimestamp) expiryTimestamps;

    error InvalidGameStatus(uint, Game.Status expected, Game.Status actual);
    error InvalidExpiryTimestamp();

    modifier mustMatchGameStatus(uint gameID, Game.Status expectedGameStatus) {
        Game.Status actualGameStatus = getGameStatus(gameID);

        if (actualGameStatus != expectedGameStatus) {
            revert InvalidGameStatus(
                gameID,
                expectedGameStatus,
                actualGameStatus
            );
        }

        _;
    }

    function setGameStatusAsAwaitingPlayers(
        uint gameID,
        uint expiryTimestamp
    ) internal {
        if (expiryTimestamp <= block.timestamp) {
            revert InvalidExpiryTimestamp();
        }
        expiryTimestamps[gameID] = expiryTimestamp;
    }

    function setGameStatusAsAwaitingChancesUpload(uint gameID) internal {
        statuses[gameID] = Game.Status.AwaitingChancesUpload;
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
