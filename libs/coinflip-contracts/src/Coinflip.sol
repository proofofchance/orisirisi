// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import 'hardhat/console.sol';

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {MaybeOperational} from './MaybeOperational.sol';
import {ServiceProvider} from './ServiceProvider.sol';
import {Wallets} from './Wallets.sol';
import {Payments} from './Payments.sol';

contract Coinflip is
    UsingGamePlays,
    UsingGameWagers,
    UsingGameStatuses,
    MaybeOperational
{
    mapping(uint => Coin.Side) outcomes;
    uint public gamesCount;

    Wallets public immutable wallets;
    ServiceProvider public immutable serviceProvider;

    error InsufficientWalletBalance();
    error MinimumPlayCountError();

    event GameCreated(
        uint gameID,
        uint16 maxPlayCount,
        uint expiryTimestamp,
        address creator,
        uint wager
    );

    event NewGameWinner(uint gameID, address winner);

    uint public minWager;
    uint16 public maxPossibleGamePlayCount;
    error MaxPossibleGamePlayCountError(uint16 maxPossibleGamePlayCount);
    error IncompleteProofOfChancesError(uint expectedProofOfChanceSize);

    constructor(
        address payable _wallets,
        address _serviceProvider,
        uint16 _maxPossibleGamePlayCount,
        uint _minWager
    ) {
        wallets = Wallets(_wallets);
        serviceProvider = ServiceProvider(_serviceProvider);
        maxPossibleGamePlayCount = _maxPossibleGamePlayCount;
        minWager = _minWager;
    }

    receive() external payable {
        Payments.pay(address(wallets), msg.value);
    }

    /// @dev Creates a new game
    /// @param playHash Keccak256 hash of `secretLuckProof` that would
    /// be later uploaded
    function createGame(
        uint wager,
        uint16 maxGamePlayCount,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 playHash
    ) external payable mustBeOperational {
        console.log('Wager %s', wager);

        if (maxGamePlayCount < Coin.TOTAL_SIDES_COUNT) {
            revert MinimumPlayCountError();
        }

        console.log('maxGamePlayCount %s', maxGamePlayCount);

        if (maxGamePlayCount > maxPossibleGamePlayCount) {
            revert MaxPossibleGamePlayCountError(maxPossibleGamePlayCount);
        }

        uint newGameID = gamesCount + 1;
        maybeTopUpWallet();
        createGameWager(newGameID, wager);
        payGameWager(newGameID, wager);
        setMaxGamePlayCount(newGameID, maxGamePlayCount);
        setGameStatusAsOngoing(newGameID, expiryTimestamp);
        gamesCount++;

        emit GameCreated(
            newGameID,
            maxGamePlayCount,
            expiryTimestamp,
            msg.sender,
            wager
        );

        createGamePlay(newGameID, coinSide, playHash);
    }

    /// Exposed so that players can play using their wallet instead of paying directly here  */
    function playGame(
        uint gameID,
        Coin.Side coinSide,
        bytes32 playHash
    )
        external
        payable
        mustBeOperational
        mustBeOngoingGame(gameID)
        mustAvoidGameWithMaxedOutPlays(gameID)
        mustAvoidAllGamePlaysMatching(gameID, coinSide)
        mustAvoidPlayingAgain(gameID)
    {
        maybeTopUpWallet();
        uint wager = getGameWager(gameID);
        payGameWager(gameID, wager);
        createGamePlay(gameID, coinSide, playHash);
    }

    function uploadGamePlayProofsAndCreditGameWinners(
        uint gameID,
        uint16[] memory gamePlayIDs,
        string[] memory proofOfChances
    )
        external
        onlyOwner
        mustBeOngoingGame(gameID)
        mustBeGameWithMaxedOutPlays(gameID)
    {
        if (proofOfChances.length != maxPlayCounts[gameID]) {
            revert IncompleteProofOfChancesError(gameID);
        }
        require(gamePlayIDs.length == proofOfChances.length);

        for (uint16 i = 0; i < gamePlayIDs.length; i++) {
            string memory proofOfChance = proofOfChances[i];
            createGamePlayProof(gameID, gamePlayIDs[i], proofOfChance);
            updateGameOutcome(gameID, proofOfChances[i]);
        }
        address[] memory winners = players[gameID][outcomes[gameID]];
        creditGameWinners(gameID, winners);
        announceGameWinners(gameID, winners);
        setGameStatusAsConcluded(gameID);
    }

    function creditExpiredGamePlayers(
        uint gameID
    ) external onlyOwner mustBeExpiredGame(gameID) {
        address[] memory allPlayers = allPlayers[gameID];
        uint16 allPlayersSize = uint16(allPlayers.length);

        uint totalWager = getGameWager(gameID) * allPlayersSize;

        uint amountForEachPlayer = serviceProvider
            .getSplitAmountAfterServiceChargeDeduction(
                totalWager,
                allPlayersSize
            );

        wallets.creditPlayersAndCreditAppTheRest(
            gameID,
            allPlayers,
            amountForEachPlayer
        );

        setGameStatusAsConcluded(gameID);
    }

    function creditGameWinners(uint gameID, address[] memory winners) private {
        uint gameWager = getGameWager(gameID);
        uint totalWager = gameWager * playCounts[gameID];

        uint amountForEachPlayer = serviceProvider
            .getSplitAmountAfterServiceChargeDeduction(
                totalWager,
                winners.length
            );

        console.log('amountForEachWinner %s', amountForEachPlayer);

        wallets.creditPlayersAndCreditAppTheRest(
            gameID,
            winners,
            amountForEachPlayer
        );
    }

    function announceGameWinners(
        uint gameID,
        address[] memory winners
    ) private {
        for (uint16 i = 0; i < winners.length; i++) {
            emit NewGameWinner(gameID, winners[i]);
        }
    }

    function setMaxPossibleGamePlayCount(
        uint16 maxPossibleGamePlayCount_
    ) external onlyOwner {
        maxPossibleGamePlayCount = maxPossibleGamePlayCount_;
    }

    function maybeTopUpWallet() private {
        if (msg.value > 0) {
            Payments.pay(address(wallets), msg.value);
            wallets.creditPlayer(msg.sender, msg.value);
        }
    }

    function payGameWager(uint gameID, uint wager) private {
        wallets.transferToGameWallet(gameID, msg.sender, wager);
    }

    function updateGameOutcome(
        uint gameID,
        string memory proofOfChance
    ) private {
        outcomes[gameID] = Coin.flip(Game.getEntropy(proofOfChance));
    }
}
