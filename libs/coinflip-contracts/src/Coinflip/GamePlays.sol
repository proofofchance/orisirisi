// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract GamePlays {
    mapping(uint gameID => mapping(address player => uint16 playID)) playRecord;

    mapping(uint gameID => mapping(uint16 playID => bytes32 playHash))
        public playHashes;
    mapping(uint gameID => mapping(uint16 playID => string playProof))
        public playProofs;

    mapping(uint gameID => mapping(Coin.Side coinSide => address[] player)) players;
    mapping(uint gameID => address[] player) allPlayers;
    mapping(uint gameID => mapping(Coin.Side coinSide => uint16 coinSideCount)) coinSideCounts;

    mapping(uint gameID => uint16 playCount) public playCounts;
    mapping(uint gameID => uint16 maxPlayCount) maxPlayCounts;
    mapping(uint gameID => uint16 playProofCount) playProofCounts;

    error InvalidPlayProof();
    error MaxedOutPlaysError(uint gameID);
    error PendingGamePlaysError(uint gameID, uint16 pendingGamePlaysCount);
    error AllMatchingPlaysError(uint gameID, Coin.Side availableCoinSide);
    error AlreadyPlayedError(uint gameID, uint16 playID);

    event GamePlayCreated(
        uint16 gamePlayID,
        uint gameID,
        Coin.Side coinSide,
        address player,
        bytes32 playHash
    );

    event GamePlayProofCreated(
        uint16 gamePlayID,
        uint gameID,
        address player,
        string playProof
    );

    modifier mustAvoidGameWithMaxedOutPlays(uint gameID) {
        if (playCounts[gameID] == maxPlayCounts[gameID]) {
            revert MaxedOutPlaysError(gameID);
        }

        _;
    }

    modifier mustBeGameWithMaxedOutPlays(uint gameID) {
        uint16 playCount = playCounts[gameID];
        uint16 maxPlayCount = maxPlayCounts[gameID];

        if (playCount < maxPlayCount) {
            revert PendingGamePlaysError(gameID, maxPlayCount - playCount);
        }

        _;
    }

    modifier mustBeValidPlayProof(
        uint gameID,
        uint16 gamePlayID,
        string memory playProof
    ) {
        if (
            sha256(abi.encodePacked(playProof)) !=
            playHashes[gameID][gamePlayID]
        ) {
            revert InvalidPlayProof();
        }

        _;
    }

    modifier mustAvoidAllGamePlaysMatching(uint gameID, Coin.Side coinSide) {
        uint16 playsLeft = maxPlayCounts[gameID] - playCounts[gameID];
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
        bytes32 playHash
    ) internal {
        uint16 gamePlayID = playCounts[gameID] + 1;
        playRecord[gameID][msg.sender] = gamePlayID;
        playHashes[gameID][gamePlayID] = playHash;
        players[gameID][coinSide].push(msg.sender);
        allPlayers[gameID].push(msg.sender);
        coinSideCounts[gameID][coinSide]++;
        incrementPlayCount(gameID);

        emit GamePlayCreated(
            gamePlayID,
            gameID,
            coinSide,
            msg.sender,
            playHash
        );
    }

    function createGamePlayProof(
        uint gameID,
        uint16 gamePlayID,
        string memory playProof
    ) internal mustBeValidPlayProof(gameID, gamePlayID, playProof) {
        playProofs[gameID][gamePlayID] = playProof;
        incrementPlayProofCount(gameID);

        emit GamePlayProofCreated(gamePlayID, gameID, msg.sender, playProof);
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

    function incrementPlayProofCount(uint gameID) private {
        playProofCounts[gameID]++;
    }

    function setMaxGamePlayCount(
        uint gameID,
        uint16 maxGameMovesCount
    ) internal {
        maxPlayCounts[gameID] = maxGameMovesCount;
    }
}

contract UsingGamePlays is GamePlays {}
