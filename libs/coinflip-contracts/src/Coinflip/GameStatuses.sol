// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Game} from './Game.sol';

contract GameStatuses {
    mapping(Game.ID => Game.Status) statuses;
    mapping(Game.ID => uint) expiryTimestamps;

    error InvalidGameStatus(Game.ID, Game.Status expected, Game.Status actual);
    error InvalidGameStatus2(
        Game.ID,
        Game.Status expected1,
        Game.Status expected2,
        Game.Status actual
    );

    error InvalidExpiryTimestamp();

    modifier mustBeOngoingGame(Game.ID gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus != Game.Status.Ongoing) {
            revert InvalidGameStatus(gameID, Game.Status.Ongoing, gameStatus);
        }

        _;
    }

    modifier mustBeWinnersUnresolvedGame(Game.ID gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus != Game.Status.WinnersUnresolved) {
            revert InvalidGameStatus(
                gameID,
                Game.Status.WinnersUnresolved,
                gameStatus
            );
        }

        _;
    }

    modifier mustBeExpiredGame(Game.ID gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus != Game.Status.Expired) {
            revert InvalidGameStatus(gameID, Game.Status.Expired, gameStatus);
        }

        _;
    }

    modifier mustBeWinnersUnresolvedOrExpiredGame(Game.ID gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (
            gameStatus != Game.Status.WinnersUnresolved ||
            gameStatus != Game.Status.Expired
        ) {
            revert InvalidGameStatus2(
                gameID,
                Game.Status.WinnersUnresolved,
                Game.Status.Expired,
                gameStatus
            );
        }

        _;
    }

    function setGameStatusAsOngoing(
        Game.ID gameID,
        uint expiryTimestamp
    ) internal {
        if (expiryTimestamp <= block.timestamp) {
            revert InvalidExpiryTimestamp();
        }

        assert(statuses[gameID] == Game.Status.Ongoing);

        expiryTimestamps[gameID] = expiryTimestamp;
    }

    function setGameStatusAsConcluded(Game.ID gameID) internal {
        Game.Status gameStatus = getGameStatus(gameID);
        assert(
            gameStatus == Game.Status.WinnersUnresolved ||
                gameStatus == Game.Status.Expired
        );

        statuses[gameID] = Game.Status.Concluded;
    }

    function setGameStatusAsWinnersUnresolved(Game.ID gameID) internal {
        assert(statuses[gameID] == Game.Status.Ongoing);

        statuses[gameID] = Game.Status.WinnersUnresolved;
    }

    function getGameStatus(Game.ID gameID) internal view returns (Game.Status) {
        if (expiryTimestamps[gameID] < block.timestamp) {
            return Game.Status.Expired;
        }
        return statuses[gameID];
    }
}

contract UsingGameStatuses is GameStatuses {}
