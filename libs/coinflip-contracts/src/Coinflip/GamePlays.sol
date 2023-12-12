// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract GamePlays {
    mapping(Game.ID gameID => mapping(address player => Game.PlayID playID)) playRecord;

    mapping(Game.ID gameID => mapping(Game.PlayID playID => bytes32 playHash)) playHashes;
    mapping(Game.ID gameID => mapping(Game.PlayID playID => bytes32 playProof)) playProofs;

    mapping(Game.ID gameID => mapping(Coin.Side coinSide => Game.Player[] player)) players;
    mapping(Game.ID gameID => mapping(Coin.Side coinSide => uint16 coinSideCount)) coinSideCounts;

    mapping(Game.ID gameID => Game.PlayID playCount) public playCounts;
    mapping(Game.ID gameID => Game.PlayID maxPlayCount) maxPlayCounts;
    mapping(Game.ID gameID => Game.PlayID playProofCount) playProofCounts;

    error InvalidPlayProof();
    error MaxedOutPlaysError(Game.ID gameID);
    error PendingGamePlaysError(Game.ID gameID, uint16 pendingGamePlaysCount);
    error AllMatchingPlaysError(Game.ID gameID, Coin.Side availableCoinSide);
    error AlreadyPlayedError(Game.ID gameID, Game.PlayID playID);

    event GamePlayCreated(
        Game.PlayID gamePlayID,
        Game.ID gameID,
        Coin.Side coinSide,
        address player,
        bytes32 playHash
    );

    event GamePlayProofCreated(
        Game.PlayID gamePlayID,
        Game.ID gameID,
        address player,
        bytes32 playProof
    );

    modifier mustAvoidGameWithMaxedOutPlays(Game.ID gameID) {
        if (
            Game.PlayID.unwrap(playCounts[gameID]) ==
            Game.PlayID.unwrap(maxPlayCounts[gameID])
        ) {
            revert MaxedOutPlaysError(gameID);
        }

        _;
    }

    modifier mustBeGameWithMaxedOutPlays(Game.ID gameID) {
        uint16 playCount = Game.PlayID.unwrap(playCounts[gameID]);
        uint16 maxPlayCount = Game.PlayID.unwrap(maxPlayCounts[gameID]);

        if (playCount < maxPlayCount) {
            revert PendingGamePlaysError(gameID, maxPlayCount - playCount);
        }

        _;
    }

    modifier mustBeValidPlayProof(
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 playProof
    ) {
        if (
            keccak256(abi.encodePacked(playProof)) !=
            playHashes[gameID][gamePlayID]
        ) {
            revert InvalidPlayProof();
        }

        _;
    }

    modifier mustAvoidAllGamePlaysMatching(Game.ID gameID, Coin.Side coinSide) {
        uint16 playsLeft = Game.PlayID.unwrap(maxPlayCounts[gameID]) -
            Game.PlayID.unwrap(playCounts[gameID]);

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

    modifier mustAvoidPlayingAgain(Game.ID gameID) {
        Game.PlayID myPlayID = playRecord[gameID][msg.sender];

        if (Game.PlayID.unwrap(myPlayID) > 0) {
            revert AlreadyPlayedError(gameID, myPlayID);
        }

        _;
    }

    function createGamePlay(
        Game.ID gameID,
        Coin.Side coinSide,
        bytes32 playHash
    ) internal {
        Game.PlayID gamePlayID = Game.PlayID.wrap(
            Game.PlayID.unwrap(playCounts[gameID]) + 1
        );
        playRecord[gameID][msg.sender] = gamePlayID;
        playHashes[gameID][gamePlayID] = playHash;
        Game.Player player = Game.Player.wrap(msg.sender);
        players[gameID][coinSide].push(player);
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
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 playProof
    ) internal mustBeValidPlayProof(gameID, gamePlayID, playProof) {
        playProofs[gameID][gamePlayID] = playProof;
        incrementPlayProofCount(gameID);

        emit GamePlayProofCreated(gamePlayID, gameID, msg.sender, playProof);
    }

    function allProofsAreUploaded(Game.ID gameID) internal view returns (bool) {
        return
            Game.PlayID.unwrap(playProofCounts[gameID]) ==
            Game.PlayID.unwrap(playCounts[gameID]);
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

    function incrementPlayCount(Game.ID gameID) private {
        playCounts[gameID] = Game.PlayID.wrap(
            Game.PlayID.unwrap(playCounts[gameID]) + 1
        );
    }

    function incrementPlayProofCount(Game.ID gameID) private {
        playProofCounts[gameID] = Game.PlayID.wrap(
            Game.PlayID.unwrap(playProofCounts[gameID]) + 1
        );
    }

    function setMaxGamePlayCount(
        Game.ID gameID,
        uint16 maxGameMovesCount
    ) internal {
        maxPlayCounts[gameID] = Game.PlayID.wrap(maxGameMovesCount);
    }
}

contract UsingGamePlays is GamePlays {}
