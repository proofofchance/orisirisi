// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Coin} from './Coin.sol';
import {Game} from './Game.sol';

contract GamePlays {
    mapping(Game.ID gameID => mapping(Game.PlayID playID => Game.Play play)) plays;
    mapping(Game.ID gameID => mapping(Coin.Side coinSide => Game.Player[] player)) players;

    mapping(Game.ID gameID => Game.PlayID playCount) playCounts;
    mapping(Game.ID gameID => Game.PlayID maxPlayCount) maxPlayCounts;

    mapping(Game.ID gameID => Game.PlayID playProofCount) playProofCounts;

    error InvalidPlayProof();
    error MaxedOutPlaysError(Game.ID gameID);
    error allMatchingPlaysError(Game.ID gameID);

    event GamePlayCreated(
        Game.PlayID playID,
        Coin.Side coinSide,
        bytes32 playHash
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

    modifier mustBeValidPlayProof(
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 playProof
    ) {
        if (
            keccak256(abi.encodePacked(playProof)) !=
            plays[gameID][gamePlayID].playHash
        ) {
            revert InvalidPlayProof();
        }

        _;
    }

    modifier mustAvoidAllGamePlaysMatching(Game.ID gameID, Coin.Side coinSide) {
        uint16 playsLeft = Game.PlayID.unwrap(maxPlayCounts[gameID]) -
            Game.PlayID.unwrap(playCounts[gameID]);
        uint16 headPlayCount = uint16(players[gameID][Coin.Side.Head].length);
        uint16 tailPlayCount = uint16(players[gameID][Coin.Side.Tail].length);

        if (playsLeft == 1 && (headPlayCount == 0 || tailPlayCount == 0)) {
            revert allMatchingPlaysError(gameID);
        }

        _;
    }

    function createGamePlay(
        Game.ID gameID,
        Coin.Side coinSide,
        bytes32 playHash
    ) internal {
        Game.PlayID gamePlayID = playCounts[gameID];
        Game.Player player = Game.Player.wrap(msg.sender);
        Game.Play memory play = Game.Play({
            player: player,
            coinSide: coinSide,
            proof: '',
            playHash: playHash
        });

        plays[gameID][gamePlayID] = play;
        players[gameID][coinSide].push(player);
        incrementPlayCount(gameID);

        emit GamePlayCreated(gamePlayID, coinSide, playHash);
    }

    function createGamePlayProof(
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 playProof
    ) internal mustBeValidPlayProof(gameID, gamePlayID, playProof) {
        plays[gameID][gamePlayID].proof = playProof;
        incrementPlayProofCount(gameID);
    }

    function allProofsAreUploaded(Game.ID gameID) internal view returns (bool) {
        return
            Game.PlayID.unwrap(playProofCounts[gameID]) ==
            Game.PlayID.unwrap(playCounts[gameID]);
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
