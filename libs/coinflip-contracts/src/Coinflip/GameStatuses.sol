// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Game} from './Game.sol';

contract UsingGameStatuses {
    mapping(uint gameID => uint expiryTimestamp) public expiryTimestamps;

    mapping(uint gameID => Game.Status) private statuses;

    error InvalidGameStatus(
        uint gameID,
        Game.Status expected,
        Game.Status actual
    );
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

    function setGameExpiry(uint gameID, uint expiryTimestamp) internal {
        if (expiryTimestamp <= block.timestamp) {
            revert InvalidExpiryTimestamp();
        }
        expiryTimestamps[gameID] = expiryTimestamp;
    }

    function setGameStatus(uint gameID, Game.Status status) internal {
        statuses[gameID] = status;
    }

    function getGameStatus(uint gameID) public view returns (Game.Status) {
        Game.Status status = statuses[gameID];

        bool isAwaiting = status == Game.Status.AwaitingPlayers ||
            status == Game.Status.AwaitingChancesReveal;
        bool isExpired = expiryTimestamps[gameID] < block.timestamp;

        if (isAwaiting && isExpired) {
            return Game.Status.Expired;
        } else {
            return status;
        }
    }
}
