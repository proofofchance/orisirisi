// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import 'hardhat/console.sol';

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract GamePlays {
    mapping(uint gameID => mapping(address player => uint16 playID)) playRecord;

    mapping(uint gameID => mapping(uint16 playID => bytes32 proofOfChance))
        public proofOfChances;

    mapping(uint gameID => mapping(Coin.Side coinSide => address[] player)) players;
    mapping(uint gameID => address[] player) allPlayers;
    mapping(uint gameID => mapping(Coin.Side coinSide => uint16 coinSideCount)) coinSideCounts;

    mapping(uint gameID => uint16 playCount) public playCounts;
    mapping(uint gameID => uint16 numberOfPlayers) numberOfPlayersPerGame;

    error InvalidPlayChance();
    error AllMatchingPlaysError(uint gameID, Coin.Side availableCoinSide);
    error AlreadyPlayedError(uint gameID, uint16 playID);

    event GamePlayCreated(
        uint gameID,
        uint16 gamePlayID,
        Coin.Side coinSide,
        address player,
        bytes32 proofOfChance
    );

    modifier mustAvoidAllGamePlaysMatching(uint gameID, Coin.Side coinSide) {
        uint16 playsLeft = numberOfPlayersPerGame[gameID] - playCounts[gameID];
        uint16 headPlayCount = coinSideCounts[gameID][Coin.Side.Head];
        uint16 tailPlayCount = coinSideCounts[gameID][Coin.Side.Tail];

        if (playsLeft == 1 && (headPlayCount == 0 || tailPlayCount == 0)) {
            Coin.Side availableCoinSide = getAvailableCoinSide(
                headPlayCount,
                tailPlayCount
            );

            if (coinSide != availableCoinSide) {
                revert AllMatchingPlaysError(gameID, availableCoinSide);
            }
        }

        _;
    }

    modifier mustAvoidPlayingAgain(uint gameID) {
        uint16 myPlayID = playRecord[gameID][msg.sender];

        if (myPlayID > 0) {
            revert AlreadyPlayedError(gameID, myPlayID);
        }

        _;
    }

    function createGamePlay(
        uint gameID,
        Coin.Side coinSide,
        bytes32 proofOfChance
    ) internal {
        uint16 gamePlayID = playCounts[gameID] + 1;
        playRecord[gameID][msg.sender] = gamePlayID;
        proofOfChances[gameID][gamePlayID] = proofOfChance;
        players[gameID][coinSide].push(msg.sender);
        allPlayers[gameID].push(msg.sender);
        coinSideCounts[gameID][coinSide]++;
        incrementPlayCount(gameID);

        emit GamePlayCreated(
            gameID,
            gamePlayID,
            coinSide,
            msg.sender,
            proofOfChance
        );
    }

    function getAvailableCoinSide(
        uint16 headPlayCount,
        uint16 tailPlayCount
    ) private pure returns (Coin.Side) {
        if (headPlayCount == 0) {
            return Coin.Side.Head;
        }

        assert(tailPlayCount == 0);
        return Coin.Side.Tail;
    }

    function incrementPlayCount(uint gameID) private {
        playCounts[gameID]++;
    }

    function setMaxGamePlayCount(
        uint gameID,
        uint16 maxGameMovesCount
    ) internal {
        numberOfPlayersPerGame[gameID] = maxGameMovesCount;
    }
}

contract UsingGamePlays is GamePlays {}
