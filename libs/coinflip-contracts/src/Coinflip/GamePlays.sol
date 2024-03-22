// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract UsingGamePlays {
    mapping(uint gameID => mapping(uint16 playID => bytes32 proofOfChance))
        public proofOfChances;
    mapping(uint gameID => uint16 playCount) public playCountsSoFar;
    mapping(uint gameID => uint16 numberOfPlayers)
        public numberOfPlayersForGameWith;
    mapping(uint gameID => mapping(Coin.Side coinSide => address[] player))
        public players;
    mapping(uint gameID => address[] player) public allPlayers;

    mapping(uint gameID => mapping(address player => uint16 playID))
        private playRecord;
    mapping(uint gameID => mapping(Coin.Side coinSide => uint16 coinSideCount))
        private coinSideCounts;

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
        uint16 playsLeft = numberOfPlayersForGameWith[gameID] -
            playCountsSoFar[gameID];
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

    /// @notice Curbs ambiguity when players prove their chances
    modifier mustAvoidPlayingAgain(uint gameID) {
        uint16 myPlayID = playRecord[gameID][msg.sender];

        if (myPlayID > 0) {
            revert AlreadyPlayedError(myPlayID);
        }

        _;
    }

    function createGamePlay(
        address player,
        uint gameID,
        Coin.Side coinSide,
        bytes32 proofOfChance
    ) internal {
        uint16 gamePlayID = playCountsSoFar[gameID] + 1;
        playRecord[gameID][player] = gamePlayID;
        proofOfChances[gameID][gamePlayID] = proofOfChance;
        players[gameID][coinSide].push(player);
        allPlayers[gameID].push(player);
        coinSideCounts[gameID][coinSide]++;
        playCountsSoFar[gameID]++;

        emit GamePlayCreated(
            gameID,
            gamePlayID,
            player,
            coinSide,
            proofOfChance
        );
    }

    function setNumberOfPlayers(uint gameID, uint16 numberOfPlayers) internal {
        numberOfPlayersForGameWith[gameID] = numberOfPlayers;
    }
}
