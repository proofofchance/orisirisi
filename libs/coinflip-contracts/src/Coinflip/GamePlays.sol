// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract UsingGamePlays {
    mapping(uint gameID => mapping(address player => uint16 playID)) playRecord;
    mapping(uint gameID => uint16 playCount) public playCounts;
    mapping(uint gameID => uint16 numberOfPlayers) numberOfPlayersPerGame;
    mapping(uint gameID => mapping(Coin.Side coinSide => address[] player)) players;
    mapping(uint gameID => mapping(Coin.Side coinSide => uint16 coinSideCount)) coinSideCounts;
    mapping(uint gameID => address[] player) allPlayers;
    mapping(uint gameID => mapping(uint16 playID => bytes32 proofOfChance))
        public proofOfChances;

    event GamePlayCreated(
        uint indexed gameID,
        uint16 indexed gamePlayID,
        address indexed player,
        Coin.Side coinSide,
        bytes32 proofOfChance
    );

    error AllMatchingPlaysError(Coin.Side availableCoinSide);
    error AlreadyPlayedError(uint16 playID);

    modifier mustAvoidAllGamePlaysMatching(uint gameID, Coin.Side coinSide) {
        uint16 playsLeft = numberOfPlayersPerGame[gameID] - playCounts[gameID];
        uint16 headPlayCount = coinSideCounts[gameID][Coin.Side.Head];
        uint16 tailPlayCount = coinSideCounts[gameID][Coin.Side.Tail];

        if (playsLeft == 1 && (headPlayCount == 0 || tailPlayCount == 0)) {
            Coin.Side availableCoinSide;
            if (headPlayCount == 0) {
                availableCoinSide = Coin.Side.Head;
            } else {
                availableCoinSide = Coin.Side.Tail;
            }

            if (coinSide != availableCoinSide) {
                revert AllMatchingPlaysError(availableCoinSide);
            }
        }

        _;
    }

    modifier mustAvoidPlayingAgain(uint gameID) {
        uint16 myPlayID = playRecord[gameID][msg.sender];

        if (myPlayID > 0) {
            revert AlreadyPlayedError(myPlayID);
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
        playCounts[gameID]++;

        emit GamePlayCreated(
            gameID,
            gamePlayID,
            msg.sender,
            coinSide,
            proofOfChance
        );
    }

    function setNumberOfPlayers(uint gameID, uint16 numberOfPlayers) internal {
        numberOfPlayersPerGame[gameID] = numberOfPlayers;
    }
}
